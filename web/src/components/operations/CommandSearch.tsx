import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

import { operationsApi } from '../../api/operationsApi';
import { CATEGORY_CATALOG, getCategory, normalizeText } from '../../operations/categories';
import { formatDayTitle, dayKey, formatSignedMoney } from '../../operations/format';
import { requestOperationsSearch } from '../../operations/searchBus';
import type { OperationsSearchRequest } from '../../operations/searchBus';
import type { Operation } from '../../operations/types';
import { CategoryIcon, UiIcon } from './Icon';
import '../../styles/operations.css';

interface CommandSearchProps {
  /** Открыть страницу «Операции». Передаётся из App (navigate('operations')). */
  onOpenOperations?: () => void;
}

interface Entry {
  id: string;
  kind: 'category' | 'operation' | 'query';
  label: string;
  hint: string;
  color?: string;
  icon?: string;
  amount?: string;
  amountTone?: string;
  request: OperationsSearchRequest;
}

const SHORTCUTS = ['SUPERMARKETS', 'MARKETPLACES', 'RESTAURANTS', 'TAXI', 'TRANSFERS', 'TOP_UP'];

function CommandPalette({ onClose, onOpenOperations }: { onClose: () => void; onOpenOperations?: () => void }) {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [result, setResult] = useState<{ query: string; items: Operation[]; failed: boolean }>({
    query: '',
    items: [],
    failed: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = query.trim();

  useEffect(() => {
    inputRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    if (trimmed.length < 2) {
      return undefined;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      operationsApi.search({ query: trimmed, size: 6 }).then(
        (page) => {
          if (!cancelled) {
            setResult({ query: trimmed, items: page.items, failed: false });
          }
        },
        () => {
          if (!cancelled) {
            setResult({ query: trimmed, items: [], failed: true });
          }
        },
      );
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  const entries = useMemo<Entry[]>(() => {
    const normalized = normalizeText(trimmed);
    const categories = (
      normalized
        ? CATEGORY_CATALOG.filter((category) => normalizeText(category.label).includes(normalized)).slice(0, 4)
        : CATEGORY_CATALOG.filter((category) => SHORTCUTS.includes(category.code))
    ).map<Entry>((category) => ({
      id: `category-${category.code}`,
      kind: 'category',
      label: category.label,
      hint: 'Категория',
      color: category.color,
      icon: category.icon,
      request: { category: category.code },
    }));
    const operations =
      result.query === trimmed && trimmed.length >= 2
        ? result.items.map<Entry>((operation) => ({
            id: `operation-${operation.id}`,
            kind: 'operation',
            label: operation.title,
            hint: formatDayTitle(dayKey(operation.createdAt)),
            color: operation.categoryColor,
            icon: operation.categoryIcon,
            amount: formatSignedMoney(operation.amount, operation.currency, operation.direction),
            amountTone: operation.direction.toLowerCase(),
            request: { query: operation.title },
          }))
        : [];
    const search: Entry[] = trimmed
      ? [{ id: 'query', kind: 'query', label: `Найти «${trimmed}» во всех операциях`, hint: 'Enter', request: { query: trimmed } }]
      : [];
    return [...search, ...operations, ...categories];
  }, [trimmed, result]);

  const run = (entry: Entry) => {
    requestOperationsSearch(entry.request);
    onOpenOperations?.();
    onClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((current) => Math.min(entries.length - 1, current + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((current) => Math.max(0, current - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const entry = entries[highlight];
      if (entry) {
        run(entry);
      }
    }
  };

  const operationsHeading = entries.findIndex((entry) => entry.kind === 'operation');
  const categoriesHeading = entries.findIndex((entry) => entry.kind === 'category');

  return createPortal(
    <div
      className="ops-theme ops-overlay ops-overlay--top"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="ops-palette" role="dialog" aria-modal="true" aria-label="Поиск по операциям">
        <div className="ops-palette__input">
          <UiIcon name="search" size={22} />
          <input
            ref={inputRef}
            value={query}
            placeholder="Магазин, категория, сумма или номер счёта"
            aria-label="Поиск по операциям"
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlight(0);
            }}
            onKeyDown={onKeyDown}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="ops-palette__list" role="listbox" aria-label="Результаты поиска">
          {entries.map((entry, index) => (
            <li key={entry.id} role="presentation">
              {index === operationsHeading && <p className="ops-palette__heading">Операции</p>}
              {index === categoriesHeading && (
                <p className="ops-palette__heading">{trimmed ? 'Категории' : 'Быстрый переход'}</p>
              )}
              <button
                type="button"
                role="option"
                aria-selected={index === highlight}
                className={`ops-palette__item${index === highlight ? ' is-active' : ''}`}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => run(entry)}
              >
                {entry.kind === 'query' ? (
                  <span className="ops-search__glyph">
                    <UiIcon name="search" size={16} />
                  </span>
                ) : (
                  <span className="ops-bubble ops-bubble--sm" style={{ '--chip': entry.color ?? getCategory(null).color } as CSSProperties}>
                    <CategoryIcon name={entry.icon ?? 'other'} size={15} color="#fff" strokeWidth={2.3} />
                  </span>
                )}
                <span className="ops-palette__text">
                  <span>{entry.label}</span>
                  {entry.kind === 'operation' && <small>{entry.hint}</small>}
                </span>
                {entry.amount ? (
                  <span className={`ops-amount ops-amount--${entry.amountTone ?? 'expense'}`}>{entry.amount}</span>
                ) : (
                  entry.kind !== 'operation' && <span className="ops-palette__hint">{entry.hint}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {result.failed && result.query === trimmed && (
          <p className="ops-palette__note">Сервер не ответил — поиск продолжится на странице операций.</p>
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Кнопка «Поиск по операциям» для шапки + палитра по ⌘K / Ctrl+K на любой странице.
 */
function CommandSearch({ onOpenOperations }: CommandSearchProps) {
  const [open, setOpen] = useState(false);
  const [isMac] = useState(() => typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent));

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.code === 'KeyK' || event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="ops-theme ops-command-trigger"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => setOpen(true)}
      >
        <UiIcon name="search" size={18} />
        <span>Поиск по операциям</span>
        <kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>
      {open && <CommandPalette onClose={() => setOpen(false)} onOpenOperations={onOpenOperations} />}
    </>
  );
}

export default CommandSearch;
