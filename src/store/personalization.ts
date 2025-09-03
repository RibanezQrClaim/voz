import { useEffect, useState } from 'react';
import { memoryAdapter } from '../adapters/memoryAdapter';
import type { PersonalizationState } from '../contracts';

const NS = 'nexusg.v1.personalization';
const KEY = 'state';

const emptyState: PersonalizationState = {
  agentProfile: { id: '', name: '', voice: 'a', createdAt: '', updatedAt: '' },
  user: { role: '', priorities: ['', '', ''], timezone: '', primaryEmail: '' },
  trustCircle: [],
  rules: [],
  isComplete: false
};

export function usePersonalization() {
  const [state, setState] = useState<PersonalizationState>(emptyState);
  const [lastStep, setLastStep] = useState(0);

  useEffect(() => {
    const stored = memoryAdapter.get(NS, KEY);
    if (stored) setState(stored);
    const step = memoryAdapter.get(NS, 'lastStep');
    if (typeof step === 'number') setLastStep(step);
  }, []);

  const save = (next: PersonalizationState) => {
    setState(next);
    memoryAdapter.set(NS, KEY, next);
  };

  const saveLastStep = (step: number) => {
    setLastStep(step);
    memoryAdapter.set(NS, 'lastStep', step);
  };

  return { state, save, lastStep, saveLastStep };
}



