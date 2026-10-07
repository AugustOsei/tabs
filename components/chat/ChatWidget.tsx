"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { event } from "@/content/event";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = ["When and where is it?", "How much does it cost?", "Do I need to know how to code?", "What will I build?"];

const NAME = "August";
const greeting = `Hi, I'm ${NAME}. Ask me anything about ${event.name}.`;

function Avatar({ className }: { className: string }) {
  return (
    // Pixel art: keep the pixels crisp when scaled.
    // eslint-disable-next-line @next/next/no-img-element -- tiny static PNG, no optimisation needed
    <img
      src="/assets/august-avatar.png"
      alt=""
      width={192}
      height={192}
      decoding="async"
      className={`rounded-full object-cover [image-rendering:pixelated] ${className}`}
    />
  );
}

// Floating assistant, August, styled as a small browser window with an `ask-tabs` tab.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const history: Message[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const setAnswer = (content: string) => setMessages([...history, { role: "assistant", content }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setAnswer(answer);
      }
      if (!answer.trim()) throw new Error("empty answer");
    } catch {
      setAnswer(`Sorry, I could not answer that. Please message us on WhatsApp ${event.contact.whatsapp} or email ${event.contact.email}.`);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label={`Chat with ${NAME}, the TABS assistant`}
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="chat-panel flex h-[min(32rem,calc(100svh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border-2 border-gold bg-navy-800 shadow-[0_24px_70px_rgb(0_0_0/0.55)]"
        >
          <div className="flex items-end justify-between border-b-2 border-gold bg-navy pl-3 pr-2 pt-2">
            <span className="-mb-0.5 rounded-t-lg border-2 border-b-0 border-gold bg-navy-800 px-3 py-1.5 font-mono text-xs font-bold text-gold">
              ask-tabs
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close assistant"
              className="mb-1 grid size-8 place-items-center rounded-md text-mist/80 hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 border-b border-white/12 px-4 py-3">
            <span className="relative shrink-0">
              <Avatar className="size-11 border-2 border-gold" />
              <span aria-hidden="true" className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-navy-800 bg-[#3ddc84]" />
            </span>
            <p className="leading-tight">
              <span className="block font-display text-lg font-extrabold">{NAME}</span>
              <span className="block text-xs text-mist/65">AI assistant for {event.name}</span>
            </p>
          </div>

          <div ref={logRef} role="log" aria-live="polite" aria-busy={busy} className="flex-1 space-y-3 overflow-y-auto p-4 text-[15px] leading-relaxed">
            <p className="max-w-[88%] rounded-2xl rounded-tl-sm bg-navy px-4 py-2.5 text-mist/95">{greeting}</p>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <p key={i} className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-tr-sm bg-gold px-4 py-2.5 font-medium text-navy">
                  <span className="sr-only">You asked: </span>
                  {m.content}
                </p>
              ) : (
                <p key={i} className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-navy px-4 py-2.5 text-mist/95">
                  <span className="sr-only">{NAME} said: </span>
                  {m.content || <span className="chat-typing" aria-label="Thinking" />}
                </p>
              ),
            )}
            {messages.length === 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => ask(s)}
                      className="rounded-full border border-gold/70 px-3 py-1.5 text-left text-sm text-gold transition-colors hover:bg-gold hover:text-navy"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-white/12 bg-navy p-3">
            <label htmlFor="chat-input" className="sr-only">
              Your question
            </label>
            <input
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={600}
              autoComplete="off"
              placeholder="Ask about the event"
              className="min-w-0 flex-1 rounded-full border border-white/20 bg-navy-800 px-4 py-2.5 text-[15px] text-white placeholder:text-mist/45 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send question"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-navy transition-opacity disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </section>
      )}

      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? `Close the chat with ${NAME}` : `Ask ${NAME}: open the chat with the TABS assistant`}
        className="group relative rounded-full shadow-[0_10px_30px_rgb(0_0_0/0.5)] transition-transform hover:-translate-y-0.5"
      >
        <Avatar className="size-16 border-[3px] border-gold sm:size-[4.5rem]" />
        <span aria-hidden="true" className="absolute bottom-0.5 right-0.5 size-4 rounded-full border-2 border-navy bg-[#3ddc84]" />
        {!open && (
          <span
            aria-hidden="true"
            className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg rounded-br-none border border-gold/70 bg-navy px-3 py-1.5 font-mono text-xs font-bold text-gold"
          >
            ask {NAME.toLowerCase()}
          </span>
        )}
      </button>
    </div>
  );
}
