import { useEffect, useRef } from 'react';

interface Props {
  onClose: () => void;
}

export default function SummaryTodayPanel({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const detailRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === closeRef.current) {
          e.preventDefault();
          detailRef.current?.focus();
        }
      } else {
        if (document.activeElement === detailRef.current) {
          e.preventDefault();
          closeRef.current?.focus();
        }
      }
    }
  };

  const today = new Date().toLocaleDateString();

  const items = [
    { time: '09:00', subject: 'Reunión con equipo' },
    { time: '11:30', subject: 'Llamada a proveedor' },
    { time: '14:00', subject: 'Evento del día' },
  ];

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/20"
      role="dialog"
      aria-modal="true"
      aria-label="Resumen de hoy"
      onKeyDown={onKeyDown}
    >
      <div className="bg-surface backdrop-blur-[14px] rounded-2xl shadow-glass border border-white/40 p-4 w-full max-w-md">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-semibold text-lg">Resumen de hoy — {today}</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Cerrar"
            className="px-2 py-1 rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="px-2 py-1 rounded-xl bg-primary/10 text-primary text-sm">Nuevos: 12</span>
          <span className="px-2 py-1 rounded-xl bg-primary text-white text-sm">Urgentes: 3</span>
          <span className="px-2 py-1 rounded-xl bg-primary/10 text-primary text-sm">Eventos: 2</span>
        </div>

        <ul className="text-sm space-y-2 mb-4">
          {items.map((item, idx) => (
            <li key={idx}>
              {item.time} — {item.subject}
            </li>
          ))}
        </ul>

        <button
          ref={detailRef}
          onClick={() => console.log('cta:open-summary-detail')}
          className="px-3 py-2 rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40"
        >
          Abrir en detalle
        </button>
      </div>
    </div>
  );
}

