import { accounts, cards, currencyRates, news, transactions } from '../data/mockData';
import type { Action } from '../types/banking';
import { formatDateTime, formatMoney } from '../utils/formatters';

interface DashboardProps {
  onActionSelect: (action: Action) => void;
}

function Dashboard({ onActionSelect }: DashboardProps) {
  const totalRub = accounts.reduce((sum, account) => {
    if (account.currency === 'RUB') return sum + account.balance;
    if (account.currency === 'USD') return sum + account.balance * 92;
    if (account.currency === 'EUR') return sum + account.balance * 101;
    return sum + account.balance * 13;
  }, 0);

  const savingAccount = accounts.find((account) => account.type === 'saving');

  return (
    <div className="dashboard">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Общий баланс</p>
          <h2>{formatMoney(totalRub, 'RUB')}</h2>
          <p className="muted">Сумма по счетам с примерной переоценкой валюты</p>
        </div>

        <div className="hero-card__actions">
          <button type="button" onClick={() => onActionSelect('topup')}>
            Пополнить
          </button>
          <button type="button" onClick={() => onActionSelect('transfer')}>
            Перевести
          </button>
          <button type="button" onClick={() => onActionSelect('exchange')}>
            Обменять
          </button>
          <button type="button" onClick={() => onActionSelect('pay')}>
            Оплатить
          </button>
        </div>
      </section>

      <section className="quick-grid">
        <article className="quick-card">
          <span>Накопления</span>
          <strong>{savingAccount ? formatMoney(savingAccount.balance, savingAccount.currency) : '—'}</strong>
          <small>{savingAccount?.interestRate ?? 0}% годовых</small>
        </article>
        <article className="quick-card">
          <span>Кэшбэк</span>
          <strong>5 420 ₽</strong>
          <small>ожидается в конце месяца</small>
        </article>
        <article className="quick-card">
          <span>Лимит переводов</span>
          <strong>350 000 ₽</strong>
          <small>осталось на сегодня</small>
        </article>
      </section>

      <div className="content__row">
        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Карты</p>
              <h2>Активные продукты</h2>
            </div>
          </div>

          <div className="bank-cards">
            {cards.map((card) => (
              <article className={`bank-card bank-card--${card.color}`} key={card.id}>
                <div className="bank-card__top">
                  <span>{card.name}</span>
                  <span>{card.paymentSystem}</span>
                </div>
                <strong>{card.maskedNumber}</strong>
                <div className="bank-card__bottom">
                  <span>{formatMoney(card.balance, card.currency)}</span>
                  <span>{card.expiresAt}</span>
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
          </div>

          <div className="rates-list">
            {currencyRates.map((rate) => (
              <div className="rate-row" key={rate.code}>
                <div>
                  <strong>{rate.code}</strong>
                  <span>{rate.name}</span>
                </div>
                <div>
                  <strong>{rate.sell.toFixed(2)} ₽</strong>
                  <span className={rate.change >= 0 ? 'positive' : 'negative'}>
                    {rate.change >= 0 ? '+' : ''}
                    {rate.change}
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
          </div>

          <div className="transactions">
            {transactions.map((tx) => (
              <article className="transaction" key={tx.id}>
                <div>
                  <strong>{tx.title}</strong>
                  <span>{tx.category} • {formatDateTime(tx.createdAt)}</span>
                </div>
                <strong className={tx.amount >= 0 ? 'positive' : 'negative'}>
                  {tx.amount > 0 ? '+' : ''}
                  {formatMoney(tx.amount, tx.currency)}
                </strong>
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
          </div>

          <div className="news-compact">
            {news.slice(0, 2).map((item) => (
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
