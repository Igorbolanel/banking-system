import { useState } from 'react';

import { UiIcon } from '../components/operations/Icon';
import type { Account, Action, CurrencyCode, CurrencyRate } from '../types/banking';
import { convertAmount, toRub } from '../utils/calculations';
import { formatMoney, formatRate, getCurrencySymbol, maskAccountNumber } from '../utils/formatters';

interface CurrencyPageProps {
  rates: CurrencyRate[];
  accounts: Account[];
  onAction: (action: Action, accountId?: string) => void;
}

const NAMES: Record<CurrencyCode, string> = { RUB: 'Российский рубль', USD: 'Доллар США', EUR: 'Евро' };
const CODES: CurrencyCode[] = ['USD', 'EUR', 'RUB'];

function CurrencyPage({ rates, accounts, onAction }: CurrencyPageProps) {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState<CurrencyCode>('USD');
  const [to, setTo] = useState<CurrencyCode>('RUB');

  const value = Number(amount.replace(/\s/g, '').replace(',', '.')) || 0;
  const result = convertAmount(value, from, to, rates);
  const foreign = accounts.filter((account) => account.status === 'active' && account.currency !== 'RUB');
  const ratesReady = rates.length > 0;

  const pairRate = (() => {
    if (from === to) return '';
    const base = from === 'RUB' ? to : from;
    const quote = from === 'RUB' || to === 'RUB' ? 'RUB' : to;
    const rate = convertAmount(1, base, quote, rates);
    return Number.isFinite(rate) ? `1 ${base} = ${formatRate(rate)} ${getCurrencySymbol(quote)}` : '';
  })();

  return (
    <div className="page">
      <div className="dash-grid">
        <section className="card">
          <div className="card__head">
            <h2>Калькулятор</h2>
          </div>
          <div className="converter">
            <label className="field">
              <span className="field__label">Сумма</span>
              <span className="money-field">
                <input className="input input--money" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.,\s]/g, ''))} />
                <span className="money-field__sign">{getCurrencySymbol(from)}</span>
              </span>
            </label>
            <div className="converter__row">
              <label className="field">
                <span className="field__label">Отдаёте</span>
                <select className="select" value={from} onChange={(event) => setFrom(event.target.value as CurrencyCode)}>
                  {CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}, {NAMES[code]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="icon-btn"
                aria-label="Поменять валюты местами"
                title="Поменять местами"
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                }}
              >
                <UiIcon name="swap" size={20} />
              </button>
              <label className="field">
                <span className="field__label">Получаете</span>
                <select className="select" value={to} onChange={(event) => setTo(event.target.value as CurrencyCode)}>
                  {CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}, {NAMES[code]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="converter__result" aria-live="polite">
              <span>Вы получите</span>
              <strong>
                {!ratesReady ? 'Курсы недоступны' : Number.isFinite(result) ? formatMoney(Math.round(result * 100) / 100, to) : '—'}
              </strong>
              <span>{from === to ? 'Выберите разные валюты' : pairRate}</span>
            </div>
            <button type="button" className="btn btn--primary" onClick={() => onAction('exchange')}>
              Обменять на своём счёте
            </button>
            <p className="hint">Расчёт ориентировочный: при обмене используется курс банка на момент операции.</p>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <h2>Курсы банка</h2>
          </div>
          {!ratesReady ? (
            <div className="empty">
              <p>Сервис валют сейчас не отвечает. Курсы появятся, как только он станет доступен.</p>
            </div>
          ) : (
            <>
              <table className="rates-table">
                <thead>
                  <tr>
                    <th scope="col">Валюта</th>
                    <th scope="col">Покупка</th>
                    <th scope="col">Продажа</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.code}>
                      <td>
                        {rate.code}
                        <small>{NAMES[rate.code]}</small>
                      </td>
                      <td>{formatRate(rate.buy)} ₽</td>
                      <td>{formatRate(rate.sell)} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="hint" style={{ marginTop: 12 }}>
                Покупка — курс, по которому банк покупает у вас валюту. Продажа — по которому банк её продаёт.
              </p>
            </>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card__head">
          <h2>Валютные счета</h2>
          <button type="button" className="link-btn" onClick={() => onAction('openAccount')}>
            Открыть счёт
          </button>
        </div>
        {foreign.length === 0 ? (
          <div className="empty">
            <p>Валютных счетов пока нет. Откройте счёт в долларах или евро — или обменяйте рубли, и счёт откроется автоматически.</p>
          </div>
        ) : (
          <div className="list">
            {foreign.map((account) => (
              <div key={account.id} className="list-row">
                <span className="currency-bubble">{getCurrencySymbol(account.currency)}</span>
                <span className="list-row__main">
                  <span className="list-row__title">{account.name}</span>
                  <span className="list-row__meta">{maskAccountNumber(account.number)}</span>
                </span>
                <span className="list-row__side">
                  <span className="amount">{formatMoney(account.balance, account.currency)}</span>
                  {ratesReady && <small>≈ {formatMoney(Math.round(toRub(account.balance, account.currency, rates)), 'RUB')}</small>}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CurrencyPage;
