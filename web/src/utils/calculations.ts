import type { Account, CurrencyCode, CurrencyRate, Transaction } from '../types/banking';

export function toRub(amount: number, currency: CurrencyCode, rates: CurrencyRate[]) {
  if (currency === 'RUB') return amount;
  const rate = rates.find((item) => item.code === currency);
  return rate ? amount * rate.sell : amount;
}

/**
 * Пересчёт суммы между валютами по курсам банка (курсы заданы в рублях за единицу).
 * Банк покупает валюту по курсу buy и продаёт по курсу sell.
 */
export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode, rates: CurrencyRate[]) {
  if (from === to) return amount;
  const fromRate = rates.find((item) => item.code === from);
  const toRate = rates.find((item) => item.code === to);
  const inRub = from === 'RUB' ? amount : fromRate ? amount * fromRate.buy : NaN;
  if (to === 'RUB') return inRub;
  return toRate ? inRub / toRate.sell : NaN;
}

export function getTotalBalance(accounts: Account[], rates: CurrencyRate[]) {
  return accounts.filter((account) => account.status === 'active').reduce((sum, account) => sum + toRub(account.balance, account.currency, rates), 0);
}
export function getMonthlyIncome(transactions: Transaction[]) { return transactions.filter((tx) => tx.amount > 0 && tx.status !== 'failed').reduce((sum, tx) => sum + tx.amount, 0); }
export function getMonthlyOutcome(transactions: Transaction[]) { return Math.abs(transactions.filter((tx) => tx.amount < 0 && tx.status !== 'failed').reduce((sum, tx) => sum + tx.amount, 0)); }
export function getCategoryTotals(transactions: Transaction[]) { return transactions.filter((tx) => tx.amount < 0 && tx.status !== 'failed').reduce<Record<string, number>>((acc, tx) => { acc[tx.category] = (acc[tx.category] ?? 0) + Math.abs(tx.amount); return acc; }, {}); }
export function getStatusText(status: Transaction['status']) { if (status === 'success') return 'Выполнено'; if (status === 'pending') return 'В обработке'; return 'Ошибка'; }
export function createAccountNumber() { const suffix = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join(''); return `4081${suffix}`; }
