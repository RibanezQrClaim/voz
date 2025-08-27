import React from 'react';

export type CardProps = {
  id: string;
  title: string;
  subtitle?: string;
  preview?: string; // truncado visual a ~3 líneas
  meta?: { date?: string; tags?: string[]; urgent?: boolean };
  onOpen?: (id: string) => void;
};

export function Card({ id, title, subtitle, preview, meta, onOpen }: CardProps): JSX.Element {
  const titleId = `${id}-title`;
  return (
    <article
      aria-labelledby={titleId}
      className="relative rounded-2xl border bg-[--card] border-[--border] p-4 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-col flex-1">
          <h3 id={titleId} className="text-base font-semibold text-[--fg]">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-[--fg-muted]">{subtitle}</p>}
        </div>
        {meta?.urgent && (
          <span className="ml-2 shrink-0 rounded-full border border-[--danger] bg-[--danger] px-2 py-0.5 text-xs text-[--bg]">
            Urgente
          </span>
        )}
      </div>
      {preview && (
        <p className="mt-2 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] text-sm text-[--fg]">
          {preview}
        </p>
      )}
      {(meta?.tags || meta?.date) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {meta?.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[--bg-muted] px-2 py-0.5 text-xs text-[--fg]"
            >
              {tag}
            </span>
          ))}
          {meta?.date && (
            <span className="ml-auto text-xs text-[--fg-muted]">{meta.date}</span>
          )}
        </div>
      )}
      {onOpen && (
        <button
          type="button"
          onClick={() => onOpen(id)}
          aria-label={`Abrir ${title}`}
          className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[--ring]"
        />
      )}
    </article>
  );
}

