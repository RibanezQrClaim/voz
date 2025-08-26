import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ children, className = '', ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`input-base ${className}`}
    >
      {children}
    </select>
  );
}
