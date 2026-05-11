import { useState } from 'react';
import './App.css';
import ActionModal from './components/ActionModal';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PlaceholderPage from './pages/PlaceholderPage';
import type { Action, Page } from './types/banking';

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [activeAction, setActiveAction] = useState<Action | null>(null);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onActionSelect={setActiveAction} />;
      case 'accounts':
        return (
          <PlaceholderPage
            title="Счета"
            description="СКОРО КОЛЯ СДЕЛАЕТ КРАСИВО."
          />
        );
      case 'cards':
        return (
          <PlaceholderPage
            title="Карты"
            description="СКОРО КОЛЯ СДЕЛАЕТ КРАСИВО."
          />
        );
      case 'payments':
        return (
          <PlaceholderPage
            title="Платежи"
            description="СКОРО КОЛЯ СДЕЛАЕТ КРАСИВО."
          />
        );
      case 'currency':
        return (
          <PlaceholderPage
            title="Валюта"
            description="СКОРО КОЛЯ СДЕЛАЕТ КРАСИВО."
          />
        );
      case 'news':
        return (
          <PlaceholderPage
            title="Новости"
            description="СКОРО КОЛЯ СДЕЛАЕТ КРАСИВО."
          />
        );
      case 'assistant':
        return (
          <PlaceholderPage
            title="Ассистент"
            description="СКОРО КОЛЯ СДЕЛАЕТ КРАСИВО."
          />
        );
      case 'profile':
        return (
          <PlaceholderPage
            title="Профиль"
            description="СКОРО КОЛЯ СДЕЛАЕТ КРАСИВО."
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main">
        <Header />
        <main className="content">{renderPage()}</main>
      </div>

      <ActionModal action={activeAction} onClose={() => setActiveAction(null)} />
    </div>
  );
}

export default App;