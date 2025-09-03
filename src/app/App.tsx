import * as React from "react";
import TopNav from "./TopNav";
import { useUI } from "../store/ui";
import { ConfigPage } from "../settings/ConfigPage";
import { ChatContainer } from "./ChatContainer"; // â¬…ï¸ usa Chat en vez de Main

export default function App() {
  const { view } = useUI();
  return (
    <div className="min-h-screen bg-[--bg] text-[--fg]">
      <TopNav />
      {view === "config" ? <ConfigPage /> : <ChatContainer />}
    </div>
  );
}



