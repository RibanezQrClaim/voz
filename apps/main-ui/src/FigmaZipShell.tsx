// apps/main-ui/src/FigmaZipShell.tsx
import { useMemo, useState } from 'react';
import { sendMessage } from './lib/agent';

import { Sidebar } from './figma/Sidebar';
import { ChatPanel } from './figma/ChatPanel';
import { BottomBar } from './figma/BottomBar';
import { EmptyState } from './figma/EmptyState';
import { LoadingState } from './figma/LoadingState';
import { ErrorBanner } from './figma/ErrorBanner';
import { VictoryBanner } from './figma/VictoryBanner';
import { FloatingStopButton } from './figma/FloatingStopButton';

type AppState = 'normal' | 'empty' | 'loading' | 'error';

type Msg = {
  id: number;
  type: 'user' | 'assistant';
  title?: string;
  content: string;
  timestamp: Date;
};

export default function FigmaZipShell() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialState = (params.get('state') as AppState) ?? 'normal';

  const [activeCategory, setActiveCategory] = useState('HOY');
  const [appState, setAppState] = useState<AppState>(initialState);
  const [showVictoryBanner, setShowVictoryBanner] = useState(params.get('banner') === 'force');
  const [showError, setShowError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      type: 'assistant',
      title: 'Resumen de hoy',
      content:
        'Perfecto, te muestro un resumen de tus tareas para el día de hoy. Tienes 3 tareas importantes y 2 reuniones programadas.',
      timestamp: new Date(),
    },
    { id: 2, type: 'user', content: 'Necesito revisar mis tareas pendientes para hoy', timestamp: new Date() },
  ]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    // agrega mensaje del usuario
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text, timestamp: new Date() }]);
    setAppState('loading');

    try {
      const reply = await sendMessage(text);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, type: 'assistant', content: reply || 'OK', timestamp: new Date() },
      ]);
      setAppState('normal');
    } catch (e) {
      console.error(e);
      setShowError(true);
      setAppState('error');
    }
  };

  const renderMain = () => {
    if (showError || appState === 'error') return <ErrorBanner onClose={() => setShowError(false)} />;
    if (appState === 'empty') return <EmptyState />;
    if (appState === 'loading') return <LoadingState />;
    return <ChatPanel messages={messages} />;
  };

  return (
    <div className="min-h-screen flex bg-figma-gradient text-text">
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onStateChange={(st: AppState) => setAppState(st)}
      />

      <div className="relative flex-1 flex flex-col">
        {showVictoryBanner && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
            <VictoryBanner
              onAccept={() => setShowVictoryBanner(false)}
              onDismiss={() => setShowVictoryBanner(false)}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col">{renderMain()}</div>

        <BottomBar onSendMessage={handleSendMessage} />
        <FloatingStopButton isRecording={isRecording} onToggle={() => setIsRecording(v => !v)} />
      </div>
    </div>
  );
}
