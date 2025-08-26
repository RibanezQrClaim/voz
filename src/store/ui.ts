import { useState, useEffect } from 'react';
import type { UIState } from 'src/contracts';
import { memoryAdapter } from 'src/adapters/memoryAdapter';

const NS = 'nexusg.v1.ui';
const KEY = 'store';

export function useUI() {
  const [state, setState] = useState<UIState>({
    view: 'onboarding',
    list: [],
    listFilter: 'all',
    listSort: 'recency'
  });

  useEffect(() => {
    const stored = memoryAdapter.get(NS, KEY);
    if (stored) setState(s => ({ ...s, ...stored }));
  }, []);

  const updateState = (updater: (prev: UIState) => UIState) => {
    setState(prev => {
      const next = updater(prev);
      memoryAdapter.set(NS, KEY, {
        view: next.view,
        listFilter: next.listFilter,
        listSort: next.listSort
      });
      return next;
    });
  };

  return { state, setState: updateState };
}
