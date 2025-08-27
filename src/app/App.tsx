import React from "react";
import { useUI } from "../store/ui";
import { TopNav } from "./TopNav";
import { MainView } from "../main/MainView";
import { ConfigPage } from "../settings/ConfigPage";

export function App() {
  const { state: ui } = useUI();

  // Vista: 'config' o 'main' (no hay wizard)
  const body = ui.view === "config" ? <ConfigPage /> : <MainView />;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="mx-auto w-full max-w-5xl p-4">
        {body}
      </div>
    </div>
  );
}
