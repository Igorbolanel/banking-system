import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';

import { CATEGORY_CATALOG, getCategory, normalizeText } from '../../operations/categories';
import type { Suggestion } from '../../operations/types';
import { CategoryIcon, UiIcon } from './Icon';

interface SearchBoxProps {
  value: string;
  onCommit: (query: string) => void;
  onPickCategory: (code: string) => void;
  suggest: (query: string) => Promise<Suggestion[]>;
}

interface Option {
  kind: 'category' | 'merchant' | 'query';
  value: string;
  label: string;
  category?: string;
}

function SearchBox({ value, onCommit, onPickCategory, suggest }: SearchBoxProps) {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (draft.trim() !== value.trim()) {
      setDraft(value);
    }
  }
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [remote, setRemote] = useState<{ query: string; items: Suggestion[] }>({ query: '', items: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const trimmed = draft.trim();

  useEffect(() => {
    if (trimmed === value.trim()) {
      return undefined;
    }
    const timer = window.setTimeout(() => onCommit(trimmed), 350);
    return () => window.clearTimeout(timer);
  }, [trimmed, value, onCommit]);

  useEffect(() => {
    if (trimmed.length < 2) {
      return undefined;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      suggest(trimmed).then(
        (items) => {
          if (!cancelled) {
            setRemote({ query: trimmed, items });
          }
        },
        () => {
          if (!cancelled) {
            setRemote({ query: trimmed, items: [] });
          }
        },
      );
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed, suggest]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const options = useMemo<Option[]>(() => {
    if (!trimmed) {
      return [];
    }
    const normalized = normalizeText(trimmed);
    const categories: Option[] = CATEGORY_CATALOG.filter((category) => normalizeText(category.label).includes(normalized))
      .slice(0, 4)
      .map((category) => ({ kind: 'category', value: category.code, label: category.label, category: category.code }));
    const merchants: Option[] =
      remote.query === trimmed
        ? remote.items
            .filter((item) => item.kind === 'merchant')
            .slice(0, 5)
            .map((item) => ({ kind: 'merchant', value: item.value, label: item.label, category: item.category }))
        : [];
    return [...categories, ...merchants, { kind: 'query', value: trimmed, label: trimmed }];
  }, [trimmed, remote]);

  const showList = open && options.length > 0;

  const choose = (option: Option) => {
    if (option.kind === 'category') {
      onPickCategory(option.value);
      setDraft('');
      onCommit('');
    } else {
      setDraft(option.value);
      onCommit(option.value);
    }
    setOpen(false);
    setHighlight(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlight((current) => Math.min(options.length - 1, current + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((current) => Math.max(-1, current - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = highlight >= 0 ? options[highlight] : undefined;
      if (option) {
        choose(option);
      } else {
        onCommit(trimmed);
        setOpen(false);
      }
    } else if (event.key === 'Escape') {
      if (showList) {
        setOpen(false);
      } else if (draft) {
        setDraft('');
        onCommit('');
      } else {
        inputRef.current?.blur();
      }
    }
  };

  return (
    <div className={`ops-search${showList ? ' is-open' : ''}`}>
      <UiIcon name="search" size={20} className="ops-search__icon" />
      <input
        ref={inputRef}
        className="ops-search__input"
        type="search"
        role="combobox"
        aria-label="Поиск по операциям"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={highlight >= 0 ? `${listId}-${highlight}` : undefined}
        placeholder="Магазин, категория, сумма или номер счёта"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setHighlight(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {draft ? (
        <button
          type="button"
          className="ops-search__clear"
          aria-label="Очистить поиск"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setDraft('');
            onCommit('');
            inputRef.current?.focus();
          }}
        >
          <UiIcon name="close" size={16} />
        </button>
      ) : (
        <kbd className="ops-search__kbd" aria-hidden="true">
          /
        </kbd>
      )}
      {showList && (
        <ul className="ops-search__list" id={listId} role="listbox">
          {options.map((option, index) => {
            const category = getCategory(option.category);
            return (
              <li
                key={`${option.kind}-${option.value}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === highlight}
                className={index === highlight ? 'is-active' : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => choose(option)}
              >
                {option.kind === 'query' ? (
                  <span className="ops-search__glyph">
                    <UiIcon name="search" size={16} />
                  </span>
                ) : (
                  <span className="ops-bubble ops-bubble--sm" style={{ '--chip': category.color } as CSSProperties}>
                    <CategoryIcon name={category.icon} size={15} color="#fff" strokeWidth={2.3} />
                  </span>
                )}
                <span className="ops-search__option-text">
                  {option.kind === 'query' ? `Найти «${option.label}» в операциях` : option.label}
                </span>
                <span className="ops-search__option-kind">
                  {option.kind === 'category' ? 'Категория' : option.kind === 'merchant' ? 'Магазин' : 'Enter'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;
