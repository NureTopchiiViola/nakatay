import React from 'react';
import './Tag.css';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'ghost';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Tag({
  variant = 'solid',
  iconLeft,
  iconRight,
  children,
  className = '',
  ...props
}: TagProps) {
  const classes = [
    'tag',
    `tag-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {iconLeft && <span className="tag-icon">{iconLeft}</span>}
      <span className="tag-text">{children}</span>
      {iconRight && <span className="tag-icon">{iconRight}</span>}
    </span>
  );
}