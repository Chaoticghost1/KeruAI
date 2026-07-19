// client/src/components/mobile/AIBuddyChat.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIBuddyChat, type ChatMessage } from "./AIBuddyChat";

const baseMsgs: ChatMessage[] = [
  { id: "1", role: "user", text: "¿Qué es una fracción?", createdAt: 1 },
  {
    id: "2",
    role: "assistant",
    text: "Una fracción representa una parte de un todo.",
    citations: [{ id: "c1", label: "Slide 5", href: "#slide-5" }],
    createdAt: 2,
  },
];

describe("AIBuddyChat (mobile)", () => {
  it("renders the message log with aria-live and citation badge", () => {
    render(<AIBuddyChat messages={baseMsgs} onSend={vi.fn()} />);
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(screen.getByLabelText(/fuente: slide 5/i)).toBeInTheDocument();
  });

  it("shows a skeleton while a message is streaming", () => {
    const streaming: ChatMessage[] = [
      ...baseMsgs,
      { id: "3", role: "assistant", text: "", streaming: true, createdAt: 3 },
    ];
    render(<AIBuddyChat messages={streaming} onSend={vi.fn()} isStreaming />);
    expect(screen.getByText(/está escribiendo/i)).toBeInTheDocument();
  });

  it("sends a message on Enter and clears the composer", () => {
    const onSend = vi.fn();
    render(<AIBuddyChat messages={baseMsgs} onSend={onSend} />);
    const composer = screen.getByLabelText(/escribe tu mensaje/i) as HTMLTextAreaElement;
    fireEvent.change(composer, { target: { value: "Dame un ejemplo" } });
    fireEvent.keyDown(composer, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("Dame un ejemplo");
    expect(composer.value).toBe("");
  });

  it("disables the composer while offline", () => {
    const onSend = vi.fn();
    render(<AIBuddyChat messages={baseMsgs} onSend={onSend} offline queuedCount={2} />);
    const composer = screen.getByLabelText(/escribe tu mensaje/i) as HTMLTextAreaElement;
    expect(composer.disabled).toBe(true);
    expect(screen.getByText(/2 mensaje\(s\) en cola/i)).toBeInTheDocument();
  });

  it("flags an assistant message via the report button", () => {
    const onFlag = vi.fn();
    render(<AIBuddyChat messages={baseMsgs} onSend={vi.fn()} onFlag={onFlag} />);
    fireEvent.click(screen.getByLabelText(/reportar esta respuesta/i));
    expect(onFlag).toHaveBeenCalledWith("2");
  });

  it("exposes a Simplify affordance for assistant messages", () => {
    const onSimplify = vi.fn();
    render(<AIBuddyChat messages={baseMsgs} onSend={vi.fn()} onSimplify={onSimplify} />);
    fireEvent.click(screen.getByRole("button", { name: /simplificar/i }));
    expect(onSimplify).toHaveBeenCalledWith("2");
  });
});
