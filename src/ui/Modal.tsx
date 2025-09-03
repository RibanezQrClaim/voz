import React from 'react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
        {children}
        <div className="mt-4 text-right">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}



