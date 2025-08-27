import React from 'react';
import type { CardProps } from './Card';
import { Card } from './Card';

export type CardsListProps = {
  items: CardProps[];
  onOpen?: (id: string) => void;
  emptyHint?: string; // mensaje opcional si no hay items
};

export function CardsList({ items, onOpen, emptyHint }: CardsListProps): JSX.Element {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[--fg-muted]">
        {emptyHint || 'Sin resultados'}
      </div>
    );
  }

  return (
    <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.id}
          role="listitem"
          className={`transition-opacity transition-transform duration-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <Card {...item} onOpen={onOpen ?? item.onOpen} />
        </li>
      ))}
    </ul>
  );
}

