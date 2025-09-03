import type { HTMLAttributes } from 'react';
import { spacing } from './tokens.js';

export type NxChipProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'urgent';
};

export function NxChip({ variant = 'default', className = '', ...props }: NxChipProps) {
  const base = `font-sans inline-flex items-center rounded-2xl px-[calc(${spacing.base}*2)] py-[${spacing.base}] focus:outline-none focus:ring-[calc(${spacing.base}*2)] focus:ring-primary focus:ring-offset-[calc(${spacing.base}*2)]`;
  const variants: Record<'default' | 'urgent', string> = {
    default: 'bg-surface text-text border border-primary',
    urgent: 'bg-primary text-surface'
  };
  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}



