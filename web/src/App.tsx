import { useState } from 'react';
import './App.css';
import './styles/operations.css';
import ActionModal from './components/ActionModal';
import ConfirmDialog from './components/ConfirmDialog';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import Header from './components/Header';
import Sidebar, { TabBar } from './components/Sidebar';
import ToastStack from './components/ToastStack';
import PaymentModal from './components/operations/PaymentModal';
import { useBankingState } from './hooks/useBankingState';
import AccountsPage from './pages/AccountsPage';
import AuthPage from './pages/AuthPage';
import CurrencyPage from './pages/CurrencyPage';
import OperationsPage from './pages/OperationsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import type { Account, Action, Page } from './types/banking';
import { formatMoney } from './utils/formatters';

export interface ActionRequest {
  action: Action;
  accountId?: string;
  mode?: 'own' | 'external';
}

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [request, setRequest] = useState<ActionRequest | null>(null);
  const [closing, setClosing] = useState<Account | null>(null);
  const banking = useBankingState();
  const { auth, state } = banking;

  const navigate = (page: Page) => {
    setActivePage(page);
    window.scrollTo({ top: 0 });
  };
  const openAction = (action: Action, accountId?: string, mode?: 'own' | 'external') => setRequest({ action, accountId, mode });

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            state={state}
            summary={banking.summary}
            onAction={openAction}
            onNavigate={navigate}
            onToggleBalance={banking.toggleHideBalance}
          />
        );
      case 'accounts':
        return (
          <AccountsPage
            accounts={state.accounts}
            rates={state.rates}
            onAction={openAction}
            onRequestClose={setClosing}
            onRename={banking.renameAccount}
          />
        );
      case 'operations':
        return (
          <OperationsPage
            accounts={state.accounts}
            transactions={state.transactions}
            onDataChanged={() => {
              void banking.refresh();
            }}
          />
        );
      case 'payments':
        return <PaymentsPage accounts={state.accounts} transactions={state.transactions} onAction={openAction} onNavigate={navigate} />;
      case 'currency':
        return <CurrencyPage rates={state.rates} accounts={state.accounts} onAction={openAction} />;
      case 'profile':
        return (
          <ProfilePage
            profile={state.profile}
            accountsCount={banking.summary.activeAccounts.length}
            onUpdate={banking.updateProfile}
            onThemeChange={banking.setTheme}
            onToggleBalance={banking.toggleHideBalance}
            onLogout={() => {
              void banking.logout();
            }}
          />
        );
      default:
        return null;
    }
  }

  if (auth.status !== 'authenticated') {
    return (
      <>
        <AuthPage loading={auth.status === 'checking'} error={auth.error} onLogin={banking.login} onRegister={banking.register} />
        <ToastStack toasts={banking.toasts} onRemove={banking.removeToast} />
      </>
    );
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        userName={state.profile.fullName}
        email={state.profile.email}
        onLogout={() => {
          void banking.logout();
        }}
      />
      <main className="main">
        <Header
          activePage={activePage}
          theme={state.profile.theme}
          userName={state.profile.fullName}
          onNavigate={navigate}
          onThemeToggle={() => banking.setTheme(state.profile.theme === 'dark' ? 'light' : 'dark')}
        />
        <section className="content">
          {renderPage()}
          <Footer />
        </section>
      </main>
      <TabBar activePage={activePage} onNavigate={navigate} />

      {request?.action === 'pay' && (
        <PaymentModal
          accounts={state.accounts}
          defaultAccountId={request.accountId}
          onClose={() => setRequest(null)}
          onSubmit={async (payload) => {
            const ok = await banking.pay({
              accountId: payload.accountId,
              title: payload.merchant,
              amount: payload.amount,
              category: payload.category,
            });
            if (ok) setRequest(null);
          }}
        />
      )}
      {request && request.action !== 'pay' && (
        <ActionModal
          key={`${request.action}-${request.accountId ?? ''}-${request.mode ?? ''}`}
          action={request.action}
          accounts={state.accounts}
          rates={state.rates}
          defaultAccountId={request.accountId}
          defaultMode={request.mode}
          onClose={() => setRequest(null)}
          onSubmit={banking.submitAction}
        />
      )}
      {closing && (
        closing.balance > 0 ? (
          <ConfirmDialog
            title="Сначала переведите остаток"
            confirmLabel="Перевести остаток"
            onClose={() => setClosing(null)}
            onConfirm={() => {
              setClosing(null);
              openAction('transfer', closing.id, 'own');
              return true;
            }}
          >
            На счёте «{closing.name}» осталось {formatMoney(closing.balance, closing.currency)}. Закрыть можно только счёт
            с нулевым балансом — переведите деньги на другой свой счёт.
          </ConfirmDialog>
        ) : (
          <ConfirmDialog
            title="Закрыть счёт?"
            confirmLabel="Закрыть счёт"
            tone="danger"
            onClose={() => setClosing(null)}
            onConfirm={() => banking.closeAccount(closing.id)}
          >
            Счёт «{closing.name}» будет закрыт. Пополнять его и переводить с него деньги больше не получится, а история
            операций сохранится.
          </ConfirmDialog>
        )
      )}
      <ToastStack toasts={banking.toasts} onRemove={banking.removeToast} />
    </div>
  );
}

export default App;
