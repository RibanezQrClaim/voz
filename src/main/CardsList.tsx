import React from 'react';
import type { Card } from 'src/contracts';
import { EmailCard } from './EmailCard';

interface CardsListProps {
  cards: Card[];
}

export function CardsList({ cards }: CardsListProps) {
  return (
    <div className="flex flex-col gap-2">
      {cards.map(c => (
        <EmailCard key={c.data.id} summary={c.data} />
      ))}
    </div>
  );
}
