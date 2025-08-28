import * as React from "react";
import { Card } from "./Card";
import type { CardProps } from "./Card";

export type CardsListProps = {
  items: CardProps[];
  onOpen?: (id: string) => void;
  emptyHint?: string;
};

export function CardsList({ items, onOpen, emptyHint }: CardsListProps) {
  if (items.length === 0) {
    return (
      <div role="status" className="text-center text-[--fg-muted] py-8">
        {emptyHint ?? "Sin resultados"}
      </div>
    );
  }

  return (
    <div role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <div
          role="listitem"
          key={it.id}
          className="opacity-0 translate-y-2 animate-[fadeIn_.2s_ease-out_forwards]"
        >
          <Card {...it} onOpen={onOpen ?? it.onOpen} />
        </div>
      ))}

      <style>{`
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export type { CardProps };
