import { useState } from 'react';
import type { ReactNode } from 'react';

import Modal from './operations/Modal';

interface ConfirmDialogProps {
  title: string;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  children: ReactNode;
  onConfirm: () => boolean | void | Promise<boolean | void>;
  onClose: () => void;
}

function ConfirmDialog({ title, confirmLabel, tone = 'primary', children, onConfirm, onClose }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      const result = await onConfirm();
      if (result !== false) {
        onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`}
            disabled={busy}
            onClick={() => {
              void confirm();
            }}
          >
            {busy ? 'Подождите…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="card__text">{children}</p>
    </Modal>
  );
}

export default ConfirmDialog;
