"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import NextImage from "next/image";
import { event } from "@/content/event";
import { createHeadRig } from "./head-rig";

const facts = [
  { label: "Dates", value: "7–28 Nov" },
  { label: "Time", value: event.time.short },
  { label: "Place", value: "Osu, Accra" },
  { label: "Price", value: event.price.label },
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// "Don't just learn about AI." / "Build with it."
const [taglineLead, taglineEnd] = event.tagline.split(/(?<=\.)\s+/);

// Size of the character stage written by scripts/build-head-rig.py.
const STAGE = { width: 1699, height: 1140 };

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = root.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    // Motion-sensitive visitors keep the still portrait and never download the rig.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;
    const controller = new AbortController();
    let cancelled = false;
    let cleanup = () => {};

    createHeadRig(canvas, controller.signal)
      .then((rig) => {
        if (cancelled) return;
        const pointer = { x: 0, y: 0, at: -Infinity, inside: true };
        let frame = 0;
        let last = 0;
        let visible = true;
        let idleUntil = 0;

        const tick = (now: number) => {
          frame = 0;
          if (!visible || document.hidden) return;
          const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
          last = now;
          if (pointer.inside && now - pointer.at < 3500) {
            rig.lookAt(pointer.x, pointer.y);
          } else if (now > idleUntil) {
            // Nobody pointing: he glances around, mostly at eye level.
            if (Math.random() < 0.35) rig.lookToward(0, rand(-0.15, 0.05));
            else rig.lookToward(rand(-0.75, 0.75), rand(-0.45, 0.35));
            idleUntil = now + rand(1400, 3200);
          }
          rig.update(dt, now);
          frame = requestAnimationFrame(tick);
        };
        const start = () => {
          if (!frame && visible && !document.hidden) {
            last = 0;
            frame = requestAnimationFrame(tick);
          }
        };
        const stop = () => {
          cancelAnimationFrame(frame);
          frame = 0;
        };

        const moved = (event: PointerEvent) => {
          pointer.x = event.clientX;
          pointer.y = event.clientY;
          pointer.at = performance.now();
          pointer.inside = true;
        };
        const left = () => {
          pointer.inside = false;
        };
        const observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
          },
          { rootMargin: "120px" },
        );
        const resized = new ResizeObserver(() => rig.resize());
        const visibilityChanged = () => (document.hidden ? stop() : start());
        const motionChanged = () => {
          if (!reducedMotion.matches) return start();
          stop();
          rig.rest();
        };

        observer.observe(hero);
        resized.observe(canvas);
        window.addEventListener("pointermove", moved, { passive: true });
        window.addEventListener("pointerdown", moved, { passive: true });
        document.documentElement.addEventListener("pointerleave", left);
        document.addEventListener("visibilitychange", visibilityChanged);
        reducedMotion.addEventListener("change", motionChanged);
        rig.rest();
        canvas.dataset.ready = "true";
        start();

        cleanup = () => {
          stop();
          observer.disconnect();
          resized.disconnect();
          window.removeEventListener("pointermove", moved);
          window.removeEventListener("pointerdown", moved);
          document.documentElement.removeEventListener("pointerleave", left);
          document.removeEventListener("visibilitychange", visibilityChanged);
          reducedMotion.removeEventListener("change", motionChanged);
        };
      })
      .catch((error: unknown) => {
        // The still portrait stays visible if the rig cannot load.
        if (!cancelled) {
          delete canvas.dataset.ready;
          canvas.dataset.error = error instanceof Error ? error.message : "Character rig unavailable";
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
      cleanup();
      delete canvas.dataset.ready;
    };
  }, []);

  return (
    <section ref={root} id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-pattern" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

      <div className="hero-meta font-mono" aria-label="Event summary">
        <span>{event.edition} · NOVEMBER 2026</span>
        <span>
          {event.seats.total} SEATS · ACCRA, GHANA
        </span>
      </div>

      <div className="hero-copy">
        <p className="hero-kicker font-mono">Welcome to {event.name}</p>
        <h1 id="hero-title" className="hero-title font-display">
          <span>{taglineLead}</span> <span className="hero-title-accent">{taglineEnd}</span>
        </h1>
        <p className="hero-support">
          Four hands-on Saturdays in Osu, Accra. Learn the everyday AI tools, then leave with a live
          personal website you built yourself. {event.audience.callout}
        </p>
        <div className="hero-actions">
          <a href="#register" className="hero-cta font-display">
            Save your seat
            <span aria-hidden="true">↗</span>
          </a>
          <a href="#build" className="hero-secondary">
            See what you&apos;ll build
          </a>
        </div>
      </div>

      <div
        className="hero-character"
        aria-hidden="true"
        style={{ "--stage-aspect": STAGE.width / STAGE.height } as CSSProperties}
      >
        <div className="hero-sun" />
        <div className="hero-character-motion" style={{ aspectRatio: `${STAGE.width} / ${STAGE.height}` }}>
          <NextImage
            className="hero-character-fallback"
            src="/assets/hero-head/still.webp"
            alt=""
            width={STAGE.width}
            height={STAGE.height}
            sizes="(max-width: 760px) 100vw, 50vw"
            priority
          />
          <canvas ref={canvasRef} className="hero-character-canvas" />
        </div>
        <p className="hero-look-note font-mono">
          MOVE YOUR CURSOR <span aria-hidden="true">↗</span>
        </p>
      </div>

      <dl className="hero-facts">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="font-mono">{fact.label}</dt>
            <dd className="font-display">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
