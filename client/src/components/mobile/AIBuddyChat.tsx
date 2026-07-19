// client/src/components/mobile/AIBuddyChat.tsx
// Canonical AI buddy chat:
//  - scrollable message list (ARIA log)
//  - composer that stays above keyboard (useKeyboardSafeView)
//  - streaming response handling (incremental token append + skeleton)
//  - inline citation badges linking to slide/page
//  - optimistic user message + flagging (long-press / button)
//  - offline queue: messages sent while offline are queued and flushed on reconnect
//
// Accessibility: role="log" aria-live="polite" for assistant; composer labeled;
// citation links keyboard reachable; focus moves to new assistant message.

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STYLE_TOKENS } from "./tokens";
import { useKeyboardSafeView } from "./useKeyboardSafeView";
import { Flag, Send, Link2, AlertTriangle } from "lucide-react";

export interface Citation {
  id: string;
  label: string; // e.g. "Slide 5"
  href: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
  citations?: Citation[];
  flagged?: boolean;
  pending?: boolean; // optimistic / queued-offline
  createdAt: number;
}

export interface AIBuddyChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onFlag?: (id: string) => void;
  onCitationClick?: (citation: Citation) => void;
  /** When true, composer is disabled and a banner shows queued state. */
  offline?: boolean;
  queuedCount?: number;
  isStreaming?: boolean;
  className?: string;
  /** "Simplify" / "Explain step" affordance callback. */
  onSimplify?: (messageId: string) => void;
}

function CitationBadge({
  citation,
  onClick,
}: {
  citation: Citation;
  onClick?: (c: Citation) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(citation)}
      className="mx-0.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 align-middle text-xs font-medium text-primary hover:bg-primary/20"
      aria-label={`Fuente: ${citation.label}`}
    >
      <Link2 className="h-3 w-3" aria-hidden /> {citation.label}
    </button>
  );
}

function MessageBubble({
  msg,
  onFlag,
  onCitationClick,
  onSimplify,
}: {
  msg: ChatMessage;
  onFlag?: (id: string) => void;
  onCitationClick?: (c: Citation) => void;
  onSimplify?: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isUser = msg.role === "user";

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      // long-press opens context menu (flag/simplify)
      onContextMenu={(e) => {
        if (!isUser) {
          e.preventDefault();
          setMenuOpen(true);
        }
      }}
    >
      <div
        className={cn(
          "relative max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[75%]",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground",
          msg.pending && "opacity-60",
        )}
      >
        {msg.streaming ? (
          <span className="flex items-center gap-2">
            <span className={STYLE_TOKENS.skeleton + " h-3 w-24"} aria-hidden />
            <span className="sr-only">El asistente está escribiendo…</span>
          </span>
        ) : (
          <span className="whitespace-pre-wrap break-words">
            {msg.text}
            {msg.citations?.map((c) => (
              <CitationBadge key={c.id} citation={c} onClick={onCitationClick} />
            ))}
          </span>
        )}

        {/* micro-affordances for assistant messages */}
        {!isUser && !msg.streaming && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {onSimplify && (
              <button
                type="button"
                className="rounded px-1 py-0.5 hover:bg-background"
                onClick={() => onSimplify(msg.id)}
              >
                Simplificar
              </button>
            )}
            <button
              type="button"
              aria-label="Reportar esta respuesta"
              className="rounded px-1 py-0.5 hover:bg-background"
              onClick={() => onFlag?.(msg.id)}
            >
              <Flag className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        )}

        {msg.flagged && (
          <span className="mt-1 flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" aria-hidden /> Reportado
          </span>
        )}
      </div>

      {/* long-press context menu */}
      {menuOpen && !isUser && (
        <div
          className="absolute bottom-2 left-2 z-20 flex flex-col rounded-lg border border-border bg-popover p-1 text-sm shadow-lg"
          role="menu"
        >
          {onSimplify && (
            <button
              type="button"
              role="menuitem"
              className="rounded px-3 py-2 text-left hover:bg-accent"
              onClick={() => {
                onSimplify(msg.id);
                setMenuOpen(false);
              }}
            >
              Simplificar / Explicar paso
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="rounded px-3 py-2 text-left hover:bg-accent"
            onClick={() => {
              onFlag?.(msg.id);
              setMenuOpen(false);
            }}
          >
            Reportar
          </button>
        </div>
      )}
    </div>
  );
}

export function AIBuddyChat({
  messages,
  onSend,
  onFlag,
  onCitationClick,
  offline = false,
  queuedCount = 0,
  isStreaming = false,
  className,
  onSimplify,
}: AIBuddyChatProps) {
  const kb = useKeyboardSafeView();
  const [draft, setDraft] = React.useState("");
  const logRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  // auto-scroll to newest
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || offline) return;
    onSend(text);
    setDraft("");
  }

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      {offline && (
        <div className="bg-youth-muted px-3 py-1.5 text-center text-xs text-muted-foreground" role="status">
          Sin conexión · {queuedCount > 0 ? `${queuedCount} mensaje(s) en cola` : "se enviará al reconectar"}
        </div>
      )}

      {/* message list */}
      <div
        ref={logRef}
        className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
        role="log"
        aria-live="polite"
        aria-label="Conversación con el asistente"
      >
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            onFlag={onFlag}
            onCitationClick={onCitationClick}
            onSimplify={onSimplify}
          />
        ))}
        <div ref={endRef} />
      </div>

      {/* composer — anchored above keyboard */}
      <form
        onSubmit={submit}
        className={cn(
          "border-t border-border bg-background p-2",
          STYLE_TOKENS.composerSafe,
          kb.isKeyboardOpen && "absolute inset-x-0 bottom-0",
        )}
        style={kb.isKeyboardOpen ? kb.style : undefined}
        aria-label="Enviar mensaje al asistente"
      >
        <div className="flex items-end gap-2">
          <label htmlFor="ai-composer" className="sr-only">
            Escribe tu mensaje
          </label>
          <textarea
            id="ai-composer"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e as unknown as React.FormEvent);
              }
            }}
            rows={1}
            placeholder={offline ? "Sin conexión… se enviará luego" : "Pregúntale a tu Buddy…"}
            className="min-h-[44px] max-h-28 flex-1 resize-none rounded-full border border-input bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={offline}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full"
            disabled={offline || !draft.trim()}
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        {isStreaming && (
          <p className="px-1 pt-1 text-xs text-muted-foreground">Escribiendo…</p>
        )}
      </form>
    </div>
  );
}

export default AIBuddyChat;
