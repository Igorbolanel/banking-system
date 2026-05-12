import { accounts } from '../data/mockData';
import type { Action } from '../types/banking';
import { formatMoney, maskAccountNumber } from '../utils/formatters';

interface AccountsPageProps {
  onActionSelect: (action: Action) => void;
}

function AccountsPage({ onActionSelect }: AccountsPageProps) {
  return (
    <section className="page-grid">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Счета</p>
          <h2>Открытие, просмотр и закрытие счетов</h2>
          <p>Раздел закрывает требования по банковским счетам и накопительному счёту.</p>
        </div>
        <button type="button" onClick={() => onActionSelect('openAccount')}>
          Открыть счёт
        </button>
      </div>

      <div className="accounts-list">
        {accounts.map((account) => (
          <article className="account-card" key={account.id}>
            <div>
              <span className="badge">{account.type === 'saving' ? 'Накопительный' : 'Активный'}</span>
              <h3>{account.name}</h3>
              <p>{maskAccountNumber(account.number)}</p>
            </div>
            <div className="account-card__side">
              <strong>{formatMoney(account.balance, account.currency)}</strong>
              {account.interestRate && <span>{account.interestRate}% годовых</span>}
              <button type="button">Закрыть счёт</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AccountsPage;
