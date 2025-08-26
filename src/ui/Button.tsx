import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`btn ${className}`}
    >
      {children}
    </button>
  );
}
