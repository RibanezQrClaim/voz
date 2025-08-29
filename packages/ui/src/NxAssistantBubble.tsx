import type { NxBubbleProps } from './NxUserBubble.js';

export function NxAssistantBubble({ ariaLabel, className = '', ...props }: NxBubbleProps) {
  const base = 'font-sans max-w-[75%] rounded-2xl bg-surface/60 text-text backdrop-blur-[14px] shadow-glass border border-white/40 p-[calc(var(--nx-spacing-base)*4)] self-start';
  return (
    <div role="group" aria-label={ariaLabel} className={`${base} ${className}`} {...props} />
  );
}
