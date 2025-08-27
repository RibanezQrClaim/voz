import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-md border border-[--border] bg-[--card] px-3 text-sm text-[--fg] placeholder:text-[--fg-muted] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] aria-[invalid=true]:border-[--danger] disabled:opacity-60 ${className}`}
    />
  );
}
