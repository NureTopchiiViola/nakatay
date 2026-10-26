import React, { forwardRef } from 'react';
import './SelectableTag.css';

export interface SelectableTagProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const SelectableTag = forwardRef<HTMLInputElement, SelectableTagProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className={`selectable-tag-wrapper ${className}`}>
        <input
          type="checkbox"
          className="selectable-tag-input sr-only"
          ref={ref}
          {...props}
        />
        <span className="selectable-tag-content">
          {label}
        </span>
      </label>
    );
  }
);

SelectableTag.displayName = 'SelectableTag';