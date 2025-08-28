import * as React from "react";

export type ChatRole = "user" | "assistant" | "system";

export type MessageBubbleProps = {
  role: ChatRole;
  content: string;
  timestamp?: string;
};

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const align = isUser ? "justify-end" : "justify-start";

  const bubbleBase =
    "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed break-words";
  const bubbleTone = isUser
    ? "bg-[--primary] text-[--primary-fg]"
    : isAssistant
    ? "bg-[--card] text-[--fg] border border-[--border]"
    : "bg-[--bg-muted] text-[--fg] border border-[--border]";

  return (
    <div className={`w-full flex ${align}`}>
      <div
        className={`${bubbleBase} ${bubbleTone}`}
        role="group"
        aria-label={isUser ? "Mensaje de usuario" : isAssistant ? "Mensaje del asistente" : "Mensaje del sistema"}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <span className="mt-1 block text-[11px] opacity-70">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
