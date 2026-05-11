import type { Action } from '../types/banking';

interface ActionModalProps {
  action: Action | null;
  onClose: () => void;
}

function ActionModal({ action, onClose }: ActionModalProps) {
  if (!action) return null;

  const titleMap: Record<Action, string> = {
    topup: 'Пополнение счёта',
    transfer: 'Перевод средств',
    pay: 'Оплата услуг',
  };

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content">
        <h3>{titleMap[action]}</h3>
        <p>СКОРО КОЛЯ СДЕЛАЕТ КРАСИВО.</p>
        <button className="pill-button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

export default ActionModal;