import React, { useRef, useEffect } from 'react';
import './Dropdown.css';

export interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Dropdown({ isOpen, onClose, trigger, children, className = '' }: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className={`dropdown-wrapper ${className}`} ref={containerRef}>
      <div className="dropdown-trigger-container">
        {trigger}
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="dropdown-item" onClick={onClick} type="button" {...props}>
      {children}
    </button>
  );
}