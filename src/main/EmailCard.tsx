import React from 'react';
import type { EmailSummary } from 'src/contracts';
import { Button } from 'src/ui/Button';

interface EmailCardProps {
  summary: EmailSummary;
  importance: 'urgent' | 'important' | 'normal';
}

export function EmailCard({ summary, importance }: EmailCardProps) {
  const badgeColor =
    importance === 'urgent'
      ? 'bg-red-500'
      : importance === 'important'
      ? 'bg-yellow-500'
      : 'bg-gray-300';

  return (
    <div className="border p-4 rounded">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold">{summary.subject}</h3>
          <p className="text-sm text-gray-600">{summary.from}</p>
        </div>
        <span className={`text-xs text-white px-2 py-1 rounded ${badgeColor}`}>
          {importance}
        </span>
      </div>
      <p className="mb-4 text-sm text-gray-700">{summary.summary280}</p>
      <div className="flex gap-2">
        <Button>Abrir</Button>
        <Button>Resumen</Button>
      </div>
    </div>
  );
}
