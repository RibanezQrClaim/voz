import { useState } from 'react';
import type { Card, UIState } from 'src/contracts';

export function useUI() {
  const [state, setState] = useState<UIState>({
    view: 'onboarding',
    list: [],
    listFilter: 'all',
    listSort: 'recency'
  });

  return { state, setState };
}
