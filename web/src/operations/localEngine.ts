/**
 * Расчёты на клиенте. Используются, когда новый API ещё не задеплоен или сервер недоступен:
 * раздел всё равно работает по истории из useBankingState. Логика повторяет OperationsService.
 */
import { CATEGORY_CATALOG, detectCategory, getCategory, normalizeText } from './categories';
import { bucketsFor, getWindow, parseIsoDate, periodLabel, previousWindow, toIsoDate } from './period';
import type { AnalyticsParams, SearchParams } from './params';
import type {
  AnalyticsSide,
  CategoryStat,
  Operation,
  OperationPage,
  OperationsAccount,
  OperationsAnalytics,
  OperationsSourceTransaction,
  Suggestion,
  TimelinePoint,
} from './types';

const NUMBER = /^\d+(\.\d{1,2})?$/;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Целые проценты, сумма которых ровно 100 (метод наибольшего остатка). */
export function allocatePercents(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total <= 0) {
    return values.map(() => 0);
  }
  const exact = values.map((value) => (Math.max(0, value) * 100) / total);
  const result = exact.map((value) => Math.floor(value));
  let left = 100 - result.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest);
  for (const item of order) {
    if (left <= 0) {
      break;
    }
    result[item.index] = (result[item.index] ?? 0) + 1;
    left -= 1;
  }
  return result;
}

function resolveLocalCategory(transaction: OperationsSourceTransaction): string {
  const byLabel = CATEGORY_CATALOG.find((category) => normalizeText(category.label) === normalizeText(transaction.category));
  if (byLabel) {
    return byLabel.code;
  }
  const detected = detectCategory(`${transaction.title ?? ''} ${transaction.category ?? ''}`);
  if (detected) {
    return detected;
  }
  const hint = normalizeText(`${transaction.type ?? ''} ${transaction.category ?? ''} ${transaction.title ?? ''}`);
  if (/deposit|пополн/.test(hint)) {
    return 'TOP_UP';
  }
  if (/exchange|обмен|конверт/.test(hint)) {
    return 'CURRENCY_EXCHANGE';
  }
  if (/transfer|перевод/.test(hint)) {
    return 'TRANSFERS';
  }
  if (/withdraw|снят|списан/.test(hint)) {
    return 'CASH';
  }
  if (/interest|процент/.test(hint)) {
    return 'INTEREST';
  }
  if (/cashback|кэшбэк|кешбэк/.test(hint)) {
    return 'CASHBACK';
  }
  return 'OTHER';
}

function normalizeStatus(status: string | undefined): string {
  const value = (status ?? '').toLowerCase();
  if (!value || ['completed', 'success', 'done', 'executed'].includes(value)) {
    return 'COMPLETED';
  }
  if (value.includes('pend') || value.includes('process')) {
    return 'PENDING';
  }
  if (value.includes('fail') || value.includes('reject') || value.includes('cancel')) {
    return 'FAILED';
  }
  return value.toUpperCase();
}

export function toLocalOperations(
  transactions: OperationsSourceTransaction[],
  accounts: OperationsAccount[],
): Operation[] {
  const byId = new Map(accounts.map((account) => [account.id, account]));
  return transactions
    .map((transaction): Operation => {
      const category = getCategory(resolveLocalCategory(transaction));
      const account = transaction.accountId ? byId.get(transaction.accountId) : undefined;
      const direction: Operation['direction'] = transaction.amount < 0 ? 'EXPENSE' : 'INCOME';
      return {
        id: transaction.id,
        direction,
        type: (transaction.type ?? '').toUpperCase(),
        status: normalizeStatus(transaction.status),
        category: category.code,
        categoryLabel: category.label,
        categoryColor: category.color,
        categoryIcon: category.icon,
        title: transaction.title || category.label,
        description: null,
        amount: Math.abs(transaction.amount),
        currency: transaction.currency,
        accountId: transaction.accountId ?? '',
        accountNumber: account?.number ?? null,
        counterpartyAccountNumber: null,
        createdAt: transaction.createdAt,
        categoryEditable: false,
      };
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function queryTokens(query: string | undefined): string[] {
  return normalizeText(query)
    .replace(/(\d)\s+(?=\d)/g, '$1')
    .split(' ')
    .filter(Boolean);
}

function directionWords(operation: Operation): string {
  if (operation.direction === 'EXPENSE') {
    return 'трата списание расход оплата покупка';
  }
  if (operation.direction === 'INCOME') {
    return 'доход поступление зачисление пополнение';
  }
  return 'перевод между своими';
}

export function operationMatchesQuery(operation: Operation, tokens: string[]): boolean {
  if (!tokens.length) {
    return true;
  }
  const haystack = normalizeText(
    [
      operation.title,
      operation.description ?? '',
      operation.categoryLabel,
      directionWords(operation),
      operation.accountNumber ?? '',
      operation.counterpartyAccountNumber ?? '',
      operation.currency,
    ].join(' '),
  );
  const digits = `${operation.accountNumber ?? ''} ${operation.counterpartyAccountNumber ?? ''}`.replace(/[^\d ]/g, '');
  const plain = String(round(operation.amount));
  const scaled = operation.amount.toFixed(2);
  return tokens.every((token) => {
    const numeric = token.replace(',', '.');
    if (NUMBER.test(numeric)) {
      return plain.startsWith(numeric) || scaled.startsWith(numeric) || (numeric.length >= 4 && digits.includes(numeric));
    }
    return haystack.includes(token);
  });
}

function dayAfter(iso: string): number {
  const date = parseIsoDate(iso);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
}

export function searchOperations(operations: Operation[], params: SearchParams): OperationPage {
  const tokens = queryTokens(params.query);
  const categories = new Set(params.categories ?? []);
  const accounts = new Set(params.accountIds ?? []);
  const from = params.from ? parseIsoDate(params.from).getTime() : null;
  const to = params.to ? dayAfter(params.to) : null;
  const direction = params.direction ?? 'ALL';

  const matched = operations.filter((operation) => {
    const at = Date.parse(operation.createdAt);
    if (accounts.size && !accounts.has(operation.accountId)) {
      return false;
    }
    if (categories.size && !categories.has(operation.category)) {
      return false;
    }
    if (direction !== 'ALL' && operation.direction !== direction) {
      return false;
    }
    if (params.excludeTransfers && (operation.category === 'TRANSFERS' || operation.direction === 'INTERNAL')) {
      return false;
    }
    if ((from !== null && at < from) || (to !== null && at >= to)) {
      return false;
    }
    return operationMatchesQuery(operation, tokens);
  });

  const size = Math.max(1, Math.min(200, params.size ?? 30));
  const page = Math.max(0, params.page ?? 0);
  const start = Math.min(page * size, matched.length);
  const end = Math.min(start + size, matched.length);
  return {
    items: matched.slice(start, end),
    page,
    size,
    totalElements: matched.length,
    hasNext: end < matched.length,
  };
}

interface SideAccumulator {
  total: number;
  previous: number;
  amounts: Map<string, number>;
  counts: Map<string, number>;
}

function createAccumulator(): SideAccumulator {
  return { total: 0, previous: 0, amounts: new Map(), counts: new Map() };
}

function toSide(accumulator: SideAccumulator): AnalyticsSide {
  const sorted = [...accumulator.amounts.entries()].sort((a, b) => b[1] - a[1]);
  const percents = allocatePercents(sorted.map(([, amount]) => amount));
  const categories: CategoryStat[] = sorted.map(([code, amount], index) => {
    const category = getCategory(code);
    return {
      category: code,
      label: category.label,
      color: category.color,
      icon: category.icon,
      amount: round(amount),
      percent: percents[index] ?? 0,
      share: accumulator.total > 0 ? amount / accumulator.total : 0,
      count: accumulator.counts.get(code) ?? 0,
    };
  });
  return {
    total: round(accumulator.total),
    previousTotal: round(accumulator.previous),
    difference: round(accumulator.total - accumulator.previous),
    categories,
  };
}

export function computeAnalytics(
  operations: Operation[],
  params: AnalyticsParams,
  todayIsoValue: string = toIsoDate(new Date()),
): OperationsAnalytics {
  const window = getWindow(params.period, params.date);
  const previous = previousWindow(window);
  const accounts = new Set(params.accountIds ?? []);
  const buckets = bucketsFor(window);
  const timeline: TimelinePoint[] = buckets.map((bucket) => ({
    from: toIsoDate(bucket.from),
    to: toIsoDate(bucket.to),
    label: bucket.label,
    expense: 0,
    income: 0,
    expenseByCategory: {},
    incomeByCategory: {},
  }));
  const expenses = createAccumulator();
  const income = createAccumulator();
  const skipped = new Set<string>();

  for (const operation of operations) {
    if (operation.direction === 'INTERNAL' || operation.status !== 'COMPLETED') {
      continue;
    }
    if (accounts.size && !accounts.has(operation.accountId)) {
      continue;
    }
    if (params.excludeTransfers && operation.category === 'TRANSFERS') {
      continue;
    }
    const at = Date.parse(operation.createdAt);
    if (at < previous.from.getTime() || at >= window.to.getTime()) {
      continue;
    }
    if (operation.currency !== params.currency) {
      skipped.add(operation.currency);
      continue;
    }
    const isExpense = operation.direction === 'EXPENSE';
    const side = isExpense ? expenses : income;
    if (at < window.from.getTime()) {
      side.previous += operation.amount;
      continue;
    }
    side.total += operation.amount;
    side.amounts.set(operation.category, (side.amounts.get(operation.category) ?? 0) + operation.amount);
    side.counts.set(operation.category, (side.counts.get(operation.category) ?? 0) + 1);

    const index = buckets.findIndex((bucket) => at >= bucket.from.getTime() && at < bucket.to.getTime());
    const point = index >= 0 ? timeline[index] : undefined;
    if (point) {
      const map = isExpense ? point.expenseByCategory : point.incomeByCategory;
      map[operation.category] = round((map[operation.category] ?? 0) + operation.amount);
      if (isExpense) {
        point.expense = round(point.expense + operation.amount);
      } else {
        point.income = round(point.income + operation.amount);
      }
    }
  }

  return {
    period: params.period,
    from: toIsoDate(window.from),
    to: toIsoDate(window.to),
    label: periodLabel(params.period, params.date, todayIsoValue),
    currency: params.currency,
    expenses: toSide(expenses),
    income: toSide(income),
    timeline,
    skippedCurrencies: [...skipped],
  };
}

export function suggestLocal(operations: Operation[], query: string): Suggestion[] {
  const normalized = normalizeText(query);
  if (normalized.length < 2) {
    return [];
  }
  const merchants = new Map<string, { label: string; category: string; count: number }>();
  for (const operation of operations) {
    if (operation.direction !== 'EXPENSE' || operation.category === 'TRANSFERS' || operation.category === 'CASH') {
      continue;
    }
    const key = normalizeText(operation.title);
    if (!key.includes(normalized)) {
      continue;
    }
    const current = merchants.get(key);
    merchants.set(key, { label: operation.title, category: operation.category, count: (current?.count ?? 0) + 1 });
  }
  return [...merchants.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((merchant) => ({ kind: 'merchant', value: merchant.label, label: merchant.label, category: merchant.category }));
}
