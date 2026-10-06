import { useState } from 'react';

import type { Page, Theme } from '../types/banking';
import { getInitials } from '../utils/formatters';
import CommandSearch from './operations/CommandSearch';
import { UiIcon } from './operations/Icon';

const META: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Главная', subtitle: 'Баланс, счета и последние операции' },
  accounts: { title: 'Счета', subtitle: 'Открывайте счета, пополняйте их и переводите деньги' },
  operations: { title: 'Операции', subtitle: 'Поиск по истории и аналитика трат и доходов' },
  payments: { title: 'Платежи и переводы', subtitle: 'Переводы между счетами и оплата покупок' },
  currency: { title: 'Валюта', subtitle: 'Курсы, калькулятор и обмен между счетами' },
  profile: { title: 'Профиль', subtitle: 'Личные данные и настройки кабинета' },
};

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Доброе утро';
  if (hour >= 12 && hour < 18) return 'Добрый день';
  if (hour >= 18) return 'Добрый вечер';
  return 'Доброй ночи';
}

interface HeaderProps {
  activePage: Page;
  theme: Theme;
  userName: string;
  onThemeToggle: () => void;
  onNavigate: (page: Page) => void;
}

function Header({ activePage, theme, userName, onThemeToggle, onNavigate }: HeaderProps) {
  const [hello] = useState(greeting);
  const firstName = userName.split(' ')[0] || 'Пользователь';
  const meta = META[activePage];
  const title = activePage === 'dashboard' ? `${hello}, ${firstName}` : meta.title;

  return (
    <header className="topbar">
      <div className="topbar__titles">
        <h1>{title}</h1>
        <p className="topbar__subtitle">{meta.subtitle}</p>
      </div>

      <div className="topbar__actions">
        <CommandSearch onOpenOperations={() => onNavigate('operations')} />
        <button
          className="icon-btn"
          type="button"
          onClick={onThemeToggle}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          <UiIcon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
        </button>
        <button className="avatar-btn" type="button" onClick={() => onNavigate('profile')} aria-label="Открыть профиль" title="Профиль">
          <span className="avatar">{getInitials(userName)}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
