export function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-6 py-3 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284C7] transition-colors font-medium">
      {children}
    </button>
  );
}

export function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-6 py-3 bg-[#E2E8F0] text-[#475569] rounded-lg hover:bg-[#CBD5E1] transition-colors font-medium">
      {children}
    </button>
  );
}

export function UrgentChip() {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EF4444] text-white">
      URGENTE
    </span>
  );
}

export function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-xs ml-auto bg-[#F3F4F6] text-[#1E293B] p-3 rounded-2xl rounded-br-md">
      <div className="text-sm" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
        {children}
      </div>
    </div>
  );
}

export function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="max-w-xs mr-auto p-3 rounded-2xl rounded-bl-md border border-white/20"
      style={{ 
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="text-sm text-[#1E293B]" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
        {children}
      </div>
    </div>
  );
}