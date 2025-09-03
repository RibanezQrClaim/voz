import { useCallback, useState } from "react";
import { ToastProps, ToastType } from "./Toast";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string, durationMs?: number) => {
      const id = generateId();
      setToasts((ts) => [...ts, { id, type, message, onClose: remove, durationMs }]);
    },
    [remove]
  );

  return { toasts, push, remove };
}



