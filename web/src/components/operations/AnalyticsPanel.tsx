import type { CSSProperties } from 'react';

import { formatRounded } from '../../operations/format';
import { periodNoun } from '../../operations/period';
import type {
  AnalyticsPeriod,
  AnalyticsSide,
  AnalyticsSideKey,
  ChartMode,
  TimelinePoint,
} from '../../operations/types';
import DonutChart from './DonutChart';
import { CategoryIcon, UiIcon } from './Icon';
import TimelineBars from './TimelineBars';

interface AnalyticsPanelProps {
  side: AnalyticsSideKey;
  data: AnalyticsSide;
  timeline: TimelinePoint[];
  currency: string;
  period: AnalyticsPeriod;
  chartMode: ChartMode;
  activeKeys: string[];
  loading: boolean;
  animationKey: string;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onChartModeChange: (mode: ChartMode) => void;
  onToggleCategory: (code: string) => void;
  onClose: () => void;
}

const PERIODS: Array<{ value: AnalyticsPeriod; label: string; full: string }> = [
  { value: 'WEEK', label: 'Нед', full: 'Неделя' },
  { value: 'MONTH', label: 'Мес', full: 'Месяц' },
  { value: 'YEAR', label: 'Год', full: 'Год' },
];

function AnalyticsPanel({
  side,
  data,
  timeline,
  currency,
  period,
  chartMode,
  activeKeys,
  loading,
  animationKey,
  onPeriodChange,
  onChartModeChange,
  onToggleCategory,
  onClose,
}: AnalyticsPanelProps) {
  const title = side === 'expenses' ? 'Траты' : 'Доходы';
  const colors = Object.fromEntries(data.categories.map((category) => [category.category, category.color]));
  const showDiff = data.difference !== 0 && data.previousTotal > 0;

  return (
    <section className={`ops-stage${loading ? ' is-loading' : ''}`} aria-label={`${title} по категориям`}>
      <div className="ops-stage__head">
        <div>
          <div className="ops-stage__total-row">
            <span className="ops-stage__total">{formatRounded(data.total, currency)}</span>
            {showDiff && (
              <span
                className="ops-diff"
                title={`По сравнению с ${periodNoun(period)}: ${formatRounded(data.previousTotal, currency)}`}
              >
                <UiIcon name={data.difference < 0 ? 'arrowDown' : 'arrowUp'} size={14} strokeWidth={2.4} />
                {formatRounded(Math.abs(data.difference), currency)}
              </span>
            )}
          </div>
          <p className="ops-stage__caption">{title}</p>
        </div>
        <button type="button" className="ops-stage__close" aria-label="Свернуть диаграмму" onClick={onClose}>
          <UiIcon name="close" size={18} />
        </button>
      </div>

      <div className="ops-stage__chart">
        {chartMode === 'donut' ? (
          <DonutChart
            key={animationKey}
            items={data.categories.map((category) => ({
              key: category.category,
              label: category.label,
              color: category.color,
              icon: category.icon,
              value: category.amount,
              percent: category.percent,
              share: category.share,
            }))}
            currency={currency}
            activeKeys={activeKeys}
            emptyText={side === 'expenses' ? 'Трат за период нет' : 'Поступлений за период нет'}
            ariaLabel={`${title}: ${data.categories
              .map((category) => `${category.label} ${category.percent}%`)
              .join(', ') || 'нет данных'}`}
            onSelect={onToggleCategory}
          />
        ) : (
          <TimelineBars
            points={timeline}
            side={side}
            period={period}
            currency={currency}
            order={data.categories.map((category) => category.category)}
            colors={colors}
            activeKeys={activeKeys}
          />
        )}
      </div>

      <div className="ops-stage__controls">
        <div className="ops-seg ops-seg--dark" role="radiogroup" aria-label="Период">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={period === item.value}
              aria-label={item.full}
              className={period === item.value ? 'is-active' : undefined}
              onClick={() => onPeriodChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="ops-seg ops-seg--dark ops-seg--icons" role="radiogroup" aria-label="Вид диаграммы">
          <button
            type="button"
            role="radio"
            aria-checked={chartMode === 'donut'}
            aria-label="Кольцевая диаграмма"
            className={chartMode === 'donut' ? 'is-active' : undefined}
            onClick={() => onChartModeChange('donut')}
          >
            <UiIcon name="donut" size={20} />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={chartMode === 'bars'}
            aria-label="Столбчатая диаграмма"
            className={chartMode === 'bars' ? 'is-active' : undefined}
            onClick={() => onChartModeChange('bars')}
          >
            <UiIcon name="bars" size={20} />
          </button>
        </div>
      </div>

      {data.categories.length > 0 && (
        <div className="ops-chips">
          {data.categories.map((category) => {
            const active = activeKeys.includes(category.category);
            return (
              <button
                key={category.category}
                type="button"
                className={`ops-chip${active ? ' is-active' : ''}${activeKeys.length && !active ? ' is-muted' : ''}`}
                style={{ '--chip': category.color } as CSSProperties}
                aria-pressed={active}
                title={`${category.label}: ${formatRounded(category.amount, currency)}, операций: ${category.count}`}
                onClick={() => onToggleCategory(category.category)}
              >
                <span className="ops-chip__icon">
                  <CategoryIcon name={category.icon} size={17} color="#fff" strokeWidth={2.2} />
                </span>
                <span className="ops-chip__label">{category.label}</span>
                <span className="ops-chip__amount">{formatRounded(category.amount, currency)}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AnalyticsPanel;
