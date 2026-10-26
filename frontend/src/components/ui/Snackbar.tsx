import React, { useEffect } from 'react';
import { Button } from './Button';
import './Snackbar.css';

export interface SnackbarProps {
  isOpen: boolean;
  message: string;
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number; 
}

export function Snackbar({
  isOpen,
  message,
  actionText,
  onAction,
  onClose,
  duration = 4000,
}: SnackbarProps) {

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <div className={`snackbar-container ${isOpen ? 'snackbar-open' : ''}`} role="alert">
      <div className="snackbar-content">
        <span className="snackbar-message">{message}</span>
        {actionText && onAction && (
          <Button className="snackbar-action" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}