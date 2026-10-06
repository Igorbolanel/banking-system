import { formatRounded } from '../../operations/format';
import type { CategoryStat } from '../../operations/types';

interface SummaryCardProps {
  title: string;
  total: number;
  currency: string;
  categories: CategoryStat[];
  active: boolean;
  loading: boolean;
  onClick: () => void;
}

function SummaryCard({ title, total, currency, categories, active, loading, onClick }: SummaryCardProps) {
  return (
    <button
      type="button"
      className={`ops-summary-card${active ? ' is-active' : ''}${loading ? ' is-loading' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="ops-summary-card__amount">{formatRounded(total, currency)}</span>
      <span className="ops-summary-card__title">{title}</span>
      <span className="ops-stackbar" aria-hidden="true">
        {categories.length === 0 ? (
          <span className="ops-stackbar__empty" />
        ) : (
          categories.map((category) => (
            <span
              key={category.category}
              style={{ flexGrow: Math.max(category.share, 0.025), background: category.color }}
            />
          ))
        )}
      </span>
    </button>
  );
}

export default SummaryCard;
