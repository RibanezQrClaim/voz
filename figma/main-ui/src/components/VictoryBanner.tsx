import { Trophy, Eye, X } from 'lucide-react';

interface VictoryBannerProps {
  onAccept: () => void;
  onDismiss: () => void;
}

export function VictoryBanner({ onAccept, onDismiss }: VictoryBannerProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg mx-4">
      <div className="bg-gradient-to-r from-cyan-50/95 to-blue-50/95 backdrop-blur-md border border-cyan-200 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800 font-['IBM_Plex_Sans'] mb-1">
              Primera Victoria 🎉
            </h3>
            <p className="text-sm text-slate-700 font-['Inter'] mb-4 leading-relaxed">
              ¿Ver urgentes de las últimas 24 h?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onAccept}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm font-semibold"
              >
                <Eye className="w-4 h-4" />
                <span>Ver urgentes</span>
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all duration-200 text-sm font-medium"
              >
                Después
              </button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
}