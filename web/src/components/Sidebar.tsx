import { navItems } from '../data/mockData';
import type { Page } from '../types/banking';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">Б</div>
        <div className="sidebar__logo-text">БАНК МИК</div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={
              'sidebar__nav-item ' +
              (activePage === item.key ? 'sidebar__nav-item--active' : '')
            }
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;