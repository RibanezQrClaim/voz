import { useEffect, useRef } from 'react';
import { NxButton } from '@nexusg/ui';

export default function ErrorBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const onRetry = () => {
    console.log('retry');
  };

  return (
    <div className="sticky top-0 z-10 mb-4">
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        tabIndex={-1}
        className="bg-surface backdrop-blur-[14px] rounded-2xl shadow-glass border border-white/40 px-4 py-3 flex items-center justify-between gap-3"
      >
        <span>Ocurrió un error.</span>
        <NxButton onClick={onRetry}>Reintentar</NxButton>
      </div>
    </div>
  );
}
