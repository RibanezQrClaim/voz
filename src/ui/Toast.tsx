import React from "react";

export interface ToastProps {
  message: string;
  kind?: "success" | "error" | "info";
}

const kinds: Record<NonNullable<ToastProps["kind"]>, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-gray-800",
};

export function Toast({ message, kind = "info" }: ToastProps) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-md px-3 py-2 text-white shadow-lg ${kinds[kind]}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
