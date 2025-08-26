import React from 'react';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white">
      {message}
    </div>
  );
}
