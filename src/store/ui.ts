import { useState } from 'react';
import type { UIState } from 'src/contracts';

export function useUI() {
  const [state, setState] = useState<UIState>({
    view: 'config',       // ← arrancar en Config
    list: [],
    listFilter: 'all',
    listSort: 'recency'
  });

  return { state, setState };
}