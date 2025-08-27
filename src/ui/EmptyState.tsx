import React from 'react';

type Props = { message: string };

export function EmptyState({ message }: Props): JSX.Element {
  return (
    <div className="p-8 text-center text-sm text-[--fg-muted]">{message}</div>
  );
}

