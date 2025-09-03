// src/ui/Toast.tsx
import * as React from "react";

export type ToastType = "success" | "error" | "info";
export type ToastProps = {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  durationMs?: number;
};

export function Toast({
  id,
  type,
  message,
  onClose,
  durationMs = 2500,
}: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(() => onClose(id), durationMs);
    return () => clearTimeout(t);
  }, [id, durationMs, onClose]);

  const role = type === "error" ? "alert" : "status";

  const tone =
    type === "success"
      ? "border-[--success]"
      : type === "error"
        ? "border-[--danger]"
        : "border-[--ring]";

  return (
    <div
      role={role}
      className={`rounded-xl border bg-[--card] text-[--fg] shadow-sm px-3 py-2 ${tone}`}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}



