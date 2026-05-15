import type { Action, BankingState, Page } from '../types/banking';
import {
  getCategoryTotals,
  getMonthlyIncome,
  getMonthlyOutcome,
  getTotalBalance,
} from '../utils/calculations';
import { formatCompactMoney, formatDateTime, formatMoney } from '../utils/formatters';

interface DashboardProps {
  state: BankingState;
  onActionSelect: (action: Action) => void;
  onNavigate: (page: Page) => void;
}

function Dashboard({ state, onActionSelect, onNavigate }: DashboardProps) {
  const totalRub = getTotalBalance(state.accounts, state.rates);
  const monthlyIncome = getMonthlyIncome(state.transactions);
  const monthlyOutcome = getMonthlyOutcome(state.transactions);
  const savingAccount = state.accounts.find((account) => account.type === 'saving');
  const categoryTotals = getCategoryTotals(state.transactions);
  const maxCategory = Math.max(...Object.values(categoryTotals), 1);

  return (
    <div className="dashboard">
      <section className="hero-card">
        <div className="hero-card__content">
          <p className="eyebrow">Общий баланс</p>
          <h2>{formatMoney(totalRub, 'RUB')}</h2>
          <p className="muted">Сумма по активным счетам с примерной переоценкой валюты</p>
        </div>

        <div className="hero-card__visual">
          <span />
          <span />
          <span />
        </div>

        <div className="hero-card__actions">
          <button type="button" onClick={() => onActionSelect('topup')}>Пополнить</button>
          <button type="button" onClick={() => onActionSelect('transfer')}>Перевести</button>
          <button type="button" onClick={() => onActionSelect('exchange')}>Обменять</button>
          <button type="button" onClick={() => onActionSelect('pay')}>Оплатить</button>
        </div>
      </section>

      <section className="quick-grid">
        <article className="quick-card quick-card--income">
          <span>Доходы</span>
          <strong>{formatCompactMoney(monthlyIncome, 'RUB')}</strong>
          <small>за текущий период</small>
        </article>
        <article className="quick-card quick-card--outcome">
          <span>Расходы</span>
          <strong>{formatCompactMoney(monthlyOutcome, 'RUB')}</strong>
          <small>по всем операциям</small>
        </article>
        <article className="quick-card">
          <span>Накопления</span>
          <strong>{savingAccount ? formatCompactMoney(savingAccount.balance, savingAccount.currency) : '—'}</strong>
          <small>{savingAccount?.interestRate ?? 0}% годовых</small>
        </article>
      </section>

      <div className="content__row">
        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Карты</p>
              <h2>Активные продукты</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate('cards')}>
              Все карты
            </button>
          </div>

          <div className="bank-cards">
            {state.cards.slice(0, 3).map((card) => (
              <article className={`bank-card bank-card--${card.color}`} key={card.id}>
                <div className="bank-card__top">
                  <span>{card.name}</span>
                  <span>{card.paymentSystem}</span>
                </div>
                <strong>{card.maskedNumber}</strong>
                <div className="bank-card__bottom">
                  <span>{formatMoney(card.balance, card.currency)}</span>
                  <span>{card.cashback}% кэшбэк</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Курсы</p>
              <h2>Валюта</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate('currency')}>Открыть</button>
          </div>

          <div className="rates-list">
            {state.rates.map((rate) => (
              <div className="rate-row" key={rate.code}>
                <div>
                  <strong>{rate.code}</strong>
                  <span>{rate.name}</span>
                </div>
                <div>
                  <strong>{rate.sell.toFixed(2)} ₽</strong>
                  <span className={rate.change >= 0 ? 'positive' : 'negative'}>
                    {rate.change >= 0 ? '+' : ''}{rate.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="content__row content__row--wide">
        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">История</p>
              <h2>Последние операции</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate('payments')}>
              Платежи
            </button>
          </div>

          <div className="transactions">
            {state.transactions.slice(0, 6).map((tx) => (
              <article className="transaction" key={tx.id}>
                <div>
                  <strong>{tx.title}</strong>
                  <span>{tx.category} • {formatDateTime(tx.createdAt)}</span>
                </div>
                <strong className={tx.amount >= 0 ? 'positive' : 'negative'}>
                  {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount, tx.currency)}
                </strong>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Аналитика</p>
              <h2>Расходы</h2>
            </div>
          </div>

          <div className="spending-list">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div className="spending-row" key={category}>
                <div>
                  <span>{category}</span>
                  <strong>{formatMoney(amount, 'RUB')}</strong>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.max((amount / maxCategory) * 100, 8)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="content__row">
        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Цели</p>
              <h2>Накопления</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate('accounts')}>К счетам</button>
          </div>

          <div className="goal-list">
            {state.goals.map((goal) => (
              <article className="goal-card" key={goal.id}>
                <div className="goal-card__icon">{goal.icon}</div>
                <div>
                  <strong>{goal.title}</strong>
                  <span>{formatMoney(goal.saved, goal.currency)} из {formatMoney(goal.target, goal.currency)}</span>
                  <div className="progress progress--big">
                    <span style={{ width: `${Math.min((goal.saved / goal.target) * 100, 100)}%` }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Новости</p>
              <h2>Для клиента</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate('news')}>Все</button>
          </div>

          <div className="news-compact">
            {state.news.slice(0, 2).map((item) => (
              <article key={item.id}>
                <span>{item.tag}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
