import type { OperationsAccount } from './types';

/**
 * Валюта аналитики: если выбраны счета в одной валюте — она, иначе рубли
 * (суммы в других валютах сервер пересчитает по курсу).
 */
export function pickAnalyticsCurrency(accounts: OperationsAccount[], selectedIds: string[] = []): string {
  if (selectedIds.length) {
    const currencies = new Set(accounts.filter((account) => selectedIds.includes(account.id)).map((account) => account.currency));
    if (currencies.size === 1) {
      return [...currencies][0] ?? 'RUB';
    }
  }
  if (!accounts.length || accounts.some((account) => account.currency === 'RUB')) {
    return 'RUB';
  }
  return accounts[0]?.currency ?? 'RUB';
}
