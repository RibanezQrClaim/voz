import React from 'react';

export function SkeletonList(): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl border border-[--border] bg-[--card] animate-pulse"
        />
      ))}
    </div>
  );
}

