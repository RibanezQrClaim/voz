import { Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  title?: string;
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatPanel({ messages, isLoading }: ChatPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-4 ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 ${
              message.type === 'user'
                ? 'bg-gradient-to-r from-slate-200 to-cyan-100 border border-cyan-200 shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-lg hover:shadow-xl hover:scale-105'
            }`}>
              {message.type === 'user' ? (
                <User className="w-5 h-5 text-cyan-700" />
              ) : (
                <Bot className="w-5 h-5 text-slate-600" />
              )}
            </div>

            {/* Mensaje */}
            <div className={`flex-1 max-w-2xl ${message.type === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`rounded-2xl p-4 transition-all duration-150 hover:scale-[1.02] ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-slate-100 to-cyan-50 border border-cyan-200 text-slate-800 shadow-lg hover:shadow-xl'
                    : 'bg-white/60 backdrop-blur-[18px] border border-cyan-200/50 text-slate-700 shadow-2xl hover:shadow-3xl relative before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-cyan-400/20 before:to-blue-400/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-150 before:-z-10'
                } font-['Inter']`}
                style={{
                  boxShadow: message.type === 'assistant' 
                    ? '0 0 30px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)' 
                    : undefined
                }}
              >
                {/* Mini-tÃ­tulo para respuestas del asistente */}
                {message.type === 'assistant' && message.title && (
                  <div className="mb-3 pb-2 border-b border-slate-200/40">
                    <h4 className="text-sm font-semibold font-['IBM_Plex_Sans']" style={{ color: '#1E3A8A' }}>
                      {message.title}
                    </h4>
                  </div>
                )}
                
                <p className="leading-relaxed">{message.content}</p>
                
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/30">
                  <span className="text-xs text-slate-500 font-['IBM_Plex_Sans']">
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Indicador de carga */}
        {isLoading && (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-lg">
              <Bot className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="rounded-2xl p-4 bg-white/60 backdrop-blur-[18px] border border-cyan-200/50 shadow-2xl relative"
                   style={{
                     boxShadow: '0 0 30px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                   }}>
                <div className="flex items-center space-x-3 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                  <span className="text-sm text-slate-600 font-['IBM_Plex_Sans'] font-medium">Procesando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Indicador dinÃ¡mico cuando el asistente estÃ¡ respondiendo */}
        {isLoading && (
          <div className="flex justify-center">
            <div className="flex space-x-2 py-2">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



