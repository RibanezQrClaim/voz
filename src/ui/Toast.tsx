import React, { useEffect, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

export type ToastProps = {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  durationMs?: number;
};

const typeStyles: Record<ToastType, string> = {
  success: "border-l-[--success]",
  error: "border-l-[--danger]",
  info: "border-l-[--ring]",
};

export function Toast({ id, type, message, onClose, durationMs }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const d = setTimeout(() => handleClose(), durationMs ?? 5000);
    return () => {
      clearTimeout(t);
      clearTimeout(d);
    };
  }, [durationMs]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose(id), 200);
  }, [id, onClose]);

  const role = type === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      className={`pointer-events-auto mb-2 flex items-start gap-2 rounded-md border border-[--border] ${typeStyles[type]} border-l-4 bg-[--card] px-4 py-3 text-sm text-[--fg] shadow transition transform duration-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={handleClose}
        className="ml-2 text-[--fg-muted] hover:text-[--fg]"
      >
        ×
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: ToastProps[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}
