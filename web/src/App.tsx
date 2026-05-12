import { useState } from 'react';
import './App.css';
import ActionModal from './components/ActionModal';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AccountsPage from './pages/AccountsPage';
import AssistantPage from './pages/AssistantPage';
import CardsPage from './pages/CardsPage';
import CurrencyPage from './pages/CurrencyPage';
import NewsPage from './pages/NewsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import type { Action, Page } from './types/banking';

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [activeAction, setActiveAction] = useState<Action | null>(null);

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onActionSelect={setActiveAction} />;
      case 'accounts':
        return <AccountsPage onActionSelect={setActiveAction} />;
      case 'cards':
        return <CardsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'currency':
        return <CurrencyPage />;
      case 'news':
        return <NewsPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return null;
    }
  }

  return (
    <div className="app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main">
        <Header activePage={activePage} />
        <div className="content">{renderPage()}</div>
      </main>

      <ActionModal action={activeAction} onClose={() => setActiveAction(null)} />
    </div>
  );
}

export default App;
