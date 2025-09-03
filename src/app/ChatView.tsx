import * as React from "react";
import { MessageBubble, ChatRole } from "../ui/MessageBubble";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp?: string;
};

export type ChatViewProps = {
  title?: string;
  messages: ChatMessage[];
  busy: boolean;
  onSend: (text: string) => void;
  onClear?: () => void;
};

export function ChatView({
  title = "Chat",
  messages,
  busy,
  onSend,
  onClear,
}: ChatViewProps) {
  const [text, setText] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const value = text.trim();
      if (!value) return;
      onSend(value);
      setText("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-3rem)] flex flex-col gap-3">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[--bg] border-b border-[--border] py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {onClear && (
              <button
                className="h-9 px-3 rounded-xl border border-[--border] bg-[--bg-muted] hover:bg-[--card] focus:outline-none focus:ring-2 ring-[--ring]"
                onClick={onClear}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de mensajes */}
      <div
        ref={listRef}
        className="flex-1 overflow-auto space-y-3 pr-1"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="text-center text-[--fg-muted] mt-12">
            Escribe tu primera preguntaâ€¦
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
              timestamp={m.timestamp}
            />
          ))
        )}

        {busy && (
          <div className="w-full flex justify-start">
            <div className="bg-[--card] border border-[--border] rounded-2xl px-4 py-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[--fg-muted] animate-bounce mr-1" />
              <span
                className="inline-block w-2 h-2 rounded-full bg-[--fg-muted] animate-bounce mr-1"
                style={{ animationDelay: "120ms" }}
              />
              <span
                className="inline-block w-2 h-2 rounded-full bg-[--fg-muted] animate-bounce"
                style={{ animationDelay: "240ms" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-[--border] pt-3">
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 min-h-[46px] max-h-40 rounded-xl border border-[--border] bg-[--card] text-[--fg] placeholder-[--fg-muted] p-3 focus:outline-none focus:ring-2 ring-[--ring]"
            placeholder="Escribe un mensajeâ€¦ (Enter para enviar, Shift+Enter salto de lÃ­nea)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            type="submit"
            className="h-[46px] px-4 rounded-xl bg-[--primary] text-[--primary-fg] hover:opacity-90 focus:outline-none focus:ring-2 ring-[--ring] disabled:opacity-50"
            disabled={busy}
            aria-label="Enviar"
            title="Enviar"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}



