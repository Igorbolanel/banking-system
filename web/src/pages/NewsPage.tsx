import { news } from '../data/mockData';
import { formatDate } from '../utils/formatters';

function NewsPage() {
  return (
    <section className="page-grid">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Инфо-сервис</p>
          <h2>Финансовые новости и подсказки</h2>
          <p>В будущем этот раздел будет получать данные из Info Service.</p>
        </div>
      </div>

      <div className="news-grid">
        {news.map((item) => (
          <article className="news-card" key={item.id}>
            <span>{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>{formatDate(item.publishedAt)}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default NewsPage;
