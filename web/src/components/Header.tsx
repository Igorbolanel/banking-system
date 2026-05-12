import type { Page } from '../types/banking';

const titles: Record<Page, string> = {
  dashboard: 'Главная',
  accounts: 'Счета',
  cards: 'Карты',
  payments: 'Платежи и переводы',
  currency: 'Валюта',
  news: 'Финансовые новости',
  assistant: 'Ассистент',
  profile: 'Профиль',
};

interface HeaderProps {
  activePage: Page;
}

function Header({ activePage }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="header__eyebrow">МИК Банк</p>
        <h1>{titles[activePage]}</h1>
      </div>

      <div className="header__right">
        <div className="header__search">Поиск по операциям</div>
        <div className="header__user">
          <span className="header__avatar">И</span>
          <span>Игорь</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
