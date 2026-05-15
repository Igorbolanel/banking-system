import type { Toast } from '../hooks/useBankingState';
interface ToastStackProps { toasts: Toast[]; onClose: (id: string) => void }
function ToastStack({ toasts, onClose }: ToastStackProps) {
  return <div className="toast-stack">{toasts.map((toast) => <article className={`toast toast--${toast.type}`} key={toast.id}><div><strong>{toast.title}</strong>{toast.text && <p>{toast.text}</p>}</div><button type="button" onClick={() => onClose(toast.id)}>×</button></article>)}</div>;
}
export default ToastStack;
