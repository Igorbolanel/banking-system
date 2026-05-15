import { navItems } from '../data/mockData';
import type { Page } from '../types/banking';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="sidebar__brand" type="button" onClick={() => onNavigate('dashboard')}>
        <span className="sidebar__logo-mark">М</span>
        <span>
          <span className="sidebar__logo-text">МИК Банк</span>
          <span className="sidebar__logo-subtitle">цифровой банк</span>
        </span>
      </button>

      <nav className="sidebar__nav" aria-label="Основная навигация">
        {navItems.map((item) => (
          <button
            className={`sidebar__nav-item ${
              activePage === item.key ? 'sidebar__nav-item--active' : ''
            }`}
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.key)}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__promo">
        <span className="sidebar__promo-label">Кэшбэк недели</span>
        <strong>до 15%</strong>
        <p>Супермаркеты, транспорт, кафе и подписки</p>
      </div>
    </aside>
  );
}

export default Sidebar;
