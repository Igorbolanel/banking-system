import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { UiIcon } from './Icon';

interface PopoverProps {
  label: ReactNode;
  ariaLabel: string;
  active?: boolean;
  accent?: boolean;
  align?: 'start' | 'end';
  children: (close: () => void) => ReactNode;
}

function Popover({ label, ariaLabel, active = false, accent = false, align = 'start', children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="ops-popover" ref={rootRef}>
      <button
        type="button"
        className={`ops-pill${accent ? ' ops-pill--accent' : ''}${active ? ' is-active' : ''}${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ops-pill__text">{label}</span>
        <UiIcon name="chevronDown" size={16} strokeWidth={2.4} />
      </button>
      {open && (
        <div className={`ops-popover__panel ops-popover__panel--${align}`} role="dialog" aria-label={ariaLabel}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export default Popover;
