import type { HTMLAttributes } from 'react';

export interface NxBubbleProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel: string;
}

export function NxUserBubble({ ariaLabel, className = '', ...props }: NxBubbleProps) {
  const base = 'font-sans max-w-[75%] rounded-2xl bg-surface/60 text-text backdrop-blur-[14px] shadow-glass border border-white/40 p-[calc(var(--nx-spacing-base)*4)] self-end';
  return (
    <div role="group" aria-label={ariaLabel} className={`${base} ${className}`} {...props} />
  );
}
