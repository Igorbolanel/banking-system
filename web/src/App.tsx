import { useState } from 'react';
import './App.css';
import ActionModal from './components/ActionModal';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToastStack from './components/ToastStack';
import { useBankingState } from './hooks/useBankingState';
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

  const banking = useBankingState();
  const { state } = banking;

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            state={state}
            onActionSelect={setActiveAction}
            onNavigate={setActivePage}
          />
        );
      case 'accounts':
        return (
          <AccountsPage
            state={state}
            onActionSelect={setActiveAction}
            onCloseAccount={banking.closeAccount}
          />
        );
      case 'cards':
        return <CardsPage state={state} />;
      case 'payments':
        return (
          <PaymentsPage
            state={state}
            onTransfer={banking.transfer}
            onPay={banking.pay}
          />
        );
      case 'currency':
        return <CurrencyPage state={state} onExchange={banking.exchange} />;
      case 'news':
        return <NewsPage state={state} />;
      case 'assistant':
        return (
          <AssistantPage
            state={state}
            onSendMessage={banking.sendAssistantMessage}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            state={state}
            onUpdateProfile={banking.updateProfile}
            onThemeChange={banking.setTheme}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main">
        <Header
          activePage={activePage}
          theme={state.profile.theme}
          userName={state.profile.fullName}
          onReset={banking.resetDemoData}
          onThemeToggle={() =>
            banking.setTheme(state.profile.theme === 'dark' ? 'light' : 'dark')
          }
        />

        <div className="content">
          {renderPage()}
          <Footer onNavigate={setActivePage} />
        </div>
      </main>

      <ActionModal
        action={activeAction}
        accounts={state.accounts}
        onClose={() => setActiveAction(null)}
        onSubmit={banking.submitAction}
      />

      <ToastStack toasts={banking.toasts} onClose={banking.removeToast} />
    </div>
  );
}

export default App;