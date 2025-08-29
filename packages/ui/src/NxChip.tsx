import type { HTMLAttributes } from 'react';

export type NxChipProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'urgent';
};

export function NxChip({ variant = 'default', className = '', ...props }: NxChipProps) {
  const base = 'font-sans inline-flex items-center rounded-2xl px-[calc(var(--nx-spacing-base)*2)] py-[var(--nx-spacing-base)] focus:outline-none focus:ring-2 focus:ring-primary';
  const variants: Record<'default' | 'urgent', string> = {
    default: 'bg-surface text-text border border-primary',
    urgent: 'bg-primary text-surface'
  };
  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
