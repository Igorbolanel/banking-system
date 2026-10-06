export type OperationDirection = 'INCOME' | 'EXPENSE' | 'INTERNAL';
export type DirectionFilter = 'ALL' | 'EXPENSE' | 'INCOME';
export type AnalyticsPeriod = 'WEEK' | 'MONTH' | 'YEAR';
export type AnalyticsSideKey = 'expenses' | 'income';
export type ChartMode = 'donut' | 'bars';
export type CategoryKind = 'EXPENSE' | 'INCOME' | 'BOTH';
export type DataSource = 'server' | 'local';

export interface CategoryInfo {
  code: string;
  label: string;
  color: string;
  icon: string;
  kind: CategoryKind;
}

export interface Operation {
  id: string;
  direction: OperationDirection;
  type: string;
  status: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  categoryIcon: string;
  title: string;
  description: string | null;
  /** Всегда положительная, знак зависит от direction. */
  amount: number;
  currency: string;
  accountId: string;
  accountNumber: string | null;
  counterpartyAccountNumber: string | null;
  createdAt: string;
  categoryEditable: boolean;
}

export interface OperationPage {
  items: Operation[];
  page: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
}

export interface CategoryStat {
  category: string;
  label: string;
  color: string;
  icon: string;
  amount: number;
  percent: number;
  share: number;
  count: number;
}

export interface AnalyticsSide {
  total: number;
  previousTotal: number;
  difference: number;
  categories: CategoryStat[];
}

export interface TimelinePoint {
  from: string;
  to: string;
  label: string;
  expense: number;
  income: number;
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}

export interface OperationsAnalytics {
  period: AnalyticsPeriod;
  from: string;
  to: string;
  label: string;
  currency: string;
  expenses: AnalyticsSide;
  income: AnalyticsSide;
  timeline: TimelinePoint[];
  skippedCurrencies: string[];
}

export interface OperationFilters {
  query: string;
  categories: string[];
  direction: DirectionFilter;
  accountIds: string[];
  excludeTransfers: boolean;
  period: AnalyticsPeriod;
  /** Любая дата внутри выбранного периода, формат YYYY-MM-DD. */
  anchor: string;
}

export interface Suggestion {
  kind: 'category' | 'merchant';
  value: string;
  label: string;
  category?: string;
}

export interface PaymentPayload {
  accountId: string;
  amount: number;
  merchant: string;
  category?: string;
}

/** Минимум полей счёта, который нужен разделу. Совместим с Account из types/banking.ts. */
export interface OperationsAccount {
  id: string;
  name: string;
  number: string;
  currency: string;
  status?: string;
  balance?: number;
}

/** Минимум полей транзакции из useBankingState — для работы без нового API. */
export interface OperationsSourceTransaction {
  id: string;
  title?: string;
  category?: string;
  amount: number;
  currency: string;
  createdAt: string;
  status?: string;
  accountId?: string;
  type?: string;
}
