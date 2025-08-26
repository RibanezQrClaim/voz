import React from 'react';

interface ChipProps {
  label: string;
  onRemove?: () => void;
}

export function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="px-2 py-1 border inline-flex items-center gap-1">
      {label}
      {onRemove && <button onClick={onRemove}>x</button>}
    </span>
  );
}
