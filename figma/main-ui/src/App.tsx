import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { BottomBar } from './components/BottomBar';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { ErrorBanner } from './components/ErrorBanner';
import { VictoryBanner } from './components/VictoryBanner';
import { FloatingStopButton } from './components/FloatingStopButton';

type AppState = 'normal' | 'empty' | 'loading' | 'error';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('HOY');
  const [appState, setAppState] = useState<AppState>('normal');
  const [showVictoryBanner, setShowVictoryBanner] = useState(true);
  const [showError, setShowError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant' as const,
      title: 'Bienvenida',
      content: 'Hola, soy tu asistente conversacional. Â¿En quÃ© puedo ayudarte hoy?',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'user' as const,
      content: 'Necesito revisar mis tareas pendientes para hoy',
      timestamp: new Date()
    },
    {
      id: 3,
      type: 'assistant' as const,
      title: 'Resumen de hoy',
      content: 'Perfecto, te muestro un resumen de tus tareas pendientes para el dÃ­a de hoy. Tienes 3 tareas importantes y 2 reuniones programadas.',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = (message: string) => {
    if (appState === 'loading') return;
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
    setAppState('loading');
    
    // Simular respuesta del asistente
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant' as const,
        title: 'Respuesta',
        content: 'He procesado tu mensaje. Â¿Hay algo mÃ¡s en lo que pueda ayudarte?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setAppState('normal');
    }, 2000);
  };

  const handleStateChange = (state: AppState) => {
    setAppState(state);
    if (state === 'empty') {
      setMessages([]);
    } else if (state === 'error') {
      setShowError(true);
    }
  };

  const renderContent = () => {
    if (appState === 'empty') {
      return <EmptyState />;
    }
    
    if (appState === 'loading' && messages.length === 0) {
      return <LoadingState />;
    }
    
    return <ChatPanel messages={messages} isLoading={appState === 'loading'} />;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-cyan-50 font-['Inter'] text-slate-800 flex overflow-hidden relative">
      {/* Banner de error */}
      {showError && (
        <ErrorBanner onClose={() => setShowError(false)} />
      )}
      
      {/* Banner de Primera Victoria */}
      {showVictoryBanner && (
        <VictoryBanner 
          onAccept={() => {
            setActiveCategory('URGENTES');
            setShowVictoryBanner(false);
          }}
          onDismiss={() => setShowVictoryBanner(false)} 
        />
      )}
      
      {/* Sidebar izquierda */}
      <Sidebar 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onStateChange={handleStateChange}
      />
      
      {/* Panel central */}
      <div className="flex-1 flex flex-col">
        {renderContent()}
        <BottomBar onSendMessage={handleSendMessage} />
      </div>
      
      {/* BotÃ³n Stop Audio flotante */}
      <FloatingStopButton 
        isRecording={isRecording}
        onToggle={() => setIsRecording(!isRecording)}
      />
    </div>
  );
}



