// src/app/MainView.tsx
import * as React from "react";
import { SidebarNav, NavItem } from "../ui/SidebarNav";
import { FiltersBar, Filters } from "../ui/FiltersBar";
import { CardsList } from "../ui/CardsList";
import type { CardProps } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { SkeletonList } from "../ui/SkeletonList";

export type MainViewProps = {
  nav: { items: NavItem[]; activeId?: string; onSelect: (id: string) => void };
  filters: { value: Filters; onChange: (f: Filters) => void; tags?: string[] };
  data: {
    items: CardProps[];
    loading: boolean;
    page: number;
    pageSize: number;
    total?: number;
    onPage: (page: number) => void;
    onOpen?: (id: string) => void;
  };
  title?: string;
  emptyHint?: string;
};

export function MainView({
  nav,
  filters,
  data,
  title = "Bandeja",
  emptyHint = "Sin resultados",
}: MainViewProps) {
  const total = data.total ?? data.items.length;
  const canPrev = data.page > 1;
  const canNext = data.items.length >= data.pageSize;

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-4 p-4">
      {/* Sidebar */}
      <nav aria-label="NavegaciÃ³n" className="md:sticky md:top-4 self-start">
        <SidebarNav items={nav.items} activeId={nav.activeId} onSelect={nav.onSelect} />
      </nav>

      {/* Content */}
      <main role="main" className="space-y-4">
        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-[--bg] border-b border-[--border] py-2">
          <div
            className="flex items-center justify-between"
            aria-labelledby="main-title"
          >
            <div>
              <h2 id="main-title" className="text-lg font-semibold">
                {title}
              </h2>
              <p className="text-sm text-[--fg-muted]">{total} resultados</p>
            </div>
            <div className="flex items-center gap-2">{/* acciones futuras */}</div>
          </div>

          {/* Filters */}
          <div className="mt-3">
            <FiltersBar value={filters.value} onChange={filters.onChange} tags={filters.tags} />
          </div>
        </div>

        {/* Body */}
        {data.loading ? (
          <SkeletonList />
        ) : data.items.length === 0 ? (
          <EmptyState message={emptyHint} />
        ) : (
          <CardsList items={data.items} onOpen={data.onOpen} />
        )}

        {/* Pagination */}
        <nav
          aria-label="PaginaciÃ³n"
          className="flex items-center justify-end gap-2 pt-2 border-t border-[--border]"
        >
          <button
            className="h-9 px-3 rounded-xl border border-[--border] bg-[--bg-muted] hover:bg-[--card] focus:outline-none focus:ring-2 ring-[--ring] disabled:opacity-50"
            onClick={() => data.onPage(data.page - 1)}
            disabled={!canPrev}
            aria-label="PÃ¡gina anterior"
          >
            Anterior
          </button>
          <span className="text-sm text-[--fg-muted] px-2">PÃ¡g. {data.page}</span>
          <button
            className="h-9 px-3 rounded-xl border border-[--border] bg-[--bg-muted] hover:bg-[--card] focus:outline-none focus:ring-2 ring-[--ring] disabled:opacity-50"
            onClick={() => data.onPage(data.page + 1)}
            disabled={!canNext}
            aria-label="PÃ¡gina siguiente"
          >
            Siguiente
          </button>
        </nav>
      </main>
    </div>
  );
}



