import type { BankingState } from '../types/banking';
import { formatMoney } from '../utils/formatters';

interface CardsPageProps {
  state: BankingState;
}

function CardsPage({ state }: CardsPageProps) {
  return (
    <section className="page-grid">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Карты</p>
          <h2>Дебетовые и валютные карты</h2>
          <p>Карты показывают банковские продукты, лимиты, статус и кэшбэк.</p>
        </div>
        <button type="button">Заказать карту</button>
      </div>

      <div className="cards-page-grid">
        {state.cards.map((card) => (
          <article className={`bank-card bank-card--large bank-card--${card.color}`} key={card.id}>
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

      <div className="content__row content__row--wide">
        <section className="card">
          <p className="eyebrow">Кэшбэк</p>
          <h2>Категории месяца</h2>
          <div className="cashback-grid">
            {state.cashbackCategories.map((item) => (
              <article className={`cashback-card ${item.selected ? 'cashback-card--selected' : ''}`} key={item.id}>
                <span>{item.icon}</span>
                <strong>{item.title}</strong>
                <p>{item.percent}%</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <p className="eyebrow">Лимиты</p>
          <h2>Контроль расходов</h2>
          <div className="rates-list">
            {state.cards.map((card) => (
              <div className="rate-row" key={card.id}>
                <div>
                  <strong>{card.name}</strong>
                  <span>{card.status === 'active' ? 'Активна' : 'Заблокирована'}</span>
                </div>
                <div>
                  <strong>{formatMoney(card.dailyLimit, 'RUB')}</strong>
                  <span>в день</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default CardsPage;
