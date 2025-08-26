import React, { useEffect } from 'react';
import { Input } from '../../ui/Input';
import type { AgentProfile } from 'src/contracts';

interface StepAgentProps {
  value: AgentProfile;
  onChange: (next: AgentProfile) => void;
  onValidChange?: (v: boolean) => void;
}

export function StepAgent({ value, onChange, onValidChange }: StepAgentProps) {
  const error = !value.name ? 'Requerido' : value.name.length > 40 ? 'Máx. 40' : '';

  useEffect(() => {
    onValidChange?.(!error);
  }, [error, onValidChange]);

  return (
    <div id="wiz-step-1-name" className="flex flex-col">
      <Input
        value={value.name}
        onChange={e => onChange({ ...value, name: e.target.value })}
        placeholder="Laura"
      />
      {error && <span data-testid="error-name">{error}</span>}
    </div>
  );
}
