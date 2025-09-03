import * as React from "react";

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargandoâ€¦"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[--border] bg-[--card] p-4 animate-pulse"
        >
          <div className="h-5 w-1/2 mb-2 bg-[--bg-muted] rounded" />
          <div className="h-3 w-1/3 mb-4 bg-[--bg-muted] rounded" />
          <div className="h-3 w-full mb-2 bg-[--bg-muted] rounded" />
          <div className="h-3 w-5/6 bg-[--bg-muted] rounded" />
        </div>
      ))}
    </div>
  );
}



