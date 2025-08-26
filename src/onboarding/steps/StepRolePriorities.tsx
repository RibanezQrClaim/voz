import React, { useEffect } from 'react';
import { Input } from '../../ui/Input';
import type { UserContext } from '../../contracts';

interface StepRolePrioritiesProps {
  user: UserContext;
  onChange: (user: UserContext) => void;
  onValidChange?: (v: boolean) => void;
}

export function StepRolePriorities({ user, onChange, onValidChange }: StepRolePrioritiesProps) {
  const updatePriority = (idx: number, value: string) => {
    const priorities = [...user.priorities] as [string, string, string];
    priorities[idx] = value;
    onChange({ ...user, priorities });
  };

  const validCount = user.priorities.filter(p => p.trim()).length;
  const errors = user.priorities.map(p => (p.trim() ? '' : 'Requerido'));

  useEffect(() => {
    onValidChange?.(validCount === 3);
  }, [validCount, onValidChange]);

  return (
    <div id="wiz-step-3-role" className="flex flex-col gap-2">
      <Input value={user.role} onChange={e => onChange({ ...user, role: e.target.value })} placeholder="Rol" />
      {user.priorities.map((p, i) => (
        <div key={i} className="flex flex-col">
          <Input value={p} onChange={e => updatePriority(i, e.target.value)} placeholder={`Prioridad ${i + 1}`} />
          {errors[i] && <span data-testid={`error-priority-${i}`}>{errors[i]}</span>}
        </div>
      ))}
      <span>{validCount}/3</span>
      <Input value={user.primaryEmail} readOnly />
      <Input value={user.timezone} readOnly />
    </div>
  );
}
