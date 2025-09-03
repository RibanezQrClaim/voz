// src/app/TopNav.tsx
import * as React from "react";
import { useUI } from "../store/ui";

export default function TopNav() {
    const { view, toggleView } = useUI();

    return (
        <header className="sticky top-0 z-40 bg-[--bg] border-b border-[--border]">
            <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-between">
                <div className="font-semibold">voz_agente_gmail</div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[--fg-muted] hidden sm:inline">
                        {view === "config" ? "ConfiguraciÃ³n" : "Principal"}
                    </span>
                    <button
                        className="h-9 px-3 rounded-xl border border-[--border] bg-[--bg-muted] hover:bg-[--card] focus:outline-none focus:ring-2 ring-[--ring]"
                        onClick={toggleView}
                        aria-label="Cambiar vista"
                    >
                        {view === "config" ? "Ir a Main" : "Ir a Config"}
                    </button>
                </div>
            </div>
        </header>
    );
}



