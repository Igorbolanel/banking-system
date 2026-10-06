import type { CurrencyCode } from '../types/banking';

const currencyMap: Record<CurrencyCode, string> = { RUB: '₽', USD: '$', EUR: '€' };

export function getCurrencySymbol(currency: CurrencyCode) { return currencyMap[currency]; }

export function formatMoney(amount: number, currency: CurrencyCode) {
  return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: Math.abs(amount % 1) === 0 ? 0 : 2, maximumFractionDigits: 2 })}\u00a0${getCurrencySymbol(currency)}`;
}

export function formatCompactMoney(amount: number, currency: CurrencyCode = 'RUB') {
  return `${new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 }).format(amount)} ${getCurrencySymbol(currency)}`;
}

export function formatDate(value: string) { return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }); }
export function formatDateTime(value: string) { return new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
export function maskAccountNumber(value: string) { return `${value.slice(0, 4)} •••• •••• •••• ${value.slice(-4)}`; }
export function getInitials(fullName: string) { return fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'МБ'; }

/** Склонение: pluralize(3, 'счёт', 'счёта', 'счетов') → «счёта». */
export function pluralize(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Номер счёта группами по 4 цифры: 4081 7810 4000 0001 2345. */
export function groupAccountNumber(value: string) {
  return value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatRate(value: number) { return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
