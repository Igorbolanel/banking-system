import { useState } from 'react';
import type { CSSProperties } from 'react';

import { categoriesFor } from '../../operations/categories';
import { formatDateTime, formatSignedMoney } from '../../operations/format';
import type { Operation } from '../../operations/types';
import { CategoryIcon } from './Icon';
import Modal from './Modal';

interface OperationDetailsProps {
  operation: Operation;
  accountLabel: string;
  /** false — категорию менять нельзя (нет связи с сервером). */
  editable: boolean;
  onClose: () => void;
  onChangeCategory: (code: string) => Promise<void>;
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Выполнена',
  PENDING: 'В обработке',
  FAILED: 'Отклонена',
};

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: 'Пополнение',
  WITHDRAWAL: 'Списание',
  TRANSFER: 'Перевод',
};

function OperationDetails({ operation, accountLabel, editable, onClose, onChangeCategory }: OperationDetailsProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const canEdit = editable && operation.categoryEditable && operation.direction !== 'INTERNAL';
  const options = operation.direction === 'INTERNAL' ? [] : categoriesFor(operation.direction);

  const change = async (code: string) => {
    if (code === operation.category) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await onChangeCategory(code);
      setMessage({ tone: 'success', text: 'Категория изменена — диаграммы уже пересчитаны' });
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Не удалось изменить категорию' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Операция"
      onClose={onClose}
      footer={
        <button type="button" className="ops-button" onClick={onClose}>
          Закрыть
        </button>
      }
    >
      <div className="ops-receipt">
        <span className="ops-bubble ops-bubble--lg" style={{ '--chip': operation.categoryColor } as CSSProperties}>
          <CategoryIcon name={operation.categoryIcon} size={28} color="#fff" strokeWidth={2} />
        </span>
        <strong className={`ops-receipt__amount ops-amount--${operation.direction.toLowerCase()}`}>
          {formatSignedMoney(operation.amount, operation.currency, operation.direction)}
        </strong>
        <span className="ops-receipt__title">{operation.title}</span>
        <span className="ops-receipt__date">{formatDateTime(operation.createdAt)}</span>
      </div>
      <dl className="ops-facts">
        <div>
          <dt>Категория</dt>
          <dd>
            {canEdit ? (
              <select
                className="ops-select"
                value={operation.category}
                disabled={saving}
                aria-label="Категория операции"
                onChange={(event) => {
                  void change(event.target.value);
                }}
              >
                {options.map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.label}
                  </option>
                ))}
              </select>
            ) : (
              operation.categoryLabel
            )}
          </dd>
        </div>
        {accountLabel && (
          <div>
            <dt>Счёт</dt>
            <dd>{accountLabel}</dd>
          </div>
        )}
        {operation.counterpartyAccountNumber && (
          <div>
            <dt>{operation.direction === 'INCOME' ? 'Отправитель' : 'Получатель'}</dt>
            <dd>Счёт {operation.counterpartyAccountNumber}</dd>
          </div>
        )}
        <div>
          <dt>Тип</dt>
          <dd>{TYPE_LABELS[operation.type] ?? (operation.type || 'Операция')}</dd>
        </div>
        <div>
          <dt>Статус</dt>
          <dd>{STATUS_LABELS[operation.status] ?? operation.status}</dd>
        </div>
      </dl>
      {message && (
        <p className={`ops-note ops-note--${message.tone}`} role="status">
          {message.text}
        </p>
      )}
      {!editable && operation.direction !== 'INTERNAL' && (
        <p className="ops-note">Сменить категорию можно, когда сервер операций доступен.</p>
      )}
    </Modal>
  );
}

export default OperationDetails;
