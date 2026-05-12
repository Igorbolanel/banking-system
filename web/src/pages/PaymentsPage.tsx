import { accounts, transactions } from '../data/mockData';
import { formatDateTime, formatMoney } from '../utils/formatters';

function PaymentsPage() {
  return (
    <section className="content__row content__row--wide">
      <div className="card">
        <p className="eyebrow">Перевод</p>
        <h2>По номеру счёта</h2>

        <form className="form form--page">
          <label>
            Счёт списания
            <select>
              {accounts.map((account) => (
                <option key={account.id}>{account.name}</option>
              ))}
            </select>
          </label>

          <label>
            Номер счёта получателя
            <input placeholder="40817810000000000000" />
          </label>

          <label>
            Сумма
            <input min="1" placeholder="0" type="number" />
          </label>

          <label>
            Комментарий
            <input placeholder="Например, возврат долга" />
          </label>

          <button className="button-primary" type="button">
            Проверить перевод
          </button>
        </form>
      </div>

      <div className="card">
        <p className="eyebrow">Операции</p>
        <h2>Последние платежи</h2>

        <div className="transactions">
          {transactions.slice(0, 4).map((tx) => (
            <article className="transaction" key={tx.id}>
              <div>
                <strong>{tx.title}</strong>
                <span>{tx.category} • {formatDateTime(tx.createdAt)}</span>
              </div>
              <strong className={tx.amount >= 0 ? 'positive' : 'negative'}>
                {formatMoney(tx.amount, tx.currency)}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PaymentsPage;
