import React, { forwardRef } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', iconLeft, iconRight, ...props }, ref) => {
    return (
      <div className={`input-wrapper ${className}`}>
        {iconLeft && <span className="input-icon input-icon-left">{iconLeft}</span>}
        <input
          ref={ref}
          className={`input-field ${iconLeft ? 'has-icon-left' : ''} ${iconRight ? 'has-icon-right' : ''}`}
          {...props}
        />
        {iconRight && <span className="input-icon input-icon-right">{iconRight}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';