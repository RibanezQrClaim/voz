import React, { useEffect } from 'react';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import type { AgentProfile } from 'src/contracts';

interface StepVoiceProps {
  value: AgentProfile['voice'];
  onChange: (v: AgentProfile['voice']) => void;
  onValidChange?: (v: boolean) => void;
}

export function StepVoice({ value, onChange, onValidChange }: StepVoiceProps) {
  const error = value ? '' : 'Requerido';

  useEffect(() => {
    onValidChange?.(!error);
  }, [error, onValidChange]);

  return (
    <div id="wiz-step-2-voice" className="flex flex-col gap-2">
      <Select value={value} onChange={e => onChange(e.target.value as AgentProfile['voice'])}>
        <option value="">Selecciona</option>
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
      </Select>
      {error && <span data-testid="error-voice">{error}</span>}
      <Button onClick={() => { /* TODO: preview voice */ }}>Pre-escuchar</Button>
    </div>
  );
}
