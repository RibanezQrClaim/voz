import { useEffect, useState } from 'react';

interface Props {
  onOpenSummary?: () => void;
}

export default function FirstVictoryBanner({ onOpenSummary }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const debug =
        params.get('banner') === 'force' ||
        params.get('state') === 'firstVictory';
      const onboardingDone = localStorage.getItem('nx.onboarding.done') === '1';
      const dismissed = localStorage.getItem('nx.fv.dismissed') === '1';
      if (debug || (onboardingDone && !dismissed)) setVisible(true);
    } catch {
      // no-op
    }
  }, []);

  const onClose = () => {
    try {
      localStorage.setItem('nx.fv.dismissed', '1');
    } catch {}
    setVisible(false);
  };

  const onCta = () => {
    if (onOpenSummary) onOpenSummary();
    else console.log('cta:first-victory'); // TODO: conectar con resumen real en un pitch posterior
  };

  if (!visible) return null;

  return (
    <div role="region" aria-label="Primera Victoria" className="sticky top-0 z-10 mb-4">
      <div className="bg-surface backdrop-blur-[14px] rounded-2xl shadow-glass border border-white/40 px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-lg">Te doy valor ahora</div>
          <div className="text-sm opacity-80">Puedo mostrarte un resumen de hoy en 10s.</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCta}
            className="px-3 py-1.5 rounded-xl bg-primary text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/60"
          >
            Ver resumen de hoy
          </button>

          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="px-2 py-1 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
