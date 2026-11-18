import { MdHelpOutline } from 'react-icons/md';
import { Button } from '../ui/Button';
import './AuthPromptModal.css';

interface AuthPromptModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function AuthPromptModal({ isOpen, message, onConfirm, onClose }: AuthPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="auth-prompt-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-prompt-header">
          <MdHelpOutline className="auth-prompt-icon" size={26} aria-hidden="true" />
          <h2 id="auth-prompt-title">Необхідно авторизуватися</h2>
        </div>

        <p className="auth-prompt-text">{message}</p>

        <div className="auth-prompt-actions">
          <Button variant="solid" onClick={onConfirm}>
            Увійти
          </Button>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
        </div>
      </div>
    </div>
  );
}