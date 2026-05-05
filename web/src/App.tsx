import { useState } from 'react';
import './App.css';

type Page = 'dashboard' | 'accounts' | 'cards' | 'payments' | 'currency' | 'profile';
type Action = 'topup' | 'transfer' | 'pay';

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [activeAction, setActiveAction] = useState<Action | null>(null);

  const mainAccount = {
    name: 'Основной счёт',
    balance: -100000,
    currency: '₽',
  };

  const cards = [
    {
      id: 'card-1',
      name: 'Дебетовая карта',
      maskedNumber: '**** 1234',
      balance: -200000,
      currency: '₽',
    },
    {
      id: 'card-2',
      name: 'Кредитная карта',
      maskedNumber: '**** 5678',
      balance: -500000,
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
          <div className="sidebar__logo-mark">Б</div>
          <div className="sidebar__logo-text">Банк МИК</div>
        </div>
        <nav className="sidebar__nav">
          <button
            className={
              'sidebar__nav-item ' + (activePage === 'dashboard' ? 'sidebar__nav-item--active' : '')
            }
            onClick={() => setActivePage('dashboard')}
          >
            Главная
          </button>
          <button
            className={
              'sidebar__nav-item ' + (activePage === 'accounts' ? 'sidebar__nav-item--active' : '')
            }
            onClick={() => setActivePage('accounts')}
          >
            Счета
          </button>
          <button
            className={
              'sidebar__nav-item ' + (activePage === 'cards' ? 'sidebar__nav-item--active' : '')
            }
            onClick={() => setActivePage('cards')}
          >
            Карты
          </button>
          <button
            className={
              'sidebar__nav-item ' + (activePage === 'payments' ? 'sidebar__nav-item--active' : '')
            }
            onClick={() => setActivePage('payments')}
          >
            Платежи
          </button>
          <button
            className={
              'sidebar__nav-item ' + (activePage === 'currency' ? 'sidebar__nav-item--active' : '')
            }
            onClick={() => setActivePage('currency')}
          >
            Валюта
          </button>
          <button
            className={
              'sidebar__nav-item ' + (activePage === 'profile' ? 'sidebar__nav-item--active' : '')
            }
            onClick={() => setActivePage('profile')}
          >
            Профиль
          </button>
        </nav>
      </aside>

      <div className="main">
        <header className="header">
          <div className="header__title">Интернет‑банк</div>
          <div className="header__user">Муня Колев</div>
        </header>

        <main className="content">
          {activePage === 'dashboard' && (
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
                    <button
                      className="pill-button"
                      onClick={() => setActiveAction('topup')}
                    >
                      Пополнить
                    </button>
                    <button
                      className="pill-button"
                      onClick={() => setActiveAction('transfer')}
                    >
                      Перевести
                    </button>
                    <button
                      className="pill-button"
                      onClick={() => setActiveAction('pay')}
                    >
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
                          (tx.amount < 0
                            ? 'transaction__amount--neg'
                            : 'transaction__amount--pos')
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
          )}

          {activePage === 'accounts' && (
            <section className="card">
              <h2 className="card__title">Счета</h2>
              <p>Пока тут пусто , но скоро Коля сделает красиво.</p>
            </section>
          )}

          {activePage === 'cards' && (
            <section className="card">
              <h2 className="card__title">Карты</h2>
              <p>Пока тут пусто , но скоро Коля сделает красиво.</p>
            </section>
          )}

          {activePage === 'payments' && (
            <section className="card">
              <h2 className="card__title">Платежи</h2>
              <p>Пока тут пусто , но скоро Коля сделает красиво.</p>
            </section>
          )}

          {activePage === 'currency' && (
            <section className="card">
              <h2 className="card__title">Валюта</h2>
              <p>Пока тут пусто , но скоро Коля сделает красиво.</p>
            </section>
          )}

          {activePage === 'profile' && (
            <section className="card">
              <h2 className="card__title">Профиль</h2>
              <p>Пока тут пусто , но скоро Коля сделает красиво.</p>
            </section>
          )}
        </main>
      </div>

      {activeAction && (
        <div className="modal">
          <div
            className="modal__backdrop"
            onClick={() => setActiveAction(null)}
          />
          <div className="modal__content">
            <h3>
              {activeAction === 'topup' && 'Пополнение счёта'}
              {activeAction === 'transfer' && 'Перевод средств'}
              {activeAction === 'pay' && 'Оплата услуг'}
            </h3>
            <p>Пока тут пусто , но скоро Коля сделает красиво.</p>
            <button
              className="pill-button"
              onClick={() => setActiveAction(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;