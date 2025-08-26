import React from 'react';

interface ChipProps {
  label: string;
  onRemove?: () => void;
}

export function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="px-2 py-1 border rounded-full bg-gray-100 text-sm inline-flex items-center gap-1">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
