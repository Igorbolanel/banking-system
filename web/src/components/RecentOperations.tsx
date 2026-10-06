import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { operationsApi } from '../api/operationsApi';
import { formatSignedMoney } from '../operations/format';
import { toLocalOperations } from '../operations/localEngine';
import type { Operation } from '../operations/types';
import type { Account, Transaction } from '../types/banking';
import { formatDateTime } from '../utils/formatters';
import { CategoryIcon } from './operations/Icon';

interface RecentOperationsProps {
  transactions: Transaction[];
  accounts: Account[];
  limit?: number;
  emptyText: string;
}

/**
 * Последние операции с иконками категорий — для главной и платежей.
 * Названия магазинов и категории берутся из API операций; пока он не ответил
 * (или если его нет на сервере) — показывается локальная история.
 */
function RecentOperations({ transactions, accounts, limit = 6, emptyText }: RecentOperationsProps) {
  const local = useMemo(() => toLocalOperations(transactions.slice(0, limit), accounts), [transactions, accounts, limit]);
  const key = `${transactions.length}:${transactions.slice(0, limit).map((item) => item.id).join('|')}`;
  const [server, setServer] = useState<{ key: string; items: Operation[] | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    operationsApi.search({ size: limit }).then(
      (page) => {
        if (!cancelled) setServer({ key, items: page.items });
      },
      () => {
        if (!cancelled) setServer({ key, items: null });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, limit]);

  const operations = server?.items && server.key === key ? server.items : local;

  if (operations.length === 0) {
    return (
      <div className="empty">
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="list">
      {operations.map((operation) => (
        <div key={operation.id} className="list-row">
          <span className="ops-bubble" style={{ '--chip': operation.categoryColor } as CSSProperties}>
            <CategoryIcon name={operation.categoryIcon} size={20} color="#fff" strokeWidth={2.1} />
          </span>
          <span className="list-row__main">
            <span className="list-row__title">{operation.title}</span>
            <span className="list-row__meta">
              {operation.categoryLabel}, {formatDateTime(operation.createdAt)}
            </span>
          </span>
          <span className="list-row__side">
            <span className={`amount ${operation.direction === 'INCOME' ? 'positive' : ''}`}>
              {formatSignedMoney(operation.amount, operation.currency, operation.direction)}
            </span>
            {operation.status !== 'COMPLETED' && <small>{operation.status === 'PENDING' ? 'В обработке' : 'Не выполнена'}</small>}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RecentOperations;
