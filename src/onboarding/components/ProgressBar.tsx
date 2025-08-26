import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = (current / total) * 100;
  return (
    <div className="h-2 bg-gray-200">
      <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
