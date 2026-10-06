import RecentOperations from '../components/RecentOperations';
import { UiIcon } from '../components/operations/Icon';
import type { Account, Action, Page, Transaction } from '../types/banking';

interface PaymentsPageProps {
  accounts: Account[];
  transactions: Transaction[];
  onAction: (action: Action, accountId?: string, mode?: 'own' | 'external') => void;
  onNavigate: (page: Page) => void;
}

const TIPS = [
  'Номер счёта для перевода можно скопировать на странице «Счета».',
  'Перевод между своими счетами в разных валютах выполняется по курсу банка.',
  'Закрыть можно только счёт с нулевым балансом.',
  'Все операции с поиском и диаграммами — в разделе «Операции».',
];

function PaymentsPage({ accounts, transactions, onAction, onNavigate }: PaymentsPageProps) {
  const activeCount = accounts.filter((account) => account.status === 'active').length;
  const disabled = activeCount === 0;

  const tiles: Array<{ title: string; text: string; icon: string; run: () => void; needsTwo?: boolean }> = [
    { title: 'Между своими счетами', text: 'Мгновенно и без комиссии. Валюта пересчитается автоматически.', icon: 'transfer', run: () => onAction('transfer', undefined, 'own'), needsTwo: true },
    { title: 'По номеру счёта', text: 'Клиенту МИК Банка — понадобится 20-значный номер его счёта.', icon: 'send', run: () => onAction('transfer', undefined, 'external') },
    { title: 'Оплата покупки', text: 'Категория определится по названию магазина и попадёт в аналитику трат.', icon: 'card', run: () => onAction('pay') },
    { title: 'Пополнение', text: 'Зачислить деньги на любой свой счёт.', icon: 'download', run: () => onAction('topup') },
  ];

  return (
    <div className="page">
      {disabled && (
        <div className="empty">
          <strong>Нужен хотя бы один счёт</strong>
          <p>Переводы и оплата станут доступны после открытия счёта.</p>
          <button type="button" className="btn btn--brand" onClick={() => onAction('openAccount')}>
            Открыть счёт
          </button>
        </div>
      )}

      <div className="tiles">
        {tiles.map((tile) => (
          <button key={tile.title} type="button" className="tile" disabled={disabled || (tile.needsTwo && activeCount < 2)} onClick={tile.run}>
            <span className="tile__icon">
              <UiIcon name={tile.icon} size={22} />
            </span>
            <strong>{tile.title}</strong>
            <span>{tile.needsTwo && activeCount < 2 && !disabled ? 'Откройте второй счёт, чтобы переводить между своими.' : tile.text}</span>
          </button>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card">
          <div className="card__head">
            <h2>Недавние операции</h2>
            <button type="button" className="link-btn" onClick={() => onNavigate('operations')}>
              Вся история
            </button>
          </div>
          <RecentOperations
            transactions={transactions}
            accounts={accounts}
            limit={8}
            emptyText="Здесь появятся переводы, пополнения и покупки."
          />
        </section>
        <section className="card">
          <div className="card__head">
            <h2>Полезно знать</h2>
          </div>
          <ul className="tips">
            {TIPS.map((tip) => (
              <li key={tip}>
                <UiIcon name="check" size={16} strokeWidth={2.4} />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default PaymentsPage;
