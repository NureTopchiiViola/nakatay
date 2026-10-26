import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'ghost-muted';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  variant = 'solid',
  iconLeft,
  iconRight,
  children,
  className = '',
  ...props
}: ButtonProps) {
  // square icon-only button
  const isIconOnly = !children && (iconLeft || iconRight);
  
  const classes = [
    'btn',
    `btn-${variant}`,
    isIconOnly ? 'btn-icon-only' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {iconLeft && <span className="btn-icon">{iconLeft}</span>}
      {children && <span className="btn-text">{children}</span>}
      {iconRight && <span className="btn-icon">{iconRight}</span>}
    </button>
  );
}