import React from "react";
import { useUI } from "../store/ui";
import { Button } from "../ui/Button";

function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextIsDark);
    try {
        localStorage.setItem("nexusg.v1.ui:theme", nextIsDark ? "dark" : "light");
    } catch { }
}

// restaurar tema al cargar el módulo
(function restoreTheme() {
    try {
        const saved = localStorage.getItem("nexusg.v1.ui:theme");
        if (saved === "dark") document.documentElement.classList.add("dark");
    } catch { }
})();

export function TopNav() {
    const { state, setState } = useUI();
    const setView = (v: "main" | "config") => setState((s) => ({ ...s, view: v }));

    return (
        <nav className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-zinc-900/80 dark:border-zinc-800">
            <div className="mx-auto flex max-w-5xl items-center justify-between p-3">
                <div className="text-base font-semibold tracking-tight">Voz</div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={state.view === "main" ? "primary" : "secondary"}
                        onClick={() => setView("main")}
                    >
                        Inicio
                    </Button>
                    <Button
                        size="sm"
                        variant={state.view === "config" ? "primary" : "secondary"}
                        onClick={() => setView("config")}
                    >
                        Config
                    </Button>
                    <Button size="sm" variant="ghost" onClick={toggleTheme} aria-label="Cambiar tema">
                        Tema
                    </Button>
                </div>
            </div>
        </nav>
    );
}
