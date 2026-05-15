import { useMemo, useState, type FormEvent } from 'react';
import type { BankingState } from '../types/banking';
import { getStatusText } from '../utils/calculations';
import { formatDateTime, formatMoney } from '../utils/formatters';

interface PaymentsPageProps {
  state: BankingState;
  onTransfer: (payload: { fromAccountId: string; toAccountNumber: string; amount: number }) => void;
  onPay: (payload: { accountId: string; title: string; amount: number }) => void;
}

function PaymentsPage({ state, onTransfer, onPay }: PaymentsPageProps) {
  const [mode, setMode] = useState<'transfer' | 'pay'>('transfer');
  const [query, setQuery] = useState('');
  const activeAccounts = state.accounts.filter((account) => account.status === 'active');

  const filteredTransactions = useMemo(
    () =>
      state.transactions.filter((tx) =>
        `${tx.title} ${tx.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [state.transactions, query],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const accountId = String(formData.get('accountId') ?? '');
    const amount = Number(formData.get('amount') ?? 0);

    if (mode === 'transfer') {
      onTransfer({
        fromAccountId: accountId,
        toAccountNumber: String(formData.get('toAccountNumber') ?? ''),
        amount,
      });
    } else {
      onPay({
        accountId,
        title: String(formData.get('title') ?? 'Оплата услуг'),
        amount,
      });
    }

    event.currentTarget.reset();
  }

  return (
    <section className="content__row content__row--wide">
      <div className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Операция</p>
            <h2>{mode === 'transfer' ? 'Перевод по номеру счёта' : 'Оплата услуг'}</h2>
          </div>
        </div>

        <div className="filter-tabs filter-tabs--compact">
          <button className={mode === 'transfer' ? 'active' : ''} type="button" onClick={() => setMode('transfer')}>Перевод</button>
          <button className={mode === 'pay' ? 'active' : ''} type="button" onClick={() => setMode('pay')}>Оплата</button>
        </div>

        <form className="form form--page" onSubmit={handleSubmit}>
          <label>
            Счёт списания
            <select name="accountId" required>
              {activeAccounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name} — {formatMoney(account.balance, account.currency)}</option>
              ))}
            </select>
          </label>

          {mode === 'transfer' ? (
            <label>
              Номер счёта получателя
              <input name="toAccountNumber" placeholder="40817810000000000000" required />
            </label>
          ) : (
            <label>
              Получатель
              <input name="title" placeholder="Мобильная связь, ЖКХ, интернет" required />
            </label>
          )}

          <label>
            Сумма
            <input min="1" name="amount" placeholder="0" required type="number" />
          </label>

          <button className="button-primary" type="submit">
            {mode === 'transfer' ? 'Отправить перевод' : 'Оплатить'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Операции</p>
            <h2>История платежей</h2>
          </div>
        </div>

        <input
          className="search-input"
          placeholder="Найти операцию"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="transactions">
          {filteredTransactions.slice(0, 8).map((tx) => (
            <article className="transaction" key={tx.id}>
              <div>
                <strong>{tx.title}</strong>
                <span>{tx.category} • {formatDateTime(tx.createdAt)} • {getStatusText(tx.status)}</span>
              </div>
              <strong className={tx.amount >= 0 ? 'positive' : 'negative'}>
                {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount, tx.currency)}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PaymentsPage;
