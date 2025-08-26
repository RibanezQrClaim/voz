import React from 'react';
import { CardsList } from './CardsList';
import { useUI } from 'src/store/ui';
import { Select } from 'src/ui/Select';
import { Button } from 'src/ui/Button';

export function MainView() {
  const { state, setState } = useUI();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(s => ({ ...s, listFilter: e.target.value as any }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(s => ({ ...s, listSort: e.target.value as any }));
  };

  return (
    <div className="p-4">
      <div id="main-toolbar" className="mb-4 flex gap-2">
        <Select
          id="filter-select"
          value={state.listFilter}
          onChange={handleFilterChange}
        >
          <option value="all">all</option>
          <option value="urgent">urgent</option>
          <option value="today">today</option>
        </Select>
        <Select
          id="sort-select"
          value={state.listSort}
          onChange={handleSortChange}
        >
          <option value="recency">recency</option>
          <option value="importance">importance</option>
        </Select>
      </div>

      {state.list.length === 0 ? (
        <div className="text-center space-y-4">
          <p>No hay tarjetas aún</p>
          <Button onClick={() => setState(s => ({ ...s, view: 'config' as any }))}>
            Ir a Config
          </Button>
        </div>
      ) : (
        <CardsList cards={state.list} />
      )}
    </div>
  );
}
