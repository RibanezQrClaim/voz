import { AlertTriangle, X } from 'lucide-react';

interface ErrorBannerProps {
  onClose: () => void;
}

export function ErrorBanner({ onClose }: ErrorBannerProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
      <div className="bg-red-50/95 backdrop-blur-md border border-red-200 rounded-2xl p-4 shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-800 font-['IBM_Plex_Sans']">
              Error de conexiÃ³n
            </h3>
            <p className="text-sm text-red-700 font-['Inter'] mt-1">
              No se pudo conectar con el servidor. Verifica tu conexiÃ³n a internet.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}



