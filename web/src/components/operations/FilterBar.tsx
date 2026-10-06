import { formatMoney, maskAccount } from '../../operations/format';
import { getWindow, parseIsoDate, periodLabel, recentPeriods, shiftAnchor } from '../../operations/period';
import type { AnalyticsPeriod, DirectionFilter, OperationFilters, OperationsAccount } from '../../operations/types';
import { UiIcon } from './Icon';
import Popover from './Popover';

interface FilterBarProps {
  filters: OperationFilters;
  accounts: OperationsAccount[];
  today: string;
  hasActiveFilters: boolean;
  onChange: (patch: Partial<OperationFilters>) => void;
  onReset: () => void;
}

const PERIOD_TABS: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: 'WEEK', label: 'Неделя' },
  { value: 'MONTH', label: 'Месяц' },
  { value: 'YEAR', label: 'Год' },
];

const DIRECTIONS: Array<{ value: DirectionFilter; label: string }> = [
  { value: 'ALL', label: 'Все' },
  { value: 'EXPENSE', label: 'Траты' },
  { value: 'INCOME', label: 'Доходы' },
];

function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }
  return many;
}

function FilterBar({ filters, accounts, today, hasActiveFilters, onChange, onReset }: FilterBarProps) {
  const selected = accounts.filter((account) => filters.accountIds.includes(account.id));
  const first = selected[0];
  const accountsLabel =
    selected.length === 0
      ? 'Счета и карты'
      : selected.length === 1 && first
        ? `${first.name} ${maskAccount(first.number)}`
        : `${selected.length} ${plural(selected.length, 'счёт', 'счёта', 'счетов')}`;
  const currentStart = getWindow(filters.period, filters.anchor).from.getTime();
  const nextStart = getWindow(filters.period, shiftAnchor(filters.period, filters.anchor, 1)).from.getTime();
  const canGoNext = nextStart <= parseIsoDate(today).getTime();

  const toggleAccount = (id: string) =>
    onChange({
      accountIds: filters.accountIds.includes(id)
        ? filters.accountIds.filter((item) => item !== id)
        : [...filters.accountIds, id],
    });

  return (
    <div className="ops-filters" role="toolbar" aria-label="Фильтры операций">
      <Popover label={periodLabel(filters.period, filters.anchor, today)} ariaLabel="Выбор периода" accent>
        {(close) => (
          <div className="ops-period">
            <div className="ops-seg ops-seg--block" role="radiogroup" aria-label="Длина периода">
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="radio"
                  aria-checked={filters.period === tab.value}
                  className={filters.period === tab.value ? 'is-active' : undefined}
                  onClick={() => onChange({ period: tab.value, anchor: today })}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="ops-period__step">
              <button
                type="button"
                className="ops-icon-button"
                aria-label="Предыдущий период"
                onClick={() => onChange({ anchor: shiftAnchor(filters.period, filters.anchor, -1) })}
              >
                <UiIcon name="chevronLeft" size={18} />
              </button>
              <span>{periodLabel(filters.period, filters.anchor, today)}</span>
              <button
                type="button"
                className="ops-icon-button"
                aria-label="Следующий период"
                disabled={!canGoNext}
                onClick={() => onChange({ anchor: shiftAnchor(filters.period, filters.anchor, 1) })}
              >
                <UiIcon name="chevronRight" size={18} />
              </button>
            </div>
            <div className="ops-period__list">
              {recentPeriods(filters.period, today).map((item) => {
                const active = getWindow(filters.period, item.anchor).from.getTime() === currentStart;
                return (
                  <button
                    key={item.anchor}
                    type="button"
                    className={`ops-period__item${active ? ' is-active' : ''}`}
                    onClick={() => {
                      onChange({ anchor: item.anchor });
                      close();
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Popover>

      <Popover label={accountsLabel} ariaLabel="Выбор счетов" active={selected.length > 0}>
        {() => (
          <div className="ops-menu" role="group" aria-label="Счета">
            <button
              type="button"
              className={`ops-menu__item${filters.accountIds.length === 0 ? ' is-checked' : ''}`}
              aria-pressed={filters.accountIds.length === 0}
              onClick={() => onChange({ accountIds: [] })}
            >
              <span className="ops-check">
                <UiIcon name="check" size={14} strokeWidth={3} />
              </span>
              <span className="ops-menu__text">
                <strong>Все счета</strong>
                <small>
                  {accounts.length} {plural(accounts.length, 'счёт', 'счёта', 'счетов')}
                </small>
              </span>
            </button>
            {accounts.map((account) => {
              const checked = filters.accountIds.includes(account.id);
              return (
                <button
                  key={account.id}
                  type="button"
                  className={`ops-menu__item${checked ? ' is-checked' : ''}`}
                  aria-pressed={checked}
                  onClick={() => toggleAccount(account.id)}
                >
                  <span className="ops-check">
                    <UiIcon name="check" size={14} strokeWidth={3} />
                  </span>
                  <span className="ops-menu__text">
                    <strong>{account.name}</strong>
                    <small>
                      {maskAccount(account.number)}
                      {typeof account.balance === 'number' ? `  ${formatMoney(account.balance, account.currency)}` : ''}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Popover>

      <button
        type="button"
        className={`ops-pill${filters.excludeTransfers ? ' is-active' : ''}`}
        aria-pressed={filters.excludeTransfers}
        onClick={() => onChange({ excludeTransfers: !filters.excludeTransfers })}
      >
        Без переводов
      </button>

      <div className="ops-seg" role="radiogroup" aria-label="Тип операций">
        {DIRECTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={filters.direction === item.value}
            className={filters.direction === item.value ? 'is-active' : undefined}
            onClick={() => onChange({ direction: item.value })}
          >
            {item.label}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button type="button" className="ops-link" onClick={onReset}>
          Сбросить
        </button>
      )}
    </div>
  );
}

export default FilterBar;
