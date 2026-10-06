import { useMemo, useState } from 'react';

import type { Account, Action, CurrencyCode, CurrencyRate } from '../types/banking';
import { convertAmount } from '../utils/calculations';
import { formatMoney, formatRate, getCurrencySymbol, groupAccountNumber } from '../utils/formatters';
import Modal from './operations/Modal';

type FormAction = Exclude<Action, 'pay'>;
type TransferMode = 'own' | 'external';

interface ActionModalProps {
  action: FormAction;
  accounts: Account[];
  rates: CurrencyRate[];
  defaultAccountId?: string;
  defaultMode?: TransferMode;
  onClose: () => void;
  onSubmit: (action: Action, payload: Record<string, string | number>) => Promise<boolean>;
}

const TITLES: Record<FormAction, string> = {
  topup: 'Пополнение счёта',
  transfer: 'Перевод',
  exchange: 'Обмен валюты',
  openAccount: 'Новый счёт',
};

const DESCRIPTIONS: Record<FormAction, string> = {
  topup: 'Деньги поступят на выбранный счёт сразу.',
  transfer: 'Между своими счетами или другому клиенту МИК Банка по номеру счёта.',
  exchange: 'Деньги спишутся со счёта и поступят на ваш счёт в выбранной валюте. Если такого счёта нет, он откроется автоматически.',
  openAccount: 'Счёт откроется сразу. Номер счёта можно будет скопировать на странице «Счета».',
};

const CURRENCIES: Array<{ code: CurrencyCode; label: string }> = [
  { code: 'RUB', label: 'Российский рубль' },
  { code: 'USD', label: 'Доллар США' },
  { code: 'EUR', label: 'Евро' },
];

const QUICK_AMOUNTS = [1000, 5000, 10000];

function parseAmount(value: string) {
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function preferredAccount(accounts: Account[]) {
  return [...accounts].sort((left, right) => {
    if (left.currency === 'RUB' && right.currency !== 'RUB') return -1;
    if (left.currency !== 'RUB' && right.currency === 'RUB') return 1;
    return right.balance - left.balance;
  })[0];
}

function rateLine(from: CurrencyCode, to: CurrencyCode, rates: CurrencyRate[]) {
  const foreign = from === 'RUB' ? to : from;
  const base = from === 'RUB' || to === 'RUB' ? 'RUB' : to;
  const value = convertAmount(1, foreign, base, rates);
  if (!Number.isFinite(value)) return 'Курс сейчас недоступен';
  return `1 ${foreign} = ${formatRate(value)} ${getCurrencySymbol(base)}`;
}

function ActionModal({ action, accounts, rates, defaultAccountId, defaultMode = 'own', onClose, onSubmit }: ActionModalProps) {
  const active = useMemo(() => accounts.filter((account) => account.status === 'active'), [accounts]);
  const initial = active.find((account) => account.id === defaultAccountId) ?? preferredAccount(active);

  const [accountId, setAccountId] = useState(initial?.id ?? '');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<TransferMode>(active.length > 1 ? defaultMode : 'external');
  const [toAccountId, setToAccountId] = useState(() => active.find((account) => account.id !== initial?.id)?.id ?? '');
  const [externalNumber, setExternalNumber] = useState('');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(initial?.currency === 'USD' ? 'RUB' : 'USD');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('RUB');
  const [type, setType] = useState<Account['type']>('debit');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const account = active.find((item) => item.id === accountId);
  const destinations = active.filter((item) => item.id !== accountId);
  const destination = destinations.find((item) => item.id === toAccountId) ?? destinations[0];
  const value = parseAmount(amount);
  const sign = getCurrencySymbol(account?.currency ?? 'RUB');

  const errors: Partial<Record<'account' | 'amount' | 'destination' | 'currency', string>> = {};
  if (action !== 'openAccount') {
    if (!account) errors.account = 'Сначала откройте счёт';
    if (value <= 0) {
      errors.amount = 'Введите сумму больше нуля';
    } else if ((action === 'transfer' || action === 'exchange') && account && value > account.balance) {
      errors.amount = `Недостаточно средств: доступно ${formatMoney(account.balance, account.currency)}`;
    }
  }
  if (action === 'transfer') {
    if (mode === 'own' && !destination) {
      errors.destination = 'Других счетов нет — откройте второй счёт или переведите по номеру';
    }
    if (mode === 'external') {
      const digits = externalNumber.replace(/\s/g, '');
      if (digits.length !== 20) errors.destination = 'Номер счёта состоит из 20 цифр';
      else if (account && account.number === digits) errors.destination = 'Нельзя перевести на тот же счёт';
    }
  }
  if (action === 'exchange' && account && toCurrency === account.currency) {
    errors.currency = 'Выберите другую валюту';
  }
  const valid = Object.keys(errors).length === 0;

  const changeAccount = (id: string) => {
    setAccountId(id);
    const next = active.find((item) => item.id === id);
    if (next && next.currency === toCurrency) {
      setToCurrency(next.currency === 'RUB' ? 'USD' : 'RUB');
    }
    if (toAccountId === id) {
      setToAccountId(active.find((item) => item.id !== id)?.id ?? '');
    }
  };

  const submit = async () => {
    setTouched(true);
    if (!valid || submitting) return;

    let payload: Record<string, string | number>;
    if (action === 'openAccount') {
      payload = { name, currency, type };
    } else if (action === 'transfer') {
      payload = {
        accountId,
        amount: value,
        transferMode: mode,
        toAccountNumber: mode === 'own' ? destination?.number ?? '' : externalNumber.replace(/\s/g, ''),
      };
    } else if (action === 'exchange') {
      payload = { accountId, amount: value, toCurrency };
    } else {
      payload = { accountId, amount: value };
    }

    setSubmitting(true);
    try {
      const ok = await onSubmit(action, payload);
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const money = account && value > 0 ? formatMoney(value, account.currency) : '';
  const submitLabel =
    action === 'openAccount'
      ? 'Открыть счёт'
      : action === 'topup'
        ? money ? `Пополнить на ${money}` : 'Пополнить'
        : action === 'transfer'
          ? money ? `Перевести ${money}` : 'Перевести'
          : money ? `Обменять ${money}` : 'Обменять';

  const exchangeEstimate = account && value > 0 ? convertAmount(value, account.currency, toCurrency, rates) : NaN;
  const transferEstimate =
    action === 'transfer' && mode === 'own' && account && destination && destination.currency !== account.currency && value > 0
      ? convertAmount(value, account.currency, destination.currency, rates)
      : NaN;

  return (
    <Modal
      title={TITLES[action]}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={submitting || (touched && !valid)}
            onClick={() => {
              void submit();
            }}
          >
            {submitting ? 'Выполняем…' : submitLabel}
          </button>
        </>
      }
    >
      <div className="form">
        <p className="hint">{DESCRIPTIONS[action]}</p>

        {action === 'openAccount' ? (
          <>
            <label className="field">
              <span className="field__label">Название, если хотите</span>
              <input className="input" value={name} maxLength={40} placeholder="Например, На отпуск" onChange={(event) => setName(event.target.value)} />
            </label>
            <div className="field">
              <span className="field__label">Валюта</span>
              <div className="choice-grid">
                {CURRENCIES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={`choice${currency === item.code ? ' is-active' : ''}`}
                    aria-pressed={currency === item.code}
                    onClick={() => setCurrency(item.code)}
                  >
                    <strong>
                      {getCurrencySymbol(item.code)} {item.code}
                    </strong>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="field__label">Тип счёта</span>
              <div className="choice-grid">
                <button type="button" className={`choice${type === 'debit' ? ' is-active' : ''}`} aria-pressed={type === 'debit'} onClick={() => setType('debit')}>
                  <strong>Текущий</strong>
                  <span>Для пополнений, переводов и покупок</span>
                </button>
                <button type="button" className={`choice${type === 'saving' ? ' is-active' : ''}`} aria-pressed={type === 'saving'} onClick={() => setType('saving')}>
                  <strong>Накопительный</strong>
                  <span>12,5% годовых, проценты начисляются автоматически</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {action === 'transfer' && active.length > 1 && (
              <div className="segmented segmented--block" role="radiogroup" aria-label="Куда перевести">
                <button type="button" role="radio" aria-checked={mode === 'own'} className={mode === 'own' ? 'is-active' : undefined} onClick={() => setMode('own')}>
                  Между своими
                </button>
                <button type="button" role="radio" aria-checked={mode === 'external'} className={mode === 'external' ? 'is-active' : undefined} onClick={() => setMode('external')}>
                  По номеру счёта
                </button>
              </div>
            )}

            <label className="field">
              <span className="field__label">{action === 'topup' ? 'Куда зачислить' : 'Откуда'}</span>
              <select className="select" value={accountId} onChange={(event) => changeAccount(event.target.value)}>
                {active.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} •{item.number.slice(-4)} — {formatMoney(item.balance, item.currency)}
                  </option>
                ))}
              </select>
              {touched && errors.account && <p className="error-text">{errors.account}</p>}
            </label>

            {action === 'transfer' &&
              (mode === 'own' ? (
                destination ? (
                  <label className="field">
                    <span className="field__label">Куда</span>
                    <select className="select" value={destination.id} onChange={(event) => setToAccountId(event.target.value)}>
                      {destinations.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} •{item.number.slice(-4)} — {formatMoney(item.balance, item.currency)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="error-text">{errors.destination}</p>
                )
              ) : (
                <label className="field">
                  <span className="field__label">Номер счёта получателя</span>
                  <input
                    className={`input${touched && errors.destination ? ' is-invalid' : ''}`}
                    inputMode="numeric"
                    value={externalNumber}
                    placeholder="4081 7810 0000 0000 0000"
                    onChange={(event) => setExternalNumber(groupAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 20)))}
                  />
                  {touched && errors.destination ? (
                    <p className="error-text">{errors.destination}</p>
                  ) : (
                    <span className="hint">20 цифр — получатель может скопировать номер на странице «Счета»</span>
                  )}
                </label>
              ))}

            {action === 'exchange' && (
              <div className="field">
                <span className="field__label">Какую валюту получить</span>
                <div className="segmented segmented--block" role="radiogroup" aria-label="Валюта">
                  {CURRENCIES.filter((item) => item.code !== account?.currency).map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      role="radio"
                      aria-checked={toCurrency === item.code}
                      className={toCurrency === item.code ? 'is-active' : undefined}
                      onClick={() => setToCurrency(item.code)}
                    >
                      {getCurrencySymbol(item.code)} {item.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <div className="field__row">
                <span className="field__label">Сумма</span>
                {account && action !== 'topup' && account.balance > 0 && (
                  <button type="button" className="link-btn" style={{ fontSize: 13 }} onClick={() => setAmount(String(account.balance))}>
                    Всё: {formatMoney(account.balance, account.currency)}
                  </button>
                )}
              </div>
              <div className="money-field">
                <input
                  className={`input input--money${touched && errors.amount ? ' is-invalid' : ''}`}
                  inputMode="decimal"
                  aria-label="Сумма"
                  value={amount}
                  placeholder="0"
                  onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ''))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void submit();
                  }}
                />
                <span className="money-field__sign">{sign}</span>
              </div>
              {action === 'topup' && (
                <div className="chips">
                  {QUICK_AMOUNTS.map((quick) => (
                    <button key={quick} type="button" className="chip" onClick={() => setAmount(String(quick))}>
                      {formatMoney(quick, account?.currency ?? 'RUB')}
                    </button>
                  ))}
                </div>
              )}
              {touched && errors.amount && <p className="error-text">{errors.amount}</p>}
            </div>

            {action === 'exchange' && account && value > 0 && (
              <div className="summary-box">
                <span className="muted">Вы получите примерно</span>
                <strong>{Number.isFinite(exchangeEstimate) ? formatMoney(Math.round(exchangeEstimate * 100) / 100, toCurrency) : 'курс недоступен'}</strong>
                <span className="hint">{rateLine(account.currency, toCurrency, rates)}</span>
              </div>
            )}
            {Number.isFinite(transferEstimate) && destination && (
              <div className="summary-box">
                <span className="muted">Поступит на «{destination.name}» примерно</span>
                <strong>{formatMoney(Math.round(transferEstimate * 100) / 100, destination.currency)}</strong>
                <span className="hint">Валюты счетов разные — сумма пересчитается по курсу банка</span>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default ActionModal;
