import type { Page } from '../types/banking';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div>
          <strong>МИК Банк</strong>
          <p>Учебная банковская система для управления счетами, переводами и валютными операциями.</p>
        </div>

        <div className="footer__status">
          <span>Курсовой проект</span>
          <span>Демо-режим</span>
        </div>
      </div>

      <nav className="footer__nav" aria-label="Дополнительная навигация">
        <button type="button" onClick={() => onNavigate('dashboard')}>
          О банке
        </button>
        <button type="button" onClick={() => onNavigate('news')}>
          Новости
        </button>
        <button type="button" onClick={() => onNavigate('currency')}>
          Курсы валют
        </button>
        <button type="button" onClick={() => onNavigate('accounts')}>
          Счета
        </button>
        <button type="button" onClick={() => onNavigate('payments')}>
          Переводы
        </button>
        <button type="button" onClick={() => onNavigate('assistant')}>
          Помощь
        </button>
        <button type="button" onClick={() => onNavigate('profile')}>
          Профиль
        </button>
      </nav>

      <div className="footer__info">
        <p>
          МИК Банк использует демонстрационные данные для отображения интерфейса интернет-банка.
          Функции переводов, пополнений, обмена валюты и ассистента реализованы для учебной
          демонстрации и не выполняют реальные банковские операции.
        </p>

        <p>
          Проект разработан в рамках курсовой работы. Клиентская часть подготовлена для интеграции
          с сервисами Core, Currencies, Info и Assistant через REST API.
        </p>
      </div>

      <div className="footer__bottom">
        <span>© 2026, учебный проект «МИК Банк»</span>
        <span>React · TypeScript · Vite</span>
      </div>
    </footer>
  );
}

export default Footer;