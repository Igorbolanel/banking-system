import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { UiIcon } from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

function Modal({ title, onClose, children, footer }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  return createPortal(
    <div
      className="ops-theme ops-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div ref={dialogRef} className="ops-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="ops-modal__head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="ops-icon-button" aria-label="Закрыть" onClick={onClose}>
            <UiIcon name="close" size={18} />
          </button>
        </header>
        <div className="ops-modal__body">{children}</div>
        {footer && <footer className="ops-modal__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
