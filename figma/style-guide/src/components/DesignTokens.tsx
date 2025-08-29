import { useState } from 'react';

interface TokenDisplayProps {
  title: string;
  tokens: Array<{
    name: string;
    value: string;
    description?: string;
    preview?: React.ReactNode;
  }>;
}

export function DesignTokens({ title, tokens }: TokenDisplayProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToken = async (value: string, name: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedToken(name);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 
        className="text-gray-900 mb-4"
        style={{ 
          fontFamily: '"IBM Plex Sans", sans-serif', 
          fontSize: '18px', 
          fontWeight: '600' 
        }}
      >
        {title}
      </h3>
      <div className="space-y-3">
        {tokens.map((token, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => copyToken(token.value, token.name)}
          >
            <div className="flex items-center gap-3">
              {token.preview && (
                <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center">
                  {token.preview}
                </div>
              )}
              <div>
                <div 
                  className="font-medium text-gray-900"
                  style={{ fontFamily: 'Inter', fontSize: '14px' }}
                >
                  {token.name}
                </div>
                {token.description && (
                  <div 
                    className="text-gray-500"
                    style={{ fontFamily: 'Inter', fontSize: '12px' }}
                  >
                    {token.description}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code 
                className="bg-white px-2 py-1 rounded border text-gray-700 font-mono"
                style={{ fontSize: '12px' }}
              >
                {token.value}
              </code>
              {copiedToken === token.name ? (
                <span className="text-green-600 text-xs font-medium">✓</span>
              ) : (
                <span className="text-gray-400 text-xs">📋</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}