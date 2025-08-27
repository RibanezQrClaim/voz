import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ children, className = '', ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-md border border-[--border] bg-[--card] px-3 text-sm text-[--fg] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] aria-[invalid=true]:border-[--danger] disabled:opacity-60 ${className}`}
    >
      {children}
    </select>
  );
}
