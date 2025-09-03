// apps/main-ui/src/App.tsx
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { NxAssistantBubble, NxButton, NxChip, NxUserBubble } from '@nexusg/ui';
import ErrorBanner from './components/ErrorBanner';
import OfflineNotice from './components/OfflineNotice';
import FirstVictoryBanner from './components/FirstVictoryBanner';

// â¬‡ï¸ importa el skin
import FigmaZipShell from './FigmaZipShell';

export default function App() {
  // Flags QA
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const ui = params.get('ui');
  const state = params.get('state');
  const isSmoke = params.get('smoke') === '1';

  // â¬‡ï¸ si pides el skin, lo devolvemos y listo
  if (ui === 'figma') {
    return <FigmaZipShell />;
  }

  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const isError = state === 'error';
  const offline = state === 'offline' || isOffline;
  const isLoading = state === 'loading';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  const content: ReactNode =
    state === 'empty' ? (
      <div className="flex flex-1 items-center justify-center p-4" role="status">
        <p>No hay mensajes aÃºn.</p>
      </div>
    ) : isLoading ? (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
        <div className="h-4 rounded-xl bg-white/60 backdrop-blur-[14px] shadow-glass border border-white/40" />
        <div className="h-4 rounded-xl bg-white/60 backdrop-blur-[14px] shadow-glass border border-white/40" />
        <div className="h-4 rounded-xl bg-white/60 backdrop-blur-[14px] shadow-glass border border-white/40" />
      </div>
    ) : (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <NxUserBubble ariaLabel="Mensaje de usuario">Hola</NxUserBubble>
        <NxAssistantBubble ariaLabel="Respuesta del asistente">
          <div className="space-y-2">
            <p>Â¿En quÃ© puedo ayudarte?</p>
            <div className="flex gap-2">
              <NxChip>Normal</NxChip>
              <NxChip variant="urgent">Urgente</NxChip>
            </div>
          </div>
        </NxAssistantBubble>
      </div>
    );

  return (
    <div className="flex h-screen text-text">
      <aside className="w-56 bg-surface border-r border-primary/10 p-4">Sidebar</aside>

      <main className="flex flex-1 flex-col" aria-busy={isLoading}>
        {isError ? <ErrorBanner /> : offline ? <OfflineNotice /> : <FirstVictoryBanner />}

        {/* Smoke QA solo con ?smoke=1 */}
        {isSmoke && (
          <div className="p-4 space-y-4">
            <div className="bg-red-500 rounded-2xl p-4 text-white">Tailwind v3 OK</div>
            <div className="rounded-2xl border border-white/40 bg-white/60 shadow-glass backdrop-blur-[14px] p-4">
              <p className="text-sm text-text">Glass OK â€” tokens & preset activos</p>
            </div>
          </div>
        )}

        {content}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-primary/10 p-4"
        >
          <input
            aria-label="Escribe un mensaje"
            className="flex-1 rounded-xl border border-primary/20 bg-surface px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Escribe un mensaje..."
          />
          <NxButton type="submit">Enviar</NxButton>
          <NxButton type="button" variant="secondary">
            Cancelar
          </NxButton>
        </form>
      </main>
    </div>
  );
}



