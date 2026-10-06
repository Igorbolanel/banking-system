import type { AnalyticsPeriod } from './types';

const MONTHS: readonly string[] = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_SHORT: readonly string[] = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const WEEK_DAYS: readonly string[] = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export interface PeriodWindow {
  period: AnalyticsPeriod;
  /** Начало, локальная полночь. */
  from: Date;
  /** Конец, не включается. */
  to: Date;
}

export interface PeriodBucket {
  from: Date;
  to: Date;
  label: string;
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function getWindow(period: AnalyticsPeriod, anchorIso: string): PeriodWindow {
  const anchor = parseIsoDate(anchorIso);
  if (period === 'WEEK') {
    const shift = (anchor.getDay() + 6) % 7;
    const from = addDays(anchor, -shift);
    return { period, from, to: addDays(from, 7) };
  }
  if (period === 'YEAR') {
    return { period, from: new Date(anchor.getFullYear(), 0, 1), to: new Date(anchor.getFullYear() + 1, 0, 1) };
  }
  return {
    period,
    from: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
    to: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1),
  };
}

export function previousWindow(window: PeriodWindow): PeriodWindow {
  return getWindow(window.period, toIsoDate(addDays(window.from, -1)));
}

/** Последний день окна включительно — для параметра `to` в поиске. */
export function lastDayIso(window: PeriodWindow): string {
  return toIsoDate(addDays(window.to, -1));
}

export function shiftAnchor(period: AnalyticsPeriod, anchorIso: string, delta: number): string {
  const window = getWindow(period, anchorIso);
  if (period === 'WEEK') {
    return toIsoDate(addDays(window.from, delta * 7));
  }
  if (period === 'YEAR') {
    return toIsoDate(new Date(window.from.getFullYear() + delta, 0, 1));
  }
  return toIsoDate(new Date(window.from.getFullYear(), window.from.getMonth() + delta, 1));
}

export function periodLabel(period: AnalyticsPeriod, anchorIso: string, todayIsoValue: string = todayIso()): string {
  const window = getWindow(period, anchorIso);
  const today = parseIsoDate(todayIsoValue);
  if (period === 'WEEK') {
    const last = addDays(window.to, -1);
    return `${window.from.getDate()} ${MONTHS_SHORT[window.from.getMonth()] ?? ''} – ${last.getDate()} ${MONTHS_SHORT[last.getMonth()] ?? ''}`;
  }
  if (period === 'YEAR') {
    return String(window.from.getFullYear());
  }
  const month = MONTHS[window.from.getMonth()] ?? '';
  return window.from.getFullYear() === today.getFullYear() ? month : `${month} ${window.from.getFullYear()}`;
}

/** Последние периоды для выпадающего списка: 12 месяцев, 8 недель или 4 года. */
export function recentPeriods(period: AnalyticsPeriod, todayIsoValue: string): Array<{ anchor: string; label: string }> {
  const count = period === 'MONTH' ? 12 : period === 'WEEK' ? 8 : 4;
  const result: Array<{ anchor: string; label: string }> = [];
  for (let index = 0; index < count; index += 1) {
    const anchor = shiftAnchor(period, todayIsoValue, -index);
    result.push({ anchor, label: periodLabel(period, anchor, todayIsoValue) });
  }
  return result;
}

export function bucketsFor(window: PeriodWindow): PeriodBucket[] {
  const buckets: PeriodBucket[] = [];
  if (window.period === 'YEAR') {
    for (let month = 0; month < 12; month += 1) {
      const from = new Date(window.from.getFullYear(), month, 1);
      buckets.push({ from, to: new Date(window.from.getFullYear(), month + 1, 1), label: MONTHS_SHORT[month] ?? '' });
    }
    return buckets;
  }
  for (let day = window.from; day < window.to; day = addDays(day, 1)) {
    const label = window.period === 'WEEK' ? WEEK_DAYS[(day.getDay() + 6) % 7] ?? '' : String(day.getDate());
    buckets.push({ from: day, to: addDays(day, 1), label });
  }
  return buckets;
}

export function periodNoun(period: AnalyticsPeriod): string {
  if (period === 'WEEK') {
    return 'прошлой неделей';
  }
  if (period === 'YEAR') {
    return 'прошлым годом';
  }
  return 'прошлым месяцем';
}
