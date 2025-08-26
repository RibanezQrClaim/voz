import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button {...props} className="px-4 py-2 border rounded">
      {children}
    </button>
  );
}
