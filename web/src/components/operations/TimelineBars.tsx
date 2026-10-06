import { useState } from 'react';

import { formatCompact, formatRounded } from '../../operations/format';
import { parseIsoDate } from '../../operations/period';
import type { AnalyticsPeriod, AnalyticsSideKey, TimelinePoint } from '../../operations/types';

interface TimelineBarsProps {
  points: TimelinePoint[];
  side: AnalyticsSideKey;
  period: AnalyticsPeriod;
  currency: string;
  /** Порядок категорий в столбике — как в списке категорий, от крупной к мелкой. */
  order: string[];
  colors: Record<string, string>;
  activeKeys: string[];
}

const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const monthFormat = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

function niceMax(value: number): number {
  if (value <= 0) {
    return 0;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = [1, 2, 2.5, 5, 10].find((step) => normalized <= step) ?? 10;
  return nice * magnitude;
}

function pointTitle(point: TimelinePoint, period: AnalyticsPeriod): string {
  const date = parseIsoDate(point.from);
  if (period === 'YEAR') {
    const text = monthFormat.format(date).replace(' г.', '');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  return dayFormat.format(date);
}

function TimelineBars({ points, side, period, currency, order, colors, activeKeys }: TimelineBarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const totals = points.map((point) => (side === 'expenses' ? point.expense : point.income));
  const max = niceMax(Math.max(0, ...totals));
  const labelStep = Math.max(1, Math.ceil(points.length / 8));
  const average = points.length ? totals.reduce((sum, value) => sum + value, 0) / points.length : 0;
  const hoveredPoint = hovered === null ? undefined : points[hovered];

  return (
    <div className="ops-bars">
      <div className="ops-bars__readout" aria-live="polite">
        <span>{hoveredPoint ? pointTitle(hoveredPoint, period) : period === 'YEAR' ? 'В среднем за месяц' : 'В среднем за день'}</span>
        <strong>{formatRounded(hoveredPoint && hovered !== null ? totals[hovered] ?? 0 : average, currency)}</strong>
      </div>
      <div className="ops-bars__plot" onMouseLeave={() => setHovered(null)}>
        <div className="ops-bars__grid" aria-hidden="true">
          <span data-value={formatCompact(max)} />
          <span data-value={formatCompact(max / 2)} />
          <span data-value="0" />
        </div>
        {points.map((point, index) => {
          const total = totals[index] ?? 0;
          const byCategory = side === 'expenses' ? point.expenseByCategory : point.incomeByCategory;
          const parts = order
            .map((code) => ({ code, value: byCategory[code] ?? 0 }))
            .filter((part) => part.value > 0);
          return (
            <div
              key={point.from}
              className={`ops-bars__col${hovered === index ? ' is-hover' : ''}`}
              onMouseEnter={() => setHovered(index)}
              onClick={() => setHovered(index)}
              title={`${pointTitle(point, period)}: ${formatRounded(total, currency)}`}
            >
              {total > 0 ? (
                <div className="ops-bars__stack" style={{ height: `${max > 0 ? (total / max) * 100 : 0}%` }}>
                  {parts.map((part) => (
                    <span
                      key={part.code}
                      className={activeKeys.length && !activeKeys.includes(part.code) ? 'is-dim' : undefined}
                      style={{ flexGrow: part.value, background: colors[part.code] ?? '#A0A7B4' }}
                    />
                  ))}
                </div>
              ) : (
                <div className="ops-bars__stub" />
              )}
            </div>
          );
        })}
      </div>
      <div className="ops-bars__axis" aria-hidden="true">
        {points.map((point, index) => (
          <span key={point.from}>{index % labelStep === 0 ? point.label : ''}</span>
        ))}
      </div>
    </div>
  );
}

export default TimelineBars;
