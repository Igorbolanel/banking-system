import './App.css';

function App() {
  const mainAccount = {
    name: 'Основной счёт',
    balance: 0.00,
    currency: '₽',
  };

  const cards = [
    {
      id: 'card-1',
      name: 'Дебетовая карта',
      maskedNumber: '**** 1234',
      balance: 228,
      currency: '₽',
    },
    {
      id: 'card-2',
      name: 'Кредитная карта',
      maskedNumber: '**** 5678',
      balance: -1337,
      currency: '₽',
    },
  ];

  const transactions = [
    {
      id: 'tx-1',
      title: 'Перевод по номеру телефона',
      category: 'Переводы',
      amount: -1500,
      currency: '₽',
      createdAt: '2026-05-05T10:15:00Z',
    },
    {
      id: 'tx-2',
      title: 'Пополнение счёта',
      category: 'Пополнения',
      amount: 10000,
      currency: '₽',
      createdAt: '2026-05-04T18:20:00Z',
    },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-mark">B</div>
          <div className="sidebar__logo-text">Banking System</div>
        </div>
        <nav className="sidebar__nav">
          <button className="sidebar__nav-item sidebar__nav-item--active">Главная</button>
          <button className="sidebar__nav-item">Счета</button>
          <button className="sidebar__nav-item">Карты</button>
          <button className="sidebar__nav-item">Платежи</button>
          <button className="sidebar__nav-item">Валюта</button>
          <button className="sidebar__nav-item">Профиль</button>
        </nav>
      </aside>

      <div className="main">
        <header className="header">
          <div className="header__title">Интернет‑банк</div>
          <div className="header__user">Иван Иванов</div>
        </header>

        <main className="content">
          <div className="content__row">
            <section className="card card--main">
              <h2 className="card__title">Основной счёт</h2>
              <div className="balance">
                <div className="balance__value">
                  {mainAccount.balance.toLocaleStri
