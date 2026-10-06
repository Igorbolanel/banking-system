import type { Toast } from '../hooks/useBankingState';
import { UiIcon } from './operations/Icon';

interface ToastStackProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ICONS: Record<Toast['type'], string> = { success: 'check', error: 'alert', info: 'info' };

function ToastStack({ toasts, onRemove }: ToastStackProps) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          <span className="toast__icon">
            <UiIcon name={ICONS[toast.type]} size={17} strokeWidth={2.5} />
          </span>
          <div>
            <strong>{toast.title}</strong>
            {toast.text && <p>{toast.text}</p>}
          </div>
          <button className="icon-btn icon-btn--plain" style={{ width: 28, height: 28 }} type="button" aria-label="Закрыть уведомление" onClick={() => onRemove(toast.id)}>
            <UiIcon name="close" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
