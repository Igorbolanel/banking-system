import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import {
  accountLabelFor,
  dayKey,
  formatDayTitle,
  formatMoney,
  formatSignedMoney,
  formatTime,
} from '../../operations/format';
import { queryTokens } from '../../operations/localEngine';
import type { Operation, OperationsAccount } from '../../operations/types';
import { CategoryIcon, UiIcon } from './Icon';

interface OperationsListProps {
  items: Operation[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  hasNext: boolean;
  query: string;
  accounts: Map<string, OperationsAccount>;
  hasActiveFilters: boolean;
  onLoadMore: () => void;
  onOpen: (operation: Operation) => void;
  onReset: () => void;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, query: string): ReactNode {
  const tokens = queryTokens(query).filter((token) => token.length > 1 && !/^\d/.test(token));
  if (!tokens.length) {
    return text;
  }
  const pattern = new RegExp(`(${tokens.map((token) => escapeRegExp(token).replace(/е/g, '[её]')).join('|')})`, 'gi');
  return text.split(pattern).map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part));
}

function OperationsList({
  items,
  total,
  loading,
  loadingMore,
  hasNext,
  query,
  accounts,
  hasActiveFilters,
  onLoadMore,
  onOpen,
  onReset,
}: OperationsListProps) {
  const groups = useMemo(() => {
    const result: Array<{ key: string; items: Operation[] }> = [];
    for (const operation of items) {
      const key = dayKey(operation.createdAt);
      const last = result[result.length - 1];
      if (last && last.key === key) {
        last.items.push(operation);
      } else {
        result.push({ key, items: [operation] });
      }
    }
    return result;
  }, [items]);

  if (loading && items.length === 0) {
    return (
      <div className="ops-list" aria-busy="true" aria-label="Загружаем операции">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="ops-skeleton">
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ops-empty">
        <span className="ops-empty__icon">
          <UiIcon name="search" size={26} />
        </span>
        <h3>{query ? 'Ничего не нашлось' : 'Операций за этот период нет'}</h3>
        <p>
          {query || hasActiveFilters
            ? 'Измените запрос, период или снимите фильтры.'
            : 'Здесь появятся покупки, переводы и пополнения.'}
        </p>
        {hasActiveFilters && (
          <button type="button" className="ops-button" onClick={onReset}>
            Сбросить фильтры
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`ops-list${loading ? ' is-stale' : ''}`} aria-busy={loading}>
      {groups.map((group) => {
        const expenses = group.items.filter((operation) => operation.direction === 'EXPENSE');
        const currencies = new Set(expenses.map((operation) => operation.currency));
        const daySpent = expenses.reduce((sum, operation) => sum + operation.amount, 0);
        return (
          <section key={group.key} className="ops-day">
            <header className="ops-day__head">
              <h3>{formatDayTitle(group.key)}</h3>
              {expenses.length > 0 && currencies.size === 1 && (
                <span>−{formatMoney(daySpent, expenses[0]?.currency ?? 'RUB')}</span>
              )}
            </header>
            <ul>
              {group.items.map((operation) => {
                const account = accountLabelFor(operation, accounts);
                return (
                  <li key={operation.id}>
                    <button type="button" className="ops-row" onClick={() => onOpen(operation)}>
                      <span className="ops-bubble" style={{ '--chip': operation.categoryColor } as CSSProperties}>
                        <CategoryIcon name={operation.categoryIcon} size={20} color="#fff" strokeWidth={2.1} />
                      </span>
                      <span className="ops-row__main">
                        <span className="ops-row__title">{highlight(operation.title, query)}</span>
                        <span className="ops-row__meta">
                          <span>{highlight(operation.categoryLabel, query)}</span>
                          {account && <span className="ops-row__account">{account}</span>}
                        </span>
                      </span>
                      <span className="ops-row__side">
                        <span className={`ops-amount ops-amount--${operation.direction.toLowerCase()}`}>
                          {formatSignedMoney(operation.amount, operation.currency, operation.direction)}
                        </span>
                        <span className={`ops-row__time${operation.status === 'COMPLETED' ? '' : ' is-warning'}`}>
                          {operation.status === 'PENDING'
                            ? 'В обработке'
                            : operation.status === 'FAILED'
                              ? 'Отклонена'
                              : formatTime(operation.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {hasNext && (
        <button type="button" className="ops-button ops-list__more" disabled={loadingMore} onClick={onLoadMore}>
          {loadingMore ? 'Загружаем…' : `Показать ещё ${Math.max(0, total - items.length)}`}
        </button>
      )}
    </div>
  );
}

export default OperationsList;
