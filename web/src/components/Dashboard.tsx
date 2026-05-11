import { cards, mainAccount, transactions } from '../data/mockData';
import type { Action } from '../types/banking';

interface DashboardProps {
  onActionSelect: (action: Action) => void;
}

function Dashboard({ onActionSelect }: DashboardProps) {
  return (
    <>
      <div className="content__row">
        <section className="card card--main">
          <h2 className="card__title">Основной счёт</h2>
          <div className="balance">
            <div className="balance__value">
              {mainAccount.balance.toLocaleString('ru-RU')} {mainAccount.currency}
            </div>
            <div className="balance__label">{mainAccount.name}</div>
          </div>
          <div className="actions">
            <button className="pill-button" onClick={() => onActionSelect('topup')}>
              Пополнить
            </button>
            <button className="pill-button" onClick={() => onActionSelect('transfer')}>
              Перевести
            </button>
            <button className="pill-button" onClick={() => onActionSelect('pay')}>
              Оплатить
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Карты</h2>
          <div className="cards-list">
            {cards.map((card) => (
              <div key={card.id} className="card-mini">
                <div className="card-mini__top">
                  <span>{card.name}</span>
                  <span className="card-mini__number">{card.maskedNumber}</span>
                </div>
                <div className="card-mini__balance">
                  {card.balance.toLocaleString('ru-RU')} {card.currency}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card">
        <h2 className="card__title">Последние операции</h2>
        <div className="transactions">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction">
              <div>
                <div className="transaction__title">{tx.title}</div>
                <div className="transaction__meta">
                  {tx.category} • {new Date(tx.createdAt).toLocaleString('ru-RU')}
                </div>
              </div>
              <div
                className={
                  'transaction__amount ' +
                  (tx.amount < 0 ? 'transaction__amount--neg' : 'transaction__amount--pos')
                }
              >
                {tx.amount > 0 ? '+' : ''}
                {tx.amount.toLocaleString('ru-RU')} {tx.currency}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Dashboard;