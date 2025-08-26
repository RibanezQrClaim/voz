import React from 'react';
import type { EmailSummary } from 'src/contracts';

interface EmailCardProps {
  summary: EmailSummary;
}

export function EmailCard({ summary }: EmailCardProps) {
  return (
    <div className="border p-2">
      {/* TODO: render email summary */}
      {summary?.subject}
    </div>
  );
}
