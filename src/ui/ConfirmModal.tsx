import React, { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

export type ConfirmModalProps = {
  open: boolean;
  title?: string;              // default: "Hay cambios sin guardar"
  description?: string;        // default breve
  confirmLabel?: string;       // default: "Guardar y continuar"
  discardLabel?: string;       // default: "Descartar cambios"
  cancelLabel?: string;        // default: "Cancelar"
  onConfirm: () => void;       // guardar
  onDiscard: () => void;       // descartar
  onCancel: () => void;        // cerrar sin acción
};

export function ConfirmModal({
  open,
  title = "Hay cambios sin guardar",
  description = "Los cambios se perderán si sales sin guardar.",
  confirmLabel = "Guardar y continuar",
  discardLabel = "Descartar cambios",
  cancelLabel = "Cancelar",
  onConfirm,
  onDiscard,
  onCancel,
}: ConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Tab") {
        if (focusable.length === 0) return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            (last as HTMLElement)?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            (first as HTMLElement)?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    (first as HTMLElement)?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div
        ref={panelRef}
        className="w-full max-w-sm rounded-md bg-[--card] p-6 shadow-lg"
      >
        <h2 id={titleId} className="mb-2 text-lg font-semibold text-[--fg]">
          {title}
        </h2>
        <p id={descId} className="mb-4 text-sm text-[--fg-muted]">
          {description}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="danger" onClick={onDiscard}>
            {discardLabel}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
