import React from 'react';
import { usePersonalization } from '../store/personalization';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';
import { MainView } from '../main/MainView';

export function App() {
  const { state } = usePersonalization();
  return state.isComplete ? <MainView /> : <OnboardingWizard />;
}
