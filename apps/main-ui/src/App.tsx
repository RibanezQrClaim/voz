// apps/main-ui/src/App.tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-text">
      <div className="mx-4 w-full max-w-xl">
        <div className="bg-surface backdrop-blur-[14px] rounded-2xl shadow-glass border border-white/40 p-6">
          <h1 className="text-2xl font-semibold mb-2">NexusG UI — Smoke</h1>
          <p className="mb-4">Glassmorphism + tokens funcionando.</p>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-primary text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/60"
            >
              Botón primario
            </button>
            <button
              className="px-4 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40"
            >
              Botón secundario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
