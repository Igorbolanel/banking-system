import { navItems } from '../data/mockData';
import type { Page } from '../types/banking';
import { getInitials } from '../utils/formatters';
import { UiIcon } from './operations/Icon';

interface SidebarProps {
  activePage: Page;
  userName: string;
  email: string;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

function Sidebar({ activePage, userName, email, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => onNavigate('dashboard')}>
        <span className="brand__mark">М</span>
        <span>
          <span className="brand__name">МИК Банк</span>
          <span className="brand__hint">онлайн-банк</span>
        </span>
      </button>

      <nav className="nav" aria-label="Разделы">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav__item${activePage === item.key ? ' is-active' : ''}`}
            type="button"
            aria-current={activePage === item.key ? 'page' : undefined}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav__icon">
              <UiIcon name={item.icon} size={19} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__user">
        <span className="avatar">{getInitials(userName)}</span>
        <span className="sidebar__user-text">
          <strong>{userName}</strong>
          <span>{email}</span>
        </span>
        <button className="icon-btn icon-btn--plain" type="button" onClick={onLogout} aria-label="Выйти" title="Выйти">
          <UiIcon name="logout" size={19} />
        </button>
      </div>
    </aside>
  );
}

/** Нижняя панель разделов на телефоне. Профиль открывается по аватару в шапке. */
export function TabBar({ activePage, onNavigate }: Pick<SidebarProps, 'activePage' | 'onNavigate'>) {
  return (
    <nav className="tabbar" aria-label="Разделы">
      {navItems
        .filter((item) => item.key !== 'profile')
        .map((item) => (
          <button
            key={item.key}
            type="button"
            className={activePage === item.key ? 'is-active' : undefined}
            aria-current={activePage === item.key ? 'page' : undefined}
            onClick={() => onNavigate(item.key)}
          >
            <UiIcon name={item.icon} size={22} />
            <span>{item.label}</span>
          </button>
        ))}
    </nav>
  );
}

export default Sidebar;
