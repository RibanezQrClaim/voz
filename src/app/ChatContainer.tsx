import * as React from "react";
import { ChatView } from "./ChatView";
import type { ChatMessage } from "./ChatView";

const STORAGE_KEY = "chat:thread";

function loadThread(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveThread(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {}
}

// simulación de backend; reemplazar por fetch a tu API
async function respond(userText: string): Promise<string> {
  // aquí luego puedes llamar a /api/comando o lo que definas
  await new Promise((r) => setTimeout(r, 600));
  return `Entendido: "${userText}". (Simulación de respuesta)`;
}

export function ChatContainer() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => loadThread());
  const [busy, setBusy] = React.useState(false);

  const add = React.useCallback((m: ChatMessage) => {
    setMessages((prev) => {
      const next = [...prev, m];
      saveThread(next);
      return next;
    });
  }, []);

  const onSend = React.useCallback(async (text: string) => {
    const now = new Date();
    const userMsg: ChatMessage = {
      id: `u_${now.getTime()}`,
      role: "user",
      content: text,
      timestamp: now.toLocaleTimeString(),
    };
    add(userMsg);

    setBusy(true);
    try {
      const out = await respond(text);
      const bot: ChatMessage = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: out,
        timestamp: new Date().toLocaleTimeString(),
      };
      add(bot);
    } catch (e) {
      const err: ChatMessage = {
        id: `e_${Date.now()}`,
        role: "system",
        content: "Error al obtener respuesta. Intenta nuevamente.",
      };
      add(err);
    } finally {
      setBusy(false);
    }
  }, [add]);

  const onClear = React.useCallback(() => {
    setMessages([]);
    saveThread([]);
  }, []);

  return (
    <ChatView
      title="Chat"
      messages={messages}
      busy={busy}
      onSend={onSend}
      onClear={onClear}
    />
  );
}
