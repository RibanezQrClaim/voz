import React from 'react';
import { ProgressBar } from '../onboarding/components/ProgressBar';
import { Button } from '../ui/Button';

interface AppShellProps {
  step: number;
  total: number;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  onSaveExit?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
}

export function AppShell({
  step,
  total,
  children,
  onBack,
  onNext,
  nextDisabled,
  onSaveExit,
  onConfirm,
  confirmDisabled,
}: AppShellProps) {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center justify-between">
        <span>Logo | Paso {step}</span>
        <Button id="btn-theme" className="px-2 py-1 text-sm" onClick={toggleTheme}>
          Tema
        </Button>
      </header>
      <ProgressBar current={step} total={total} />
      <main className="flex-1 p-4">{children}</main>
      <footer className="p-4 flex gap-2 justify-end">
        {onBack && <Button id="btn-back" onClick={onBack}>Atrás</Button>}
        {onSaveExit && <Button id="btn-save-exit" onClick={onSaveExit}>Guardar y salir</Button>}
        {onNext && <Button id="btn-next" onClick={onNext} disabled={nextDisabled}>Continuar</Button>}
        {onConfirm && <Button id="btn-confirm" onClick={onConfirm} disabled={confirmDisabled}>Confirmar</Button>}
      </footer>
    </div>
  );
}
