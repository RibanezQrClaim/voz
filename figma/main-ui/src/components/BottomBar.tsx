import { useState } from 'react';
import { Mic, Send, Calendar, AlertTriangle, Users, CheckSquare, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface BottomBarProps {
  onSendMessage: (message: string) => void;
}

export function BottomBar({ onSendMessage }: BottomBarProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const shortcuts = [
    { id: 'HOY', label: 'HOY', icon: Calendar, gradient: 'from-cyan-500 via-cyan-600 to-blue-600', glow: 'hover:shadow-cyan-400/50' },
    { 
      id: 'URGENTE', 
      label: 'URGENTE', 
      icon: AlertTriangle, 
      gradient: 'from-red-500 via-red-600 to-orange-600',
      glow: 'hover:shadow-red-400/50',
      hasInfo: true
    },
    { id: 'PERSONAS', label: 'PERSONAS', icon: Users, gradient: 'from-purple-500 via-purple-600 to-pink-600', glow: 'hover:shadow-purple-400/50' },
    { id: 'TAREAS', label: 'TAREAS', icon: CheckSquare, gradient: 'from-green-500 via-green-600 to-teal-600', glow: 'hover:shadow-green-400/50' }
  ];

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      {/* Sombra difusa para efecto flotante */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-200/30 to-transparent blur-xl"></div>
      
      <div className="relative bg-white/95 backdrop-blur-2xl border-t border-white/60 p-6 space-y-4 font-['IBM_Plex_Sans']"
           style={{
             boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
           }}>
        {/* Atajos rápidos */}
        <div className="flex items-center justify-center space-x-3">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            
            const button = (
              <button
                key={shortcut.id}
                className={`px-5 py-3 rounded-2xl bg-gradient-to-r ${shortcut.gradient} text-white font-semibold shadow-lg ${shortcut.glow} hover:shadow-2xl transform hover:scale-105 transition-all duration-150 flex items-center space-x-2 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-150`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{shortcut.label}</span>
                {shortcut.hasInfo && (
                  <Info className="w-3 h-3 ml-1 opacity-90" />
                )}
              </button>
            );

            if (shortcut.hasInfo) {
              return (
                <Popover key={shortcut.id}>
                  <PopoverTrigger asChild>
                    {button}
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-2xl rounded-2xl">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-800 font-['IBM_Plex_Sans']">¿Por qué?</h4>
                      <p className="text-sm text-slate-600 font-['Inter']">
                        Los elementos marcados como urgentes requieren atención inmediata y pueden afectar objetivos críticos o fechas límite importantes.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            return button;
          })}
        </div>

        {/* Campo de entrada */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-2"
               style={{
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
               }}>
            <div className="flex-1 flex items-center space-x-3 px-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 bg-transparent border-none outline-none resize-none font-['Inter'] text-slate-800 placeholder-slate-500 transition-all duration-150"
                rows={1}
                style={{ maxHeight: '120px', minHeight: '24px' }}
              />
              
              {/* Botón de micrófono */}
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 rounded-2xl transition-all duration-150 relative overflow-hidden ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg hover:shadow-red-400/50 animate-pulse'
                    : 'bg-gradient-to-r from-slate-400 to-cyan-400 hover:from-slate-500 hover:to-cyan-500 shadow-lg hover:shadow-cyan-400/50'
                } hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-150`}
              >
                <Mic className="w-5 h-5 text-white relative z-10" />
              </button>
            </div>

            {/* Botón de envío */}
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`p-3 rounded-2xl transition-all duration-150 relative overflow-hidden ${
                message.trim()
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-cyan-400/50 hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-150'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5 text-white relative z-10" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}