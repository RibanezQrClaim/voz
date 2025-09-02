import { Bot, Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Skeleton de mensaje del asistente */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-lg transition-transform duration-150 hover:scale-105">
            <Bot className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div className="flex-1 max-w-2xl">
            <div className="rounded-2xl p-4 bg-white/60 backdrop-blur-[18px] border border-cyan-200/50 shadow-2xl"
                 style={{
                   boxShadow: '0 0 30px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                 }}>
              <div className="space-y-3">
                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton de mensaje del usuario */}
        <div className="flex items-start space-x-4 flex-row-reverse space-x-reverse">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-slate-200 to-cyan-100 border border-cyan-200 shadow-lg"></div>
          <div className="flex-1 max-w-2xl flex justify-end">
            <div className="rounded-2xl p-4 bg-gradient-to-r from-slate-100 to-cyan-50 border border-cyan-200 shadow-lg">
              <div className="space-y-3">
                <div className="h-3 bg-gradient-to-r from-slate-300 to-cyan-200 rounded-full animate-pulse w-32"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de carga activo */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-lg">
            <Bot className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div className="flex-1 max-w-2xl">
            <div className="rounded-2xl p-4 bg-white/60 backdrop-blur-[18px] border border-cyan-200/50 shadow-2xl"
                 style={{
                   boxShadow: '0 0 30px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                 }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-100 shadow-sm"
                     style={{
                       boxShadow: '0 0 8px rgba(34, 211, 238, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                     }}>
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 font-['IBM_Plex_Sans'] font-semibold" style={{ color: '#1E3A8A' }}>
                      Procesando tu solicitud
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-sm"></div>
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Indicador dinámico adicional */}
        <div className="flex justify-center">
          <div className="flex space-x-3 py-4">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg"
                 style={{
                   animation: 'pulse 1.5s ease-in-out infinite',
                   boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)'
                 }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg"
                 style={{
                   animation: 'pulse 1.5s ease-in-out infinite',
                   animationDelay: '0.3s',
                   boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)'
                 }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg"
                 style={{
                   animation: 'pulse 1.5s ease-in-out infinite',
                   animationDelay: '0.6s',
                   boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)'
                 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
