// apps/main-ui/src/lib/agent.ts
const BASE =
  (import.meta.env.VITE_AGENT_URL as string | undefined)?.replace(/\/$/, '') || '';

type ChatResponse = { reply?: string; message?: string };

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

// Ajusta la ruta si tu backend usa otra (ej: /api/agent/chat)
export async function sendMessage(text: string): Promise<string> {
  const data = await postJSON<ChatResponse>('/api/chat', { message: text });
  return data.reply ?? data.message ?? '';
}



