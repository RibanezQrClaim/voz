import { MessageSquare, Calendar, Users, CheckSquare, AlertTriangle, Plus, Settings } from 'lucide-react';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onStateChange: (state: 'normal' | 'empty' | 'loading' | 'error') => void;
}

export function Sidebar({ activeCategory, onCategoryChange, onStateChange }: SidebarProps) {
  const categories = [
    { id: 'HOY', label: 'HOY', icon: Calendar, count: 5 },
    { id: 'CLIENTES', label: 'CLIENTES', icon: Users, count: 3 },
    { id: 'TAREAS', label: 'TAREAS', icon: CheckSquare, count: 8 },
    { id: 'URGENTES', label: 'URGENTES', icon: AlertTriangle, count: 2 }
  ];

  const conversations = [
    { id: 1, title: 'Reunión con cliente', time: '10:30', category: 'CLIENTES' },
    { id: 2, title: 'Revisión de proyecto', time: '14:00', category: 'TAREAS' },
    { id: 3, title: 'Llamada urgente', time: '16:15', category: 'URGENTES' },
    { id: 4, title: 'Planning semanal', time: '09:00', category: 'HOY' },
    { id: 5, title: 'Seguimiento ventas', time: '15:30', category: 'CLIENTES' }
  ];

  return (
    <div className="w-80 bg-white/80 backdrop-blur-2xl border-r border-white/60 flex flex-col font-['IBM_Plex_Sans'] relative"
         style={{
           boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.6), 4px 0 24px rgba(0, 0, 0, 0.06)'
         }}>
      {/* Header */}
      <div className="p-6 border-b border-white/60">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-medium text-slate-900 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Asistente
          </h1>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-white/60 rounded-xl transition-all duration-150 hover:scale-105 group"
                    style={{
                      background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
                      boxShadow: '2px 2px 4px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.8)'
                    }}>
              <Plus className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors duration-150" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => onStateChange('empty')}
              className="p-2 hover:bg-white/60 rounded-xl transition-all duration-150 hover:scale-105 group"
              title="Debug: Cambiar estado"
              style={{
                background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.8)'
              }}>
              <Settings className="w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-colors duration-150" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        
        {/* Categorías */}
        <div className="space-y-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 relative group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-50/80 to-blue-50/80 border-2 border-cyan-200/60 shadow-lg transform scale-[1.02]' 
                    : 'hover:bg-white/60 hover:scale-105'
                }`}
                style={isActive ? {
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                } : {
                  background: 'linear-gradient(145deg, rgba(248,250,252,0.8), rgba(226,232,240,0.6))',
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.06), inset 1px 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl transition-all duration-150 ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-100 to-blue-100 shadow-md' 
                      : 'bg-gradient-to-r from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300'
                  }`}
                       style={{
                         boxShadow: isActive 
                           ? '0 0 12px rgba(34, 211, 238, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                           : '1px 1px 3px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                       }}>
                    <Icon className={`w-4 h-4 transition-colors duration-150 ${
                      isActive ? 'text-cyan-700' : 'text-slate-600 group-hover:text-slate-800'
                    }`} strokeWidth={1.5} />
                  </div>
                  <span className={`font-medium transition-colors duration-150 ${
                    isActive ? 'text-cyan-900 font-semibold' : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {category.label}
                  </span>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-200 to-blue-200 text-cyan-900 shadow-md' 
                    : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 group-hover:from-slate-300 group-hover:to-slate-400'
                }`}
                     style={{
                       boxShadow: isActive 
                         ? '0 0 8px rgba(34, 211, 238, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                         : '1px 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                     }}>
                  {category.count}
                </span>
                
                {/* Halo celeste para activos */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-blue-400/20 -z-10 blur-sm"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-medium text-slate-600 mb-3 px-2 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
            Conversaciones recientes
          </h2>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-3 rounded-xl hover:bg-white/60 cursor-pointer transition-all duration-150 group hover:scale-105 hover:shadow-md"
                style={{
                  background: 'linear-gradient(145deg, rgba(248,250,252,0.6), rgba(226,232,240,0.4))',
                  boxShadow: '1px 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-sm"
                       style={{
                         boxShadow: '0 0 6px rgba(34, 211, 238, 0.6)'
                       }}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate group-hover:text-cyan-900 transition-colors duration-150">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-slate-500">{conversation.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Debug buttons */}
      <div className="p-4 border-t border-white/60 space-y-2">
        <div className="text-xs text-slate-500 mb-2 font-medium">Estados de prueba:</div>
        <div className="grid grid-cols-2 gap-2">
          {['normal', 'empty', 'loading', 'error'].map((state) => (
            <button 
              key={state}
              onClick={() => onStateChange(state as any)}
              className="px-2 py-1 text-xs rounded-lg transition-all duration-150 hover:scale-105 capitalize"
              style={{
                background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
                boxShadow: '1px 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
              }}
            >
              {state}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}