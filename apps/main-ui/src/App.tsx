// apps/main-ui/src/App.tsx
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { NxAssistantBubble, NxButton, NxChip, NxUserBubble } from '@nexusg/ui';
import ErrorBanner from './components/ErrorBanner';
import OfflineNotice from './components/OfflineNotice';
import FirstVictoryBanner from './components/FirstVictoryBanner';

export default function App() {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const state = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('state');
    } catch {
      return null;
    }
  }, []);

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const update = () => {
      try {
        setIsOffline(!navigator.onLine);
      } catch {
        setIsOffline(false);
      }
    };
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

  let content: ReactNode;
  if (state === 'empty') {
    content = (
      <div className="flex flex-1 items-center justify-center p-4" role="status">
        <p>No hay mensajes aún.</p>
      </div>
    );
  } else if (isLoading) {
    content = (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
        <div className="h-4 rounded-xl bg-surface/60 backdrop-blur-[14px] shadow-glass border border-white/40" />
        <div className="h-4 rounded-xl bg-surface/60 backdrop-blur-[14px] shadow-glass border border-white/40" />
        <div className="h-4 rounded-xl bg-surface/60 backdrop-blur-[14px] shadow-glass border border-white/40" />
      </div>
    );
  } else {
    content = (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <NxUserBubble ariaLabel="Mensaje de usuario">Hola</NxUserBubble>
        <NxAssistantBubble ariaLabel="Respuesta del asistente">
          <div className="space-y-2">
            <p>¿En qué puedo ayudarte?</p>
            <div className="flex gap-2">
              <NxChip>Normal</NxChip>
              <NxChip variant="urgent">Urgente</NxChip>
            </div>
          </div>
        </NxAssistantBubble>
      </div>
    );
  }

  let banner: ReactNode = null;
  if (isError) banner = <ErrorBanner />;
  else if (offline) banner = <OfflineNotice />;
  else banner = <FirstVictoryBanner />;

  return (
    <div className="flex h-screen text-text">
      <aside className="w-56 bg-surface border-r border-primary/10 p-4">Sidebar</aside>
      <main className="flex flex-1 flex-col" aria-busy={isLoading}>
        {banner}

        {/* --- SMOKE (quitar cuando valides que Tailwind está activo) --- */}
        <div className="p-3 bg-red-500 text-white rounded-xl mb-4">tailwind OK</div>
        <div className="mt-2 p-6 rounded-2xl border border-white/40 shadow-glass backdrop-blur-[14px] bg-white/60">
          Glass card con tokens
        </div>
        {/* --- /SMOKE --- */}

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
