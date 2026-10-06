import type { Action, BankingState, Page, Transaction } from '../types/banking';
import { formatMoney, formatRate, getCurrencySymbol, maskAccountNumber, pluralize } from '../utils/formatters';
import { UiIcon } from './operations/Icon';
import SpendingWidget from './operations/SpendingWidget';
import RecentOperations from './RecentOperations';

interface DashboardProps {
  state: BankingState;
  summary: { totalBalance: number; activeAccounts: BankingState['accounts']; latestTransactions: Transaction[] };
  onAction: (action: Action, accountId?: string) => void;
  onNavigate: (page: Page) => void;
  onToggleBalance: () => void;
}

const QUICK_ACTIONS: Array<{ action: Action; label: string; icon: string }> = [
  { action: 'topup', label: 'Пополнить', icon: 'download' },
  { action: 'transfer', label: 'Перевести', icon: 'transfer' },
  { action: 'pay', label: 'Оплатить', icon: 'card' },
  { action: 'exchange', label: 'Обменять', icon: 'exchange' },
];

function Dashboard({ state, summary, onAction, onNavigate, onToggleBalance }: DashboardProps) {
  const hidden = Boolean(state.profile.hideBalance);
  const count = summary.activeAccounts.length;
  const hasForeign = summary.activeAccounts.some((account) => account.currency !== 'RUB');

  return (
    <div className="page">
      <section className="balance-card" aria-label="Общий баланс">
        <div className="balance-card__top">
          <span className="balance-card__label">Общий баланс</span>
          <button
            type="button"
            className="balance-card__eye"
            onClick={onToggleBalance}
            aria-label={hidden ? 'Показать баланс' : 'Скрыть баланс'}
            title={hidden ? 'Показать баланс' : 'Скрыть баланс'}
          >
            <UiIcon name={hidden ? 'eyeOff' : 'eye'} size={17} />
          </button>
        </div>
        <strong className="balance-card__amount">{hidden ? '•••••• ₽' : formatMoney(Math.round(summary.totalBalance), 'RUB')}</strong>
        <p className="balance-card__meta">
          {count === 0
            ? 'Откройте первый счёт, чтобы начать'
            : `На ${count} ${pluralize(count, 'активном счёте', 'активных счетах', 'активных счетах')}${hasForeign ? ', валюта пересчитана в рубли по курсу банка' : ''}`}
        </p>
        <div className="quick-actions">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.action}
              type="button"
              className="quick-action"
              disabled={count === 0}
              onClick={() => onAction(item.action)}
            >
              <span className="quick-action__icon">
                <UiIcon name={item.icon} size={18} strokeWidth={2.2} />
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {count === 0 && (
        <section className="card">
          <div className="card__head">
            <h2>С чего начать</h2>
          </div>
          <ol className="steps">
            <li>
              <strong>Откройте счёт</strong>
              <span>Текущий для повседневных трат или накопительный с процентами.</span>
            </li>
            <li>
              <strong>Пополните его</strong>
              <span>Деньги поступят сразу, баланс обновится на главной.</span>
            </li>
            <li>
              <strong>Переводите и платите</strong>
              <span>Все операции попадут в историю и аналитику трат.</span>
            </li>
          </ol>
          <div style={{ marginTop: 16 }}>
            <button type="button" className="btn btn--brand" onClick={() => onAction('openAccount')}>
              <UiIcon name="plus" size={18} strokeWidth={2.4} />
              Открыть первый счёт
            </button>
          </div>
        </section>
      )}

      <div className="dash-grid">
        <section className="card">
          <div className="card__head">
            <h2>Мои счета</h2>
            <button type="button" className="link-btn" onClick={() => onNavigate('accounts')}>
              Все счета
            </button>
          </div>
          {count === 0 ? (
            <div className="empty">
              <p>Здесь появятся ваши счета.</p>
            </div>
          ) : (
            <div className="list">
              {summary.activeAccounts.slice(0, 4).map((account) => (
                <button key={account.id} type="button" className="list-row" onClick={() => onNavigate('accounts')}>
                  <span className="currency-bubble">{getCurrencySymbol(account.currency)}</span>
                  <span className="list-row__main">
                    <span className="list-row__title">{account.name}</span>
                    <span className="list-row__meta">{maskAccountNumber(account.number)}</span>
                  </span>
                  <span className="list-row__side">
                    <span className="amount">{hidden ? '•••' : formatMoney(account.balance, account.currency)}</span>
                    {account.type === 'saving' && <small>{account.interestRate ?? 12.5}% годовых</small>}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button type="button" className="btn btn--sm" style={{ marginTop: 12 }} onClick={() => onAction('openAccount')}>
            <UiIcon name="plus" size={16} strokeWidth={2.4} />
            Открыть счёт
          </button>
        </section>

        <SpendingWidget accounts={state.accounts} transactions={state.transactions} onOpen={() => onNavigate('operations')} />
      </div>

      <div className="dash-grid">
        <section className="card">
          <div className="card__head">
            <h2>Последние операции</h2>
            <button type="button" className="link-btn" onClick={() => onNavigate('operations')}>
              Вся история
            </button>
          </div>
          <RecentOperations
            transactions={summary.latestTransactions}
            accounts={state.accounts}
            emptyText="Операций пока нет. Пополните счёт — и первая операция появится здесь."
          />
        </section>

        <section className="card">
          <div className="card__head">
            <h2>Курсы валют</h2>
            <button type="button" className="link-btn" onClick={() => onNavigate('currency')}>
              Калькулятор
            </button>
          </div>
          {state.rates.length === 0 ? (
            <div className="empty">
              <p>Курсы временно недоступны — сервис валют не ответил.</p>
            </div>
          ) : (
            <>
              <table className="rates-table">
                <thead>
                  <tr>
                    <th scope="col">Валюта</th>
                    <th scope="col">Покупка</th>
                    <th scope="col">Продажа</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rates.map((rate) => (
                    <tr key={rate.code}>
                      <td>
                        {rate.code}
                        <small>{rate.code === 'USD' ? 'Доллар США' : rate.code === 'EUR' ? 'Евро' : rate.name}</small>
                      </td>
                      <td>{formatRate(rate.buy)} ₽</td>
                      <td>{formatRate(rate.sell)} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="hint" style={{ marginTop: 12 }}>
                Покупка — курс, по которому банк покупает у вас валюту, продажа — по которому продаёт.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
