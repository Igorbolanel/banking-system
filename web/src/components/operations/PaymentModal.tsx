import { useState } from 'react';
import type { CSSProperties } from 'react';

import { categoriesFor, detectCategory, getCategory } from '../../operations/categories';
import { currencySign, formatMoney, maskAccount } from '../../operations/format';
import type { OperationsAccount, PaymentPayload } from '../../operations/types';
import { CategoryIcon } from './Icon';
import Modal from './Modal';

interface PaymentModalProps {
  accounts: OperationsAccount[];
  defaultAccountId?: string;
  /** Текст, почему оплата недоступна (например, сервер не отвечает). */
  disabledReason?: string | null;
  onClose: () => void;
  onSubmit: (payload: PaymentPayload) => Promise<void>;
}

const QUICK_MERCHANTS = ['Пятёрочка', 'Яндекс Go', 'OZON', 'РЖД', 'Кинопоиск', 'Вкусно и точка', 'Аптека Ригла'];
const PAYMENT_CATEGORIES = categoriesFor('EXPENSE').filter(
  (category) => category.code !== 'TRANSFERS' && category.code !== 'CURRENCY_EXCHANGE',
);

function isActive(account: OperationsAccount): boolean {
  return !account.status || account.status.toLowerCase() === 'active';
}

function PaymentModal({ accounts, defaultAccountId, disabledReason, onClose, onSubmit }: PaymentModalProps) {
  const active = accounts.filter(isActive);
  const [accountId, setAccountId] = useState(
    defaultAccountId && active.some((account) => account.id === defaultAccountId) ? defaultAccountId : active[0]?.id ?? '',
  );
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [manualCategory, setManualCategory] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const account = active.find((item) => item.id === accountId);
  const detected = detectCategory(merchant);
  const category = getCategory(manualCategory ?? detected ?? 'OTHER');
  const value = Number(amount.replace(/\s/g, '').replace(',', '.'));
  const validAmount = Number.isFinite(value) && value > 0;
  const currency = account?.currency ?? 'RUB';

  const submit = async () => {
    if (disabledReason) {
      setError(disabledReason);
      return;
    }
    if (!account) {
      setError('Выберите счёт списания');
      return;
    }
    if (!merchant.trim()) {
      setError('Укажите, где совершена покупка');
      return;
    }
    if (!validAmount) {
      setError('Введите сумму больше нуля');
      return;
    }
    if (typeof account.balance === 'number' && value > account.balance) {
      setError('На выбранном счёте недостаточно средств');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        accountId: account.id,
        amount: Math.round(value * 100) / 100,
        merchant: merchant.trim(),
        category: category.code,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось провести оплату');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Новая покупка"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ops-button ops-button--ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="ops-button ops-button--primary"
            disabled={submitting || active.length === 0}
            onClick={() => {
              void submit();
            }}
          >
            {submitting ? 'Проводим…' : validAmount ? `Оплатить ${formatMoney(value, currency)}` : 'Оплатить'}
          </button>
        </>
      }
    >
      <div className="ops-form">
        <label className="ops-field">
          <span>Счёт списания</span>
          <select className="ops-select" value={accountId} onChange={(event) => setAccountId(event.target.value)}>
            {active.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {maskAccount(item.number)}
                {typeof item.balance === 'number' ? ` — ${formatMoney(item.balance, item.currency)}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="ops-field">
          <span>Где покупка</span>
          <input
            className="ops-input"
            value={merchant}
            maxLength={120}
            placeholder="Например, Пятёрочка"
            onChange={(event) => setMerchant(event.target.value)}
          />
        </label>
        <div className="ops-quick" aria-label="Быстрый выбор магазина">
          {QUICK_MERCHANTS.map((name) => (
            <button key={name} type="button" className="ops-quick__item" onClick={() => setMerchant(name)}>
              {name}
            </button>
          ))}
        </div>

        <label className="ops-field">
          <span>Категория</span>
          <span className="ops-field__with-icon">
            <span className="ops-bubble ops-bubble--sm" style={{ '--chip': category.color } as CSSProperties}>
              <CategoryIcon name={category.icon} size={15} color="#fff" strokeWidth={2.3} />
            </span>
            <select
              className="ops-select"
              value={category.code}
              onChange={(event) => setManualCategory(event.target.value)}
            >
              {PAYMENT_CATEGORIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </span>
          {!manualCategory && detected && <small className="ops-field__hint">Определили по названию магазина</small>}
        </label>

        <label className="ops-field">
          <span>Сумма</span>
          <span className="ops-field__money">
            <input
              className="ops-input"
              inputMode="decimal"
              value={amount}
              placeholder="0"
              onChange={(event) => setAmount(event.target.value.replace(/[^\d.,\s]/g, ''))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void submit();
                }
              }}
            />
            <span aria-hidden="true">{currencySign(currency)}</span>
          </span>
        </label>

        {error && (
          <p className="ops-note ops-note--error" role="alert">
            {error}
          </p>
        )}
        {disabledReason && !error && <p className="ops-note">{disabledReason}</p>}
      </div>
    </Modal>
  );
}

export default PaymentModal;
