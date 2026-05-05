import './App.css';

function App() {
  const mainAccount = {
    name: 'Основной счёт',
    balance: 152340.5,
    currency: '₽',
  };

  const cards = [
    {
      id: 'card-1',
      name: 'Дебетовая карта',
      maskedNumber: '**** 1234',
      balance: 82340.12,
      currency: '₽',
    },
    {
      id: 'card-2',
      name: 'Кредитная карта',
      maskedNumber: '**** 5678',
      balance: -12450,
      currency: '₽',
    },
  ];

  const transactions = [
    {
      id: 'tx-1',
      title: 'Перевод по номеру телефона',
      category: 'Переводы',
      amount: -1500,
      currency: '₽',
      createdAt: '2026-05-05T10:15:00Z',
    },
    {
      id: 'tx-2',
      title: 'Пополнение счёта',
      category: 'Пополнения',
      amount: 10000,
      currency: '₽',
      createdAt: '2026-05-04T18:20:00Z',
    },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-mark">B</div>
          <div className="sidebar__logo-text">Banking System</div>
        </div>
        <nav className="sidebar__nav">
          <button className="sidebar__nav-item sidebar__nav-item--active">Главная</button>
          <button className="sidebar__nav-item">Счета</button>
          <button className="sidebar__nav-item">Карты</button>
          <button className="sidebar__nav-item">Платежи</button>
          <button className="sidebar__nav-item">Валюта</button>
          <button className="sidebar__nav-item">Профиль</button>
        </nav>
      </aside>

      <div className="main">
        <header className="header">
          <div className="header__title">Интернет‑банк</div>
          <div className="header__user">Иван Иванов</div>
        </header>

        <main className="content">
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
                <button className="pill-button">Пополнить</button>
                <button className="pill-button">Перевести</button>
                <button className="pill-button">Оплатить</button>
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
        </main>
      </div>
    </div>
  );
}

export default App;