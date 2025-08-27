import React from 'react';
import { SidebarNav, NavItem } from '../ui/SidebarNav';
import { FiltersBar, Filters } from '../ui/FiltersBar';
import { CardsList, CardProps } from '../ui/CardsList';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonList } from '../ui/SkeletonList';

export type MainViewProps = {
  nav: { items: NavItem[]; activeId?: string; onSelect: (id: string) => void };
  filters: { value: Filters; onChange: (f: Filters) => void; tags?: string[] };
  data: {
    items: CardProps[];
    loading: boolean;
    page: number;
    pageSize: number;
    total?: number;               // opcional para mostrar contador
    onPage: (page: number) => void;
    onOpen?: (id: string) => void;
  };
  title?: string;                 // default: "Bandeja"
  emptyHint?: string;             // mensaje para estado vacío
};

export function MainView({ nav, filters, data, title = 'Bandeja', emptyHint }: MainViewProps): JSX.Element {
  const titleId = React.useId();
  const count = data.total ?? data.items.length;
  const prevDisabled = data.page <= 1;
  const nextDisabled = data.items.length < data.pageSize;

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-4">
      <nav aria-label="Navegación" className="md:sticky md:top-0 md:h-screen">
        <SidebarNav items={nav.items} activeId={nav.activeId} onSelect={nav.onSelect} />
      </nav>
      <main role="main" className="flex flex-col gap-4 bg-[--bg]">
        <div className="sticky top-0 z-10 bg-[--bg] border-b border-[--border] p-4">
          <header aria-labelledby={titleId} className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h1 id={titleId} className="text-lg font-semibold text-[--fg]">{title}</h1>
              <span className="text-sm text-[--fg-muted]">{count} resultados</span>
            </div>
            <div className="flex items-center gap-2" />
          </header>
          <div className="mt-2">
            <FiltersBar value={filters.value} onChange={filters.onChange} tags={filters.tags} />
          </div>
        </div>
        <div className="p-4">
          {data.loading ? (
            <SkeletonList />
          ) : data.items.length === 0 ? (
            <EmptyState message={emptyHint || 'Sin resultados'} />
          ) : (
            <CardsList items={data.items} onOpen={data.onOpen} />
          )}
        </div>
        <nav aria-label="Paginación" className="px-4 pb-4 flex justify-center gap-2">
          <button
            type="button"
            aria-label="Anterior"
            disabled={prevDisabled}
            onClick={() => data.onPage(data.page - 1)}
            className="rounded-md border border-[--border] bg-[--card] px-3 py-1 text-sm text-[--fg] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[--ring]"
          >
            Anterior
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            disabled={nextDisabled}
            onClick={() => data.onPage(data.page + 1)}
            className="rounded-md border border-[--border] bg-[--card] px-3 py-1 text-sm text-[--fg] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[--ring]"
          >
            Siguiente
          </button>
        </nav>
      </main>
    </div>
  );
}

