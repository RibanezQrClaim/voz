import * as React from "react";

export function EmptyState({ message = "Sin resultados" }: { message?: string }) {
  return (
    <div className="text-center text-[--fg-muted] py-16">
      <p className="text-sm">{message}</p>
    </div>
  );
}
