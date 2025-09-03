import type { ButtonHTMLAttributes } from 'react';
import { spacing } from './tokens.js';

export type NxButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function NxButton({ variant = 'primary', className = '', ...props }: NxButtonProps) {
  const base = `font-sans inline-flex items-center justify-center rounded-xl px-[calc(${spacing.base}*4)] py-[calc(${spacing.base}*2)] focus:outline-none focus:ring-[calc(${spacing.base}*2)] focus:ring-primary focus:ring-offset-[calc(${spacing.base}*2)]`;
  const variants: Record<'primary' | 'secondary', string> = {
    primary: 'bg-primary text-surface',
    secondary: 'bg-surface text-primary border border-primary'
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}



