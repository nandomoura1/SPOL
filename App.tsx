import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Step1Login, Step2Occurrence, Step3Team } from './components/Steps/AuthAndInfo';
import { Step4Decal, Step5FIP, Step6Lab } from './components/Steps/Evidence';
import { Step7Observations, Step8Report } from './components/Steps/Finalization';
import { AppState, INITIAL_STATE } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);

  const updateState = (updates: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setAppState((prev) => ({ ...prev, step: prev.step + 1 }));
  };

  const prevStep = () => {
    setAppState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  const renderStep = () => {
    const props = {
      state: appState,
      updateState,
      nextStep,
      prevStep,
    };

    switch (appState.step) {
      case 1: return <Step1Login {...props} />;
      case 2: return <Step2Occurrence {...props} />;
      case 3: return <Step3Team {...props} />;
      case 4: return <Step4Decal {...props} />;
      case 5: return <Step5FIP {...props} />;
      case 6: return <Step6Lab {...props} />;
      case 7: return <Step7Observations {...props} />; // Includes Uploads
      case 8: return <Step8Report {...props} />;
      default: return <div>Passo desconhecido</div>;
    }
  };
  
  // Login screen is standalone, no sidebar usually, but Layout handles it fine if we want consistency.
  // However, the design requests specific screens. We'll use Layout for all to keep the sidebar nav accessible on desktop.
  
  return (
    <Layout currentStep={appState.step}>
      {renderStep()}
    </Layout>
  );
}