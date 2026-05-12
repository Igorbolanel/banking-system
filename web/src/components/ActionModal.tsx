import { useState, type FormEvent } from 'react';
import { accounts } from '../data/mockData';
import type { Action } from '../types/banking';
import { formatMoney } from '../utils/formatters';

interface ActionModalProps {
  action: Action | null;
  onClose: () => void;
}

const titleMap: Record<Action, string> = {
  topup: 'Пополнение счёта',
  transfer: 'Перевод средств',
  pay: 'Оплата услуг',
  exchange: 'Обмен валюты',
  openAccount: 'Открытие счёта',
};

function ActionModal({ action, onClose }: ActionModalProps) {
  const [submitted, setSubmitted] = useState(false);

  if (!action) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <button className="modal__backdrop" type="button" onClick={onClose} aria-label="Закрыть" />

      <section className="modal__content">
        <div className="modal__head">
          <h2>{titleMap[action]}</h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {submitted ? (
          <div className="success-state">
            <strong>Заявка создана</strong>
            <p>Когда backend будет подключён, операция будет отправляться в Core Service.</p>
            <button type="button" onClick={onClose}>
              Готово
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            {action !== 'openAccount' && (
              <label>
                Счёт списания
                <select>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} — {formatMoney(account.balance, account.currency)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {action === 'transfer' && (
              <label>
                Номер счёта получателя
                <input placeholder="40817810000000000000" />
              </label>
            )}

            {action === 'pay' && (
              <label>
                Получатель
                <input placeholder="Мобильная связь, ЖКХ, интернет" />
              </label>
            )}

            {action === 'exchange' && (
              <div className="form__grid">
                <label>
                  Из валюты
                  <select>
                    <option>RUB</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </label>
                <label>
                  В валюту
                  <select>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>CNY</option>
                  </select>
                </label>
              </div>
            )}

            {action === 'openAccount' && (
              <>
                <label>
                  Название счёта
                  <input placeholder="Например, счёт для поездки" />
                </label>
                <label>
                  Валюта
                  <select>
                    <option>RUB</option>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>CNY</option>
                  </select>
                </label>
              </>
            )}

            {action !== 'openAccount' && (
              <label>
                Сумма
                <input min="1" placeholder="0" type="number" />
              </label>
            )}

            <button className="button-primary" type="submit">
              Продолжить
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default ActionModal;
