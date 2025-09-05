import { Square } from 'lucide-react';

interface FloatingStopButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export function FloatingStopButton({ isRecording, onToggle }: FloatingStopButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onToggle}
        className={`relative p-4 rounded-full transition-all duration-150 transform hover:scale-110 ${
          isRecording
            ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-2xl'
            : 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-xl hover:shadow-2xl'
        } font-['IBM_Plex_Sans']`}
        style={{
          boxShadow: isRecording 
            ? '0 8px 32px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
            : '0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
        }}
      >
        {/* Contenido del botÃ³n */}
        <div className="flex items-center space-x-2 text-white relative z-10">
          <Square className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-semibold hidden sm:inline">Stop Audio</span>
        </div>
        
        {/* Aro animado cuando estÃ¡ grabando */}
        {isRecording && (
          <>
            {/* Aro principal */}
            <div className="absolute inset-0 rounded-full border-2 border-red-400/60"
                 style={{
                   animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                 }}></div>
            
            {/* Aro exterior que se expande */}
            <div className="absolute inset-0 rounded-full border border-red-300/40"
                 style={{
                   transform: 'scale(1.2)',
                   animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite'
                 }}></div>
            
            {/* Glow exterior */}
            <div className="absolute inset-0 rounded-full bg-red-500/30 blur-lg animate-pulse"></div>
          </>
        )}
        
        {/* Highlight interior futurista */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
      </button>
    </div>
  );
}



