"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Icon from "@/components/Icon";
import { event } from "@/content/event";

const { sessions, flowNote } = event.schedule;

const stroke = { fill: "none", stroke: "#F5C518", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const soft = { ...stroke, stroke: "#EEF2F6", opacity: 0.55 } as const;

// One small line illustration per Saturday, built from the browser-window motif.
const art: ReactNode[] = [
  // Meet your AI toolkit: a prompt and its answer
  <g key="toolkit">
    <path {...stroke} d="M20 30h120a10 10 0 0 1 10 10v40a10 10 0 0 1-10 10H60l-22 18V90H20a10 10 0 0 1-10-10V40a10 10 0 0 1 10-10Z" />
    <path {...soft} d="M30 52h90M30 68h60" />
    <path {...soft} d="M110 112h100a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10h-100a10 10 0 0 1-10-10v-28a10 10 0 0 1 10-10Z" />
    <path {...stroke} d="M186 28l5 16 16 5-16 5-5 16-5-16-16-5 16-5 5-16Z" />
  </g>,
  // Part 1: plan the page
  <g key="plan">
    <path {...stroke} d="M14 160V34a10 10 0 0 1 10-10h50l14 16h118a10 10 0 0 1 10 10v110" />
    <path {...stroke} d="M14 58h202" />
    <path {...soft} strokeDasharray="7 7" d="M34 76h80v34H34zM130 76h66v34h-66zM34 124h162v24H34z" />
  </g>,
  // Part 2: build and publish
  <g key="build">
    <path {...stroke} d="M14 160V34a10 10 0 0 1 10-10h50l14 16h118a10 10 0 0 1 10 10v110" />
    <path {...stroke} d="M14 58h202" />
    <rect x="34" y="76" width="80" height="34" rx="4" fill="#F5C518" />
    <rect x="130" y="76" width="66" height="34" rx="4" fill="#EEF2F6" opacity="0.8" />
    <rect x="34" y="124" width="100" height="22" rx="11" fill="#F5C518" />
    <path d="M150 118v34l9-8 6 14 7-3-6-14h12Z" fill="#fff" stroke="#0D1B2A" strokeWidth="2.5" strokeLinejoin="round" />
  </g>,
  // Demo Day: present your work
  <g key="demo">
    <rect {...stroke} x="26" y="22" width="178" height="104" rx="8" />
    <path {...stroke} d="M115 126v24M80 162h70" />
    <path d="m115 44 8.500 17.500 19.300 2.600-14.100 13.400 3.500 19.200L115 87.400l-17.200 9.300 3.500-19.200-14.100-13.400 19.300-2.600L115 44Z" fill="#F5C518" />
  </g>,
];

export default function ScheduleTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const next = (index + sessions.length) % sessions.length;
    setActive(next);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const move: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: sessions.length - 1,
    };
    if (!(e.key in move)) return;
    e.preventDefault();
    select(move[e.key]);
  };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gold/80 bg-navy-800 shadow-[0_30px_80px_rgb(0_0_0/0.35)]">
      {/* Tab strip */}
      <div className="flex items-end border-b-2 border-gold/80 bg-navy">
        <div
          role="tablist"
          aria-label="The four Saturdays"
          onKeyDown={onKeyDown}
          className="schedule-tabs flex flex-1 items-end gap-1 overflow-x-auto px-3 pt-4"
        >
          {sessions.map((s, i) => {
            const selected = i === active;
            const linkedNext = s.linkedGroup && sessions[i + 1]?.linkedGroup === s.linkedGroup;
            return (
              <div key={s.id} role="presentation" className="relative flex shrink-0 items-end">
                <button
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${s.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={`relative -mb-0.5 rounded-t-xl border-2 border-b-0 px-5 py-3 font-mono text-sm font-bold tracking-wide transition-colors sm:px-7 sm:text-base ${
                    selected
                      ? "border-gold/80 bg-navy-800 text-gold"
                      : "border-transparent text-mist/65 hover:text-white"
                  }`}
                >
                  {s.tab}
                  {s.linkedGroup && (
                    <span aria-hidden="true" className="absolute inset-x-3 -top-2 h-1 rounded-full bg-gold/80" />
                  )}
                </button>
                {/* Chain between Part 1 and Part 2 */}
                {linkedNext && (
                  <span aria-hidden="true" className="relative z-10 -mx-2.5 mb-3 grid size-6 place-items-center rounded-full bg-gold text-navy">
                    <Icon name="link" className="size-3.5" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div aria-hidden="true" className="hidden gap-2 px-5 pb-4 sm:flex">
          <span className="size-2.5 rounded-full bg-gold" />
          <span className="size-2.5 rounded-full bg-gold" />
          <span className="size-2.5 rounded-full bg-gold" />
        </div>
      </div>

      {/* Panels */}
      {sessions.map((s, i) => (
        <div
          key={s.id}
          role="tabpanel"
          id={`panel-${s.id}`}
          aria-labelledby={`tab-${s.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="schedule-panel grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_15rem] md:items-center"
        >
          <div>
            <p className="font-mono text-xs font-medium tracking-wide text-gold sm:text-sm">
              {s.dateLabel} · {event.time.short} · session {i + 1} of {sessions.length}
            </p>
            <h3 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{s.title}</h3>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-mist/90">{s.description}</p>
            {s.linkedGroup && (
              <p className="mt-6 flex max-w-xl items-start gap-3 rounded-xl border border-gold/50 bg-gold/8 p-4 text-sm leading-relaxed text-mist/90">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold text-navy">
                  <Icon name="link" className="size-3.5" />
                </span>
                {flowNote}
              </p>
            )}
          </div>
          <svg viewBox="0 0 230 180" aria-hidden="true" className="mx-auto w-44 md:w-full">
            {art[i]}
          </svg>
        </div>
      ))}
    </div>
  );
}
