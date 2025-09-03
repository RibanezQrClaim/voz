import React from 'react';
import { Input } from './Input';
import { Select } from './Select';

export type Filters = {
  q: string;
  urgentOnly: boolean;
  tag?: string;
  dateFrom?: string; // ISO yyyy-mm-dd
  dateTo?: string;   // ISO yyyy-mm-dd
};

type Props = {
  value: Filters;
  onChange: (f: Filters) => void;
  tags?: string[]; // opciones para el select de tags
};

export function FiltersBar({ value, onChange, tags = [] }: Props): JSX.Element {
  const searchId = React.useId();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        (document.getElementById(searchId) as HTMLInputElement | null)?.focus();
      } else if (e.key === 'Escape' && value.q) {
        onChange({ ...value, q: '' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchId, value, onChange]);

  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  return (
    <div role="search" className="flex flex-wrap items-end gap-2">
      <Input
        id={searchId}
        aria-label="Buscar"
        placeholder="Buscar"
        value={value.q}
        onChange={(e) => update({ q: e.target.value })}
        className="flex-1 min-w-[200px]"
      />
      <Select
        aria-label="Etiqueta"
        value={value.tag ?? ''}
        onChange={(e) => update({ tag: e.target.value || undefined })}
        className="w-40"
      >
        <option value="">Todas</option>
        {tags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
      <label className="flex items-center gap-2 text-sm text-[--fg]">
        <input
          type="checkbox"
          checked={value.urgentOnly}
          onChange={(e) => update({ urgentOnly: e.target.checked })}
          aria-label="SÃ³lo urgentes"
          className="h-4 w-4 rounded border border-[--border] bg-[--card] text-[--ring] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
        />
        <span>SÃ³lo urgentes</span>
      </label>
      <Input
        type="date"
        aria-label="Desde"
        value={value.dateFrom ?? ''}
        onChange={(e) => update({ dateFrom: e.target.value || undefined })}
        className="w-36"
      />
      <Input
        type="date"
        aria-label="Hasta"
        value={value.dateTo ?? ''}
        onChange={(e) => update({ dateTo: e.target.value || undefined })}
        className="w-36"
      />
    </div>
  );
}




