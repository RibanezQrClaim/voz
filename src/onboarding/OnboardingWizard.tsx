import React, { useEffect, useState } from 'react';
import { AppShell } from '../app/AppShell';
import { usePersonalization } from '../store/personalization';
import { StepAgent } from './steps/StepAgent';
import { StepVoice } from './steps/StepVoice';
import { StepRolePriorities } from './steps/StepRolePriorities';
import { StepTrustCircle } from './steps/StepTrustCircle';
import { StepRules } from './steps/StepRules';

const TOTAL_STEPS = 5;

export function OnboardingWizard() {
  const { state, save, lastStep, saveLastStep } = usePersonalization();
  const [local, setLocal] = useState(state);
  const [step, setStep] = useState(1);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    setLocal(state);
  }, [state]);

  useEffect(() => {
    if (lastStep) setStep(lastStep);
  }, [lastStep]);

  const goNext = () => {
    if (!valid) return;
    const next = Math.min(step + 1, TOTAL_STEPS);
    save(local);
    setStep(next);
    saveLastStep(next);
    setValid(false);
  };
  const goBack = () => {
    const prev = Math.max(step - 1, 1);
    setStep(prev);
    saveLastStep(prev);
    setValid(false);
  };
  const saveExit = () => {
    save(local);
    saveLastStep(step);
    // TODO: navigate out
  };
  const confirm = () => {
    if (!valid) return;
    save({ ...local, isComplete: true });
    saveLastStep(TOTAL_STEPS);
  };

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <StepAgent
            value={local.agentProfile}
            onChange={agentProfile => setLocal({ ...local, agentProfile })}
            onValidChange={setValid}
          />
        );
      case 2:
        return (
          <StepVoice
            value={local.agentProfile.voice}
            onChange={voice => setLocal({ ...local, agentProfile: { ...local.agentProfile, voice } })}
            onValidChange={setValid}
          />
        );
      case 3:
        return (
          <StepRolePriorities
            user={local.user}
            onChange={user => setLocal({ ...local, user })}
            onValidChange={setValid}
          />
        );
      case 4:
        return (
          <StepTrustCircle
            items={local.trustCircle}
            onChange={items => setLocal({ ...local, trustCircle: items })}
            onValidChange={setValid}
          />
        );
      case 5:
        return (
          <StepRules
            rules={local.rules}
            onChange={rules => setLocal({ ...local, rules })}
            onValidChange={setValid}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppShell
      step={step}
      total={TOTAL_STEPS}
      onBack={step > 1 ? goBack : undefined}
      onNext={step < TOTAL_STEPS ? goNext : undefined}
      onSaveExit={saveExit}
      onConfirm={step === TOTAL_STEPS ? confirm : undefined}
      nextDisabled={!valid}
      confirmDisabled={!valid}
    >
      {stepContent()}
    </AppShell>
  );
}
