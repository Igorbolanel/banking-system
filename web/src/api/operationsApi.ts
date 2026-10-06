import { getCategory } from '../operations/categories';
import type { AnalyticsParams, SearchParams } from '../operations/params';
import type {
  AnalyticsPeriod,
  AnalyticsSide,
  CategoryInfo,
  CategoryKind,
  CategoryStat,
  Operation,
  OperationPage,
  OperationsAnalytics,
  PaymentPayload,
  Suggestion,
  TimelinePoint,
} from '../operations/types';
import { API_URLS } from './config';
import { request } from './http';

type Raw = Record<string, unknown>;

function base(): string {
  return `${API_URLS.core}/api/operations`;
}

function str(value: unknown, fallback = ''): string {
  return value === null || value === undefined ? fallback : String(value);
}

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function list(value: unknown): Raw[] {
  return Array.isArray(value) ? (value as Raw[]) : [];
}

function numberMap(value: unknown): Record<string, number> {
  const result: Record<string, number> = {};
  if (value && typeof value === 'object') {
    Object.entries(value as Raw).forEach(([key, amount]) => {
      result[key] = num(amount);
    });
  }
  return result;
}

function buildQuery(params: Record<string, string | number | boolean | string[] | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === false || (Array.isArray(value) && value.length === 0)) {
      return;
    }
    search.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

export function mapOperation(raw: Raw): Operation {
  const category = getCategory(str(raw.category, 'OTHER'));
  const direction = str(raw.direction);
  return {
    id: str(raw.id),
    direction: direction === 'INCOME' || direction === 'INTERNAL' ? direction : 'EXPENSE',
    type: str(raw.type),
    status: str(raw.status, 'COMPLETED'),
    category: category.code,
    categoryLabel: str(raw.categoryLabel, category.label),
    categoryColor: str(raw.categoryColor, category.color),
    categoryIcon: str(raw.categoryIcon, category.icon),
    title: str(raw.title, category.label),
    description: raw.description === null || raw.description === undefined ? null : str(raw.description),
    amount: num(raw.amount),
    currency: str(raw.currency, 'RUB'),
    accountId: str(raw.accountId),
    accountNumber: raw.accountNumber === null || raw.accountNumber === undefined ? null : str(raw.accountNumber),
    counterpartyAccountNumber:
      raw.counterpartyAccountNumber === null || raw.counterpartyAccountNumber === undefined
        ? null
        : str(raw.counterpartyAccountNumber),
    createdAt: str(raw.createdAt, new Date().toISOString()),
    categoryEditable: Boolean(raw.categoryEditable),
  };
}

function mapStat(raw: Raw): CategoryStat {
  const category = getCategory(str(raw.category, 'OTHER'));
  return {
    category: category.code,
    label: str(raw.label, category.label),
    color: str(raw.color, category.color),
    icon: str(raw.icon, category.icon),
    amount: num(raw.amount),
    percent: num(raw.percent),
    share: num(raw.share),
    count: num(raw.count),
  };
}

function mapSide(raw: unknown): AnalyticsSide {
  const value = (raw ?? {}) as Raw;
  return {
    total: num(value.total),
    previousTotal: num(value.previousTotal),
    difference: num(value.difference),
    categories: list(value.categories).map(mapStat),
  };
}

function mapPoint(raw: Raw): TimelinePoint {
  return {
    from: str(raw.from),
    to: str(raw.to),
    label: str(raw.label),
    expense: num(raw.expense),
    income: num(raw.income),
    expenseByCategory: numberMap(raw.expenseByCategory),
    incomeByCategory: numberMap(raw.incomeByCategory),
  };
}

function mapAnalytics(raw: Raw): OperationsAnalytics {
  const period = str(raw.period, 'MONTH');
  return {
    period: (period === 'WEEK' || period === 'YEAR' ? period : 'MONTH') as AnalyticsPeriod,
    from: str(raw.from),
    to: str(raw.to),
    label: str(raw.label),
    currency: str(raw.currency, 'RUB'),
    expenses: mapSide(raw.expenses),
    income: mapSide(raw.income),
    timeline: list(raw.timeline).map(mapPoint),
    skippedCurrencies: Array.isArray(raw.skippedCurrencies) ? raw.skippedCurrencies.map((item) => str(item)) : [],
  };
}

export const operationsApi = {
  async search(params: SearchParams): Promise<OperationPage> {
    const raw = await request<Raw>(
      `${base()}${buildQuery({
        query: params.query,
        categories: params.categories,
        direction: params.direction === 'ALL' ? undefined : params.direction,
        accountIds: params.accountIds,
        excludeTransfers: params.excludeTransfers,
        from: params.from,
        to: params.to,
        page: params.page,
        size: params.size,
      })}`,
    );
    return {
      items: list(raw.items).map(mapOperation),
      page: num(raw.page),
      size: num(raw.size),
      totalElements: num(raw.totalElements),
      hasNext: Boolean(raw.hasNext),
    };
  },

  async analytics(params: AnalyticsParams): Promise<OperationsAnalytics> {
    const raw = await request<Raw>(
      `${base()}/analytics${buildQuery({
        period: params.period,
        date: params.date,
        accountIds: params.accountIds,
        excludeTransfers: params.excludeTransfers,
        currency: params.currency,
      })}`,
    );
    return mapAnalytics(raw);
  },

  async categories(): Promise<CategoryInfo[]> {
    const raw = await request<Raw[]>(`${base()}/categories`);
    return list(raw).map((item) => ({
      code: str(item.code),
      label: str(item.label),
      color: str(item.color),
      icon: str(item.icon),
      kind: str(item.kind, 'BOTH') as CategoryKind,
    }));
  },

  async suggestions(query: string): Promise<Suggestion[]> {
    const raw = await request<Raw[]>(`${base()}/suggestions${buildQuery({ query })}`, { timeoutMs: 4000 });
    return list(raw).map((item) => ({
      kind: str(item.type) === 'CATEGORY' ? 'category' : 'merchant',
      value: str(item.value),
      label: str(item.label),
      category: item.category === null || item.category === undefined ? undefined : str(item.category),
    }));
  },

  async updateCategory(id: string, category: string): Promise<Operation> {
    const raw = await request<Raw>(`${base()}/${encodeURIComponent(id)}/category`, {
      method: 'POST',
      body: JSON.stringify({ category }),
    });
    return mapOperation(raw);
  },

  async createPayment(payload: PaymentPayload): Promise<Operation> {
    const raw = await request<Raw>(`${base()}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        accountId: Number(payload.accountId),
        amount: payload.amount,
        merchant: payload.merchant,
        category: payload.category || undefined,
      }),
    });
    return mapOperation(raw);
  },
};
