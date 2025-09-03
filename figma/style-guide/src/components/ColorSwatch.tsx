import { useState } from 'react';

interface ColorSwatchProps {
  color: string;
  label: string;
  textColor?: string;
}

export function ColorSwatch({ color, label, textColor = "#000000" }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="flex flex-col gap-3 group">
      <div 
        className="w-32 h-24 rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-transform hover:scale-105 relative overflow-hidden"
        style={{ backgroundColor: color }}
        onClick={copyToClipboard}
      >
        {copied && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-medium">âœ“ Copiado</span>
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 flex items-center justify-center">
          <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
            Click para copiar
          </span>
        </div>
      </div>
      <div className="text-center">
        <div 
          className="font-medium mb-1"
          style={{ 
            color: textColor,
            fontFamily: 'Inter',
            fontSize: '13px'
          }}
        >
          {label}
        </div>
        <div 
          className="text-gray-500 font-mono cursor-pointer hover:text-gray-700 transition-colors"
          style={{ fontSize: '11px' }}
          onClick={copyToClipboard}
        >
          {color}
        </div>
      </div>
    </div>
  );
}



