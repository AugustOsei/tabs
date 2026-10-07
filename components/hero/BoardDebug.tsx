"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hero, MOBILE_QUERY, type BoardRect } from "@/config/hero";

// ?debug=board outlines the board rectangle and lets you nudge it:
// arrows move, Shift+arrows resize, Alt makes finer steps.
export default function BoardDebug() {
  const enabled = useSearchParams().get("debug") === "board";
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ variant: "desktop" | "mobile"; rect: BoardRect } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = ref.current?.closest<HTMLElement>(".hero");
    if (!root) return;
    root.classList.add("hero-debug");

    const mq = window.matchMedia(MOBILE_QUERY);
    let variant: "desktop" | "mobile" = mq.matches ? "mobile" : "desktop";
    let rect: BoardRect = { ...hero[variant].board };

    const apply = () => {
      root.style.setProperty("--bx", String(rect.x));
      root.style.setProperty("--by", String(rect.y));
      root.style.setProperty("--bw", String(rect.w));
      root.style.setProperty("--bh", String(rect.h));
      setState({ variant, rect: { ...rect } });
    };
    const onChange = () => {
      variant = mq.matches ? "mobile" : "desktop";
      rect = { ...hero[variant].board };
      apply();
    };
    const onKey = (e: KeyboardEvent) => {
      const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!dir) return;
      e.preventDefault();
      const step = e.altKey ? 0.02 : 0.1;
      const round = (n: number) => Math.round(n * 100) / 100;
      if (e.shiftKey) {
        rect.w = round(rect.w + dir[0] * step);
        rect.h = round(rect.h + dir[1] * step);
      } else {
        rect.x = round(rect.x + dir[0] * step);
        rect.y = round(rect.y + dir[1] * step);
      }
      apply();
    };

    apply();
    mq.addEventListener("change", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKey);
      root.classList.remove("hero-debug");
      for (const p of ["--bx", "--by", "--bw", "--bh"]) root.style.removeProperty(p);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      className="absolute left-3 top-3 z-10 rounded-md bg-black/85 px-3 py-2 font-mono text-[11px] leading-relaxed text-white"
    >
      {state && (
        <>
          <div className="text-[#ff2bd6]">debug=board ({state.variant})</div>
          <div>
            board: {"{"} x: {state.rect.x}, y: {state.rect.y}, w: {state.rect.w}, h: {state.rect.h} {"}"}
          </div>
          <div className="text-white/60">arrows move, shift resizes, alt = fine</div>
        </>
      )}
    </div>
  );
}
