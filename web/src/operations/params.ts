import { getWindow, lastDayIso, toIsoDate } from './period';
import type { AnalyticsPeriod, DirectionFilter, OperationFilters } from './types';

/** Параметры GET /api/operations — те же поля, что OperationSearchFilter на бэкенде. */
export interface SearchParams {
  query?: string;
  categories?: string[];
  direction?: DirectionFilter;
  accountIds?: string[];
  excludeTransfers?: boolean;
  /** YYYY-MM-DD, включительно. */
  from?: string;
  /** YYYY-MM-DD, включительно. */
  to?: string;
  page?: number;
  size?: number;
}

/** Параметры GET /api/operations/analytics. */
export interface AnalyticsParams {
  period: AnalyticsPeriod;
  date: string;
  accountIds?: string[];
  excludeTransfers?: boolean;
  currency: string;
}

export function filtersToSearchParams(filters: OperationFilters, page: number, size: number): SearchParams {
  const window = getWindow(filters.period, filters.anchor);
  return {
    query: filters.query || undefined,
    categories: filters.categories,
    direction: filters.direction,
    accountIds: filters.accountIds,
    excludeTransfers: filters.excludeTransfers,
    from: toIsoDate(window.from),
    to: lastDayIso(window),
    page,
    size,
  };
}

export function filtersToAnalyticsParams(filters: OperationFilters, currency: string): AnalyticsParams {
  return {
    period: filters.period,
    date: filters.anchor,
    accountIds: filters.accountIds,
    excludeTransfers: filters.excludeTransfers,
    currency,
  };
}
