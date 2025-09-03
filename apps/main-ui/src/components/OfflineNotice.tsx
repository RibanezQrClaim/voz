export default function OfflineNotice() {
  return (
    <div className="sticky top-0 z-10 mb-4">
      <div
        role="status"
        aria-live="polite"
        className="bg-surface backdrop-blur-[14px] rounded-2xl shadow-glass border border-white/40 px-4 py-3 text-sm"
      >
        EstÃ¡s sin conexiÃ³n.
      </div>
    </div>
  );
}



