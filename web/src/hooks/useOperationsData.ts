import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { operationsApi } from '../api/operationsApi';
import { computeAnalytics, searchOperations, suggestLocal, toLocalOperations } from '../operations/localEngine';
import { filtersToAnalyticsParams, filtersToSearchParams } from '../operations/params';
import type {
  DataSource,
  Operation,
  OperationFilters,
  OperationsAccount,
  OperationsAnalytics,
  OperationsSourceTransaction,
  Suggestion,
} from '../operations/types';

const PAGE_SIZE = 40;

interface Snapshot {
  filters: OperationFilters;
  currency: string;
  reloadToken: number;
  sourceKey: string;
}

interface LoadedState {
  snapshot: Snapshot;
  source: DataSource;
  items: Operation[];
  total: number;
  page: number;
  hasNext: boolean;
  analytics: OperationsAnalytics;
  error: string | null;
}

interface UseOperationsDataArgs {
  filters: OperationFilters;
  accounts: OperationsAccount[];
  transactions?: OperationsSourceTransaction[];
  currency: string;
  reloadToken: number;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Сервис операций недоступен';
}

async function loadFirstPage(
  snapshot: Snapshot,
  accounts: OperationsAccount[],
  transactions: OperationsSourceTransaction[] | undefined,
): Promise<LoadedState> {
  try {
    const [page, analytics] = await Promise.all([
      operationsApi.search(filtersToSearchParams(snapshot.filters, 0, PAGE_SIZE)),
      operationsApi.analytics(filtersToAnalyticsParams(snapshot.filters, snapshot.currency)),
    ]);
    return {
      snapshot,
      source: 'server',
      items: page.items,
      total: page.totalElements,
      page: 0,
      hasNext: page.hasNext,
      analytics,
      error: null,
    };
  } catch (error) {
    const operations = toLocalOperations(transactions ?? [], accounts);
    const page = searchOperations(operations, filtersToSearchParams(snapshot.filters, 0, PAGE_SIZE));
    return {
      snapshot,
      source: 'local',
      items: page.items,
      total: page.totalElements,
      page: 0,
      hasNext: page.hasNext,
      analytics: computeAnalytics(operations, filtersToAnalyticsParams(snapshot.filters, snapshot.currency)),
      error: errorText(error),
    };
  }
}

/**
 * Загружает операции и аналитику с сервера. Если новый API недоступен — считает всё на клиенте
 * по истории транзакций, чтобы раздел работал в любом режиме.
 */
export function useOperationsData({ filters, accounts, transactions, currency, reloadToken }: UseOperationsDataArgs) {
  const accountsRef = useRef(accounts);
  const transactionsRef = useRef(transactions);
  useEffect(() => {
    accountsRef.current = accounts;
    transactionsRef.current = transactions;
  });

  const sourceKey = useMemo(
    () =>
      `${(transactions ?? []).map((item) => `${item.id}:${item.amount}:${item.status ?? ''}`).join('|')}#${accounts
        .map((account) => `${account.id}:${account.number}`)
        .join('|')}`,
    [transactions, accounts],
  );

  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const snapshot: Snapshot = { filters, currency, reloadToken, sourceKey };
    loadFirstPage(snapshot, accountsRef.current, transactionsRef.current).then((result) => {
      if (!cancelled) {
        setLoaded(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filters, currency, reloadToken, sourceKey]);

  const loading =
    !loaded ||
    loaded.snapshot.filters !== filters ||
    loaded.snapshot.currency !== currency ||
    loaded.snapshot.reloadToken !== reloadToken ||
    loaded.snapshot.sourceKey !== sourceKey;

  const loadMore = useCallback(async () => {
    if (!loaded || !loaded.hasNext || loadingMore) {
      return;
    }
    setLoadingMore(true);
    const nextPage = loaded.page + 1;
    try {
      const params = filtersToSearchParams(loaded.snapshot.filters, nextPage, PAGE_SIZE);
      const page =
        loaded.source === 'server'
          ? await operationsApi.search(params)
          : searchOperations(toLocalOperations(transactionsRef.current ?? [], accountsRef.current), params);
      setLoaded((current) =>
        current && current.snapshot === loaded.snapshot
          ? { ...current, items: [...current.items, ...page.items], page: nextPage, hasNext: page.hasNext }
          : current,
      );
    } catch (error) {
      setLoaded((current) => (current ? { ...current, error: errorText(error) } : current));
    } finally {
      setLoadingMore(false);
    }
  }, [loaded, loadingMore]);

  const source = loaded?.source ?? 'server';
  const suggest = useCallback(
    async (query: string): Promise<Suggestion[]> => {
      if (source === 'server') {
        try {
          return await operationsApi.suggestions(query);
        } catch (error) {
          void error;
        }
      }
      return suggestLocal(toLocalOperations(transactionsRef.current ?? [], accountsRef.current), query);
    },
    [source],
  );

  return {
    loading,
    loadingMore,
    source,
    error: loaded?.error ?? null,
    items: loaded?.items ?? [],
    total: loaded?.total ?? 0,
    hasNext: loaded?.hasNext ?? false,
    analytics: loaded?.analytics ?? null,
    loadMore,
    suggest,
  };
}
