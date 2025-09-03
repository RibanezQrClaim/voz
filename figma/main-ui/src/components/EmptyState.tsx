import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        {/* Icono principal */}
        <div className="relative group">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-cyan-100/80 to-slate-100/80 rounded-3xl flex items-center justify-center border border-cyan-200/60 shadow-2xl backdrop-blur-sm transition-transform duration-150 group-hover:scale-105"
               style={{
                 boxShadow: '0 0 30px rgba(34, 211, 238, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
               }}>
            <MessageSquare className="w-10 h-10 text-cyan-600" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg transition-transform duration-150 group-hover:scale-110"
               style={{
                 boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
               }}>
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          
          {/* Halo sutil */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/20 to-blue-400/20 -z-10 blur-xl group-hover:blur-lg transition-all duration-150"></div>
        </div>
        
        {/* TÃ­tulo y descripciÃ³n */}
        <div className="space-y-3">
          <h2 className="text-xl font-medium text-slate-800 font-['IBM_Plex_Sans'] bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Â¡Comencemos a conversar!
          </h2>
          <p className="text-slate-600 font-['Inter'] leading-relaxed">
            Tu asistente estÃ¡ listo para ayudarte. Escribe un mensaje o usa uno de los atajos rÃ¡pidos para comenzar.
          </p>
        </div>
        
        {/* Sugerencias */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700 font-['IBM_Plex_Sans'] bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
            Prueba preguntando:
          </p>
          <div className="space-y-2">
            {['Â¿QuÃ© tengo programado para hoy?', 'Â¿CuÃ¡les son mis tareas urgentes?', 'MuÃ©strame mis clientes recientes'].map((suggestion, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:bg-white/90 transition-all duration-150 cursor-pointer group hover:scale-105 hover:shadow-lg"
                style={{
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              >
                <span className="text-sm text-slate-600 font-['Inter'] flex-1">
                  {suggestion}
                </span>
                <div className="p-1 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 group-hover:from-cyan-200 group-hover:to-cyan-300 transition-all duration-150"
                     style={{
                       boxShadow: '1px 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                     }}>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-600 transition-colors duration-150" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



