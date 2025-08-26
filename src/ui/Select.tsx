import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ children, ...props }: SelectProps) {
  return (
    <select {...props} className="border p-2">
      {children}
    </select>
  );
}
