import type { Operation, OperationsAccount } from './types';

const CURRENCY_SIGNS: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  CNY: '¥',
  GBP: '£',
  KZT: '₸',
  TRY: '₺',
  AED: 'AED',
};

const numberFormat = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function currencySign(currency: string): string {
  return CURRENCY_SIGNS[currency] ?? currency;
}

/** «49 900 ₽», «1 250,50 $». */
export function formatMoney(value: number, currency: string): string {
  return `${numberFormat.format(Math.abs(value))}\u00a0${currencySign(currency)}`;
}

/** Для итогов и диаграмм: без копеек, как в аналитике Т-Банка. */
export function formatRounded(value: number, currency: string): string {
  return formatMoney(Math.abs(value) >= 100 ? Math.round(value) : value, currency);
}

export function formatSignedMoney(value: number, currency: string, direction: 'INCOME' | 'EXPENSE' | 'INTERNAL'): string {
  if (direction === 'INCOME') {
    return `+${formatMoney(value, currency)}`;
  }
  if (direction === 'EXPENSE') {
    return `−${formatMoney(value, currency)}`;
  }
  return formatMoney(value, currency);
}

/** Короткая подпись для оси: «12 тыс», «1,2 млн». */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} тыс`;
  }
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

export function formatPercent(percent: number, share: number): string {
  if (percent === 0 && share > 0) {
    return '<1%';
  }
  return `${percent}%`;
}

export function lastDigits(accountNumber: string | null | undefined): string {
  const digits = (accountNumber ?? '').replace(/\D/g, '');
  return digits.slice(-4);
}

export function maskAccount(accountNumber: string | null | undefined): string {
  if (!accountNumber) {
    return '';
  }
  if (accountNumber.startsWith('•')) {
    return accountNumber;
  }
  return `•${lastDigits(accountNumber)}`;
}

export function dayKey(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });
const dayWithYearFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** «Сегодня», «Вчера», «5 октября, понедельник». */
export function formatDayTitle(key: string, now: Date = new Date()): string {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year || 1970, (month || 1) - 1, day || 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today.getTime() - date.getTime()) / 86_400_000);
  if (diff === 0) {
    return 'Сегодня';
  }
  if (diff === 1) {
    return 'Вчера';
  }
  if (date.getFullYear() !== now.getFullYear()) {
    return dayWithYearFormat.format(date).replace(' г.', '');
  }
  const [datePart, weekday] = dayFormat.format(date).split(', ').reverse();
  return weekday ? `${datePart}, ${weekday}` : dayFormat.format(date);
}

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso)).replace(' г.', '');
}

export function accountLabelFor(operation: Operation, accounts: Map<string, OperationsAccount>): string {
  const account = accounts.get(operation.accountId);
  if (account) {
    return `${account.name} ${maskAccount(account.number)}`;
  }
  return operation.accountNumber ? `Счёт ${maskAccount(operation.accountNumber)}` : '';
}
