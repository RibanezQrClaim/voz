import type { NxBubbleProps } from './NxUserBubble.js';
import { spacing } from './tokens.js';

export function NxAssistantBubble({ ariaLabel, className = '', ...props }: NxBubbleProps) {
  const base = `font-sans max-w-[75%] rounded-2xl bg-surface/60 text-text backdrop-blur-[14px] shadow-glass border border-text/40 p-[calc(${spacing.base}*4)] self-start focus:outline-none focus:ring-[calc(${spacing.base}*2)] focus:ring-primary focus:ring-offset-[calc(${spacing.base}*2)]`;
  return (
    <div role="group" aria-label={ariaLabel} tabIndex={0} className={`${base} ${className}`} {...props} />
  );
}



