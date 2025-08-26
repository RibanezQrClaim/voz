import React from 'react';
import type { Card } from 'src/contracts';
import { EmailCard } from './EmailCard';
import { useUI } from 'src/store/ui';

interface CardsListProps {
  cards: Card[];
}

export function CardsList({ cards }: CardsListProps) {
  const { state } = useUI();

  const filtered = cards.filter(c => {
    if (state.listFilter === 'urgent') return c.actions.includes('Urgente');
    if (state.listFilter === 'today') {
      const today = new Date().toDateString();
      return new Date(c.meta.createdAt).toDateString() === today;
    }
    return true;
  });

  const visibleCards = [...filtered].sort((a, b) => {
    if (state.listSort === 'recency') {
      return (
        new Date(b.meta.createdAt).getTime() -
        new Date(a.meta.createdAt).getTime()
      );
    }
    const isUrgent = (card: Card) => card.actions.includes('Urgente');
    return Number(isUrgent(b)) - Number(isUrgent(a));
  });

  return (
    <div className="flex flex-col gap-2">
      {visibleCards.map(c => (
        <EmailCard
          key={c.data.id}
          summary={c.data}
          importance={c.actions.includes('Urgente') ? 'urgent' : 'normal'}
        />
      ))}
    </div>
  );
}
