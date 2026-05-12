import { cards } from '../data/mockData';
import { formatMoney } from '../utils/formatters';

function CardsPage() {
  return (
    <section className="page-grid">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Карты</p>
          <h2>Дебетовые и валютные карты</h2>
          <p>Карточки нужны для красивого главного экрана и демонстрации банковских продуктов.</p>
        </div>
        <button type="button">Заказать карту</button>
      </div>

      <div className="cards-page-grid">
        {cards.map((card) => (
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
    </section>
  );
}

export default CardsPage;
