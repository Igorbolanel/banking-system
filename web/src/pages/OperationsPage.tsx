import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { operationsApi } from '../api/operationsApi';
import AnalyticsPanel from '../components/operations/AnalyticsPanel';
import FilterBar from '../components/operations/FilterBar';
import { CategoryIcon, UiIcon } from '../components/operations/Icon';
import OperationDetails from '../components/operations/OperationDetails';
import OperationsList from '../components/operations/OperationsList';
import PaymentModal from '../components/operations/PaymentModal';
import SearchBox from '../components/operations/SearchBox';
import SummaryCard from '../components/operations/SummaryCard';
import { useOperationsData } from '../hooks/useOperationsData';
import { getCategory } from '../operations/categories';
import { pickAnalyticsCurrency } from '../operations/currency';
import { accountLabelFor, formatMoney } from '../operations/format';
import { todayIso } from '../operations/period';
import { subscribeOperationsSearch, takePendingSearch } from '../operations/searchBus';
import type { OperationsSearchRequest } from '../operations/searchBus';
import type {
  AnalyticsPeriod,
  AnalyticsSideKey,
  ChartMode,
  Operation,
  OperationFilters,
  OperationsAccount,
  OperationsSourceTransaction,
  PaymentPayload,
} from '../operations/types';
import '../styles/operations.css';

interface OperationsPageProps {
  /** Счета пользователя — state.accounts из useBankingState. */
  accounts: OperationsAccount[];
  /** История из useBankingState. Нужна, чтобы раздел работал, пока новый API не задеплоен. */
  transactions?: OperationsSourceTransaction[];
  /** Вызывается после оплаты или смены категории — чтобы App обновил балансы и историю. */
  onDataChanged?: () => void;
}

function defaultFilters(): OperationFilters {
  return {
    query: '',
    categories: [],
    direction: 'ALL',
    accountIds: [],
    excludeTransfers: false,
    period: 'MONTH',
    anchor: todayIso(),
  };
}

function applyRequest(filters: OperationFilters, request: OperationsSearchRequest | null): OperationFilters {
  if (!request) {
    return filters;
  }
  return {
    ...filters,
    query: request.query ?? '',
    categories: request.category ? [request.category] : [],
    direction: 'ALL',
  };
}

function OperationsPage({ accounts, transactions, onDataChanged }: OperationsPageProps) {
  const [filters, setFilters] = useState<OperationFilters>(() => applyRequest(defaultFilters(), takePendingSearch()));
  const [side, setSide] = useState<AnalyticsSideKey | null>('expenses');
  const [chartMode, setChartMode] = useState<ChartMode>('donut');
  const [reloadToken, setReloadToken] = useState(0);
  const [selected, setSelected] = useState<Operation | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [today] = useState(todayIso);

  useEffect(
    () =>
      subscribeOperationsSearch((request) => {
        takePendingSearch();
        setFilters((current) => applyRequest(current, request));
      }),
    [],
  );

  const currency = useMemo(() => pickAnalyticsCurrency(accounts, filters.accountIds), [accounts, filters.accountIds]);
  const data = useOperationsData({ filters, accounts, transactions, currency, reloadToken });
  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);

  const updateFilters = useCallback((patch: Partial<OperationFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const commitQuery = useCallback((query: string) => {
    setFilters((current) => (current.query === query ? current : { ...current, query }));
  }, []);

  const pickCategory = useCallback((code: string) => {
    setFilters((current) =>
      current.categories.includes(code) ? current : { ...current, categories: [...current.categories, code] },
    );
  }, []);

  const toggleCategory = useCallback((code: string, fromSide: AnalyticsSideKey) => {
    const sideDirection = fromSide === 'expenses' ? 'EXPENSE' : 'INCOME';
    setFilters((current) => {
      if (current.categories.includes(code)) {
        const categories = current.categories.filter((item) => item !== code);
        return { ...current, categories, direction: categories.length ? current.direction : 'ALL' };
      }
      if (current.direction !== sideDirection) {
        return { ...current, categories: [code], direction: sideDirection };
      }
      return { ...current, categories: [...current.categories, code] };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((current) => ({ ...defaultFilters(), period: current.period, anchor: current.anchor }));
  }, []);

  const hasActiveFilters =
    filters.query !== '' ||
    filters.categories.length > 0 ||
    filters.direction !== 'ALL' ||
    filters.accountIds.length > 0 ||
    filters.excludeTransfers;

  const analytics = data.analytics;
  const sideData = side && analytics ? (side === 'expenses' ? analytics.expenses : analytics.income) : null;

  const pay = async (payload: PaymentPayload) => {
    const operation = await operationsApi.createPayment(payload);
    setPaymentOpen(false);
    setNotice(`Покупка «${operation.title}» на ${formatMoney(operation.amount, operation.currency)} проведена`);
    setReloadToken((value) => value + 1);
    onDataChanged?.();
  };

  const changeCategory = async (code: string) => {
    if (!selected) {
      return;
    }
    const updated = await operationsApi.updateCategory(selected.id, code);
    setSelected(updated);
    setReloadToken((value) => value + 1);
    onDataChanged?.();
  };

  return (
    <section className="ops ops-theme" aria-label="Операции">
      <div className="ops-top">
        <SearchBox value={filters.query} onCommit={commitQuery} onPickCategory={pickCategory} suggest={data.suggest} />
        <button type="button" className="ops-button ops-button--primary ops-top__pay" onClick={() => setPaymentOpen(true)}>
          <UiIcon name="plus" size={18} strokeWidth={2.4} />
          <span>Новая покупка</span>
        </button>
      </div>

      <FilterBar
        filters={filters}
        accounts={accounts}
        today={today}
        hasActiveFilters={hasActiveFilters}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {filters.categories.length > 0 && (
        <div className="ops-tags" aria-label="Выбранные категории">
          {filters.categories.map((code) => {
            const category = getCategory(code);
            return (
              <button
                key={code}
                type="button"
                className="ops-tag"
                style={{ '--chip': category.color } as CSSProperties}
                aria-label={`Убрать фильтр «${category.label}»`}
                onClick={() => updateFilters({ categories: filters.categories.filter((item) => item !== code) })}
              >
                <CategoryIcon name={category.icon} size={14} strokeWidth={2.4} />
                {category.label}
                <UiIcon name="close" size={14} strokeWidth={2.4} />
              </button>
            );
          })}
        </div>
      )}

      {data.source === 'local' && (
        <div className="ops-banner" role="status">
          <UiIcon name="info" size={18} />
          <span>
            Сервер операций не ответил, поэтому данные посчитаны по истории в приложении. Поиск и диаграммы работают,
            оплата покупок — после запуска сервера.
          </span>
        </div>
      )}
      {analytics && analytics.skippedCurrencies.length > 0 && (
        <div className="ops-banner" role="status">
          <UiIcon name="info" size={18} />
          <span>
            Операции в {analytics.skippedCurrencies.join(', ')} не вошли в диаграммы: не удалось получить курс.
          </span>
        </div>
      )}
      {notice && (
        <div className="ops-banner ops-banner--success" role="status">
          <UiIcon name="check" size={18} strokeWidth={2.4} />
          <span>{notice}</span>
          <button type="button" className="ops-icon-button" aria-label="Скрыть сообщение" onClick={() => setNotice(null)}>
            <UiIcon name="close" size={16} />
          </button>
        </div>
      )}

      <div className="ops-layout">
        <aside className="ops-insights" aria-label="Аналитика">
          <div className="ops-summary">
            <SummaryCard
              title="Траты"
              total={analytics?.expenses.total ?? 0}
              currency={currency}
              categories={analytics?.expenses.categories ?? []}
              active={side === 'expenses'}
              loading={data.loading}
              onClick={() => setSide((current) => (current === 'expenses' ? null : 'expenses'))}
            />
            <SummaryCard
              title="Доходы"
              total={analytics?.income.total ?? 0}
              currency={currency}
              categories={analytics?.income.categories ?? []}
              active={side === 'income'}
              loading={data.loading}
              onClick={() => setSide((current) => (current === 'income' ? null : 'income'))}
            />
          </div>
          {side && sideData && analytics && (
            <AnalyticsPanel
              side={side}
              data={sideData}
              timeline={analytics.timeline}
              currency={currency}
              period={filters.period}
              chartMode={chartMode}
              activeKeys={filters.categories}
              loading={data.loading}
              animationKey={`${side}-${analytics.period}-${analytics.from}-${filters.accountIds.join(',')}-${filters.excludeTransfers}`}
              onPeriodChange={(period: AnalyticsPeriod) => updateFilters({ period, anchor: today })}
              onChartModeChange={setChartMode}
              onToggleCategory={(code) => toggleCategory(code, side)}
              onClose={() => setSide(null)}
            />
          )}
        </aside>

        <div className="ops-feed">
          <div className="ops-feed__head">
            <h2>История</h2>
            {!data.loading && (
              <span>
                {data.total} {data.total % 10 === 1 && data.total % 100 !== 11 ? 'операция' : data.total % 10 >= 2 && data.total % 10 <= 4 && (data.total % 100 < 12 || data.total % 100 > 14) ? 'операции' : 'операций'}
              </span>
            )}
          </div>
          <OperationsList
            items={data.items}
            total={data.total}
            loading={data.loading}
            loadingMore={data.loadingMore}
            hasNext={data.hasNext}
            query={filters.query}
            accounts={accountsById}
            hasActiveFilters={hasActiveFilters}
            onLoadMore={() => {
              void data.loadMore();
            }}
            onOpen={setSelected}
            onReset={resetFilters}
          />
        </div>
      </div>

      {selected && (
        <OperationDetails
          operation={selected}
          accountLabel={accountLabelFor(selected, accountsById)}
          editable={data.source === 'server'}
          onClose={() => setSelected(null)}
          onChangeCategory={changeCategory}
        />
      )}
      {paymentOpen && (
        <PaymentModal
          accounts={accounts}
          defaultAccountId={filters.accountIds[0]}
          disabledReason={data.source === 'local' ? 'Оплата станет доступна, когда сервер операций ответит.' : null}
          onClose={() => setPaymentOpen(false)}
          onSubmit={pay}
        />
      )}
    </section>
  );
}

export default OperationsPage;
