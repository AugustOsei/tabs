"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Speaker } from "@/content/event";
import { reveal } from "@/lib/reveal";

const DEG = 180 / Math.PI;
// Pendulum feel. Angles are radians, positive to the right; stretch is px.
const SWING = 38;
const SWING_DRAG = 1.3;
const TILT = 90;
const TILT_DRAG = 5;
const TILT_HANG = 0.35; // how far the badge straightens against the strap
const TILT_LAG = 0.3; // how much the badge trails when the strap speeds up
const STRETCH = 260;
const STRETCH_DRAG = 13;
const MAX_ANGLE = 1.2;
const MAX_STRETCH = 64;
const FOLLOW = 24; // how tightly a held badge tracks the pointer
const INTRO_KICKS = [1.5, -1.1, 1.2, -1.6];

type Grab = { offset: number; reach: number; fromStretch: number; angle: number; stretch: number; x: number; y: number };
type Sim = {
  col: HTMLElement;
  arm: HTMLElement;
  strap: HTMLElement;
  badge: HTMLElement;
  length: number;
  a: number;
  av: number;
  b: number;
  bv: number;
  s: number;
  sv: number;
  grab: Grab | null;
  moved: boolean;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function step(m: Sim, dt: number) {
  let accel: number;
  if (m.grab) {
    const k = 1 - Math.exp(-dt * FOLLOW);
    const a = m.a + (m.grab.angle - m.a) * k;
    const av = (a - m.a) / dt;
    accel = clamp((av - m.av) / dt, -60, 60);
    m.a = a;
    m.av = av;
    const s = m.s + (m.grab.stretch - m.s) * k;
    m.sv = (s - m.s) / dt;
    m.s = s;
  } else {
    accel = -SWING * Math.sin(m.a) - SWING_DRAG * m.av;
    m.av += accel * dt;
    m.a += m.av * dt;
    m.sv += (-STRETCH * m.s - STRETCH_DRAG * m.sv) * dt;
    m.s += m.sv * dt;
  }
  m.bv += (-TILT * (m.b + TILT_HANG * m.a) - TILT_DRAG * m.bv - TILT_LAG * accel) * dt;
  m.b = clamp(m.b + m.bv * dt, -0.9, 0.9);
}

const atRest = (m: Sim) =>
  !m.grab &&
  Math.abs(m.a) < 0.002 &&
  Math.abs(m.av) < 0.02 &&
  Math.abs(m.b) < 0.002 &&
  Math.abs(m.bv) < 0.02 &&
  Math.abs(m.s) < 0.2 &&
  Math.abs(m.sv) < 2;

function draw(m: Sim) {
  gsap.set(m.arm, { rotation: -m.a * DEG });
  gsap.set(m.strap, { scaleY: (m.length + m.s) / m.length });
  gsap.set(m.badge, { y: m.s, rotation: -m.b * DEG });
}

type Props = { speakers: readonly Speaker[]; label: string };

// Speaker badges on lanyards that can be grabbed, swung and let go, with the
// profiles beneath. Picking a badge (or a profile) highlights its profile.
export default function SpeakerLanyards({ speakers, label }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const sims = useRef(new Map<string, Sim>());
  const kick = useRef<(id: string, push: number) => void>(() => {});
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const map = sims.current;

    const mm = gsap.matchMedia(el);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const rail = el.querySelector<HTMLElement>("[data-rail]");
      if (!rail) return;
      const cleanups: (() => void)[] = [];
      let running = false;
      let visible = false;
      let introduced = false;

      const tick = (_time: number, delta: number) => {
        const dt = Math.min(delta / 1000, 1 / 30) / 2;
        let awake = false;
        for (const m of map.values()) {
          step(m, dt);
          step(m, dt);
          if (atRest(m)) m.a = m.av = m.b = m.bv = m.s = m.sv = 0;
          else awake = true;
          draw(m);
        }
        if (!awake || !visible) {
          running = false;
          gsap.ticker.remove(tick);
        }
      };
      const wake = () => {
        if (running || !visible) return;
        running = true;
        gsap.ticker.add(tick);
      };
      kick.current = (id, push) => {
        const m = map.get(id);
        if (!m || m.grab) return;
        m.av += push;
        wake();
      };

      rail.querySelectorAll<HTMLElement>("[data-lanyard]").forEach((col) => {
        const arm = col.querySelector<HTMLElement>("[data-arm]");
        const strap = col.querySelector<HTMLElement>("[data-strap]");
        const badge = col.querySelector<HTMLElement>("[data-badge]");
        if (!arm || !strap || !badge) return;
        const m: Sim = { col, arm, strap, badge, length: strap.offsetHeight || 1, a: 0, av: 0, b: 0, bv: 0, s: 0, sv: 0, grab: null, moved: false };
        map.set(col.dataset.lanyard ?? "", m);

        // The pointer measured from the hook the strap hangs from.
        const fromHook = (e: PointerEvent) => {
          const r = col.getBoundingClientRect();
          const x = e.clientX - (r.left + r.width / 2);
          const y = e.clientY - r.top;
          return { angle: Math.atan2(x, y), reach: Math.hypot(x, y) };
        };
        const down = (e: PointerEvent) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          const p = fromHook(e);
          m.grab = { offset: p.angle - m.a, reach: p.reach, fromStretch: m.s, angle: m.a, stretch: m.s, x: e.clientX, y: e.clientY };
          m.moved = false;
          try {
            badge.setPointerCapture(e.pointerId);
          } catch {
            // The pointer is already gone; the drag simply ends on the next event.
          }
          wake();
        };
        const move = (e: PointerEvent) => {
          const g = m.grab;
          if (!g) return;
          const p = fromHook(e);
          g.angle = clamp(p.angle - g.offset, -MAX_ANGLE, MAX_ANGLE);
          g.stretch = clamp(p.reach - g.reach + g.fromStretch, -m.length * 0.3, MAX_STRETCH);
          if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 6) m.moved = true;
          wake();
        };
        const up = () => {
          if (!m.grab) return;
          m.grab = null;
          wake();
        };
        const enter = (e: PointerEvent) => {
          if (e.pointerType !== "mouse" || m.grab) return;
          m.av += e.movementX < 0 ? -0.9 : 0.9;
          wake();
        };
        badge.addEventListener("pointerdown", down);
        badge.addEventListener("pointermove", move);
        badge.addEventListener("pointerup", up);
        badge.addEventListener("pointercancel", up);
        badge.addEventListener("lostpointercapture", up);
        badge.addEventListener("pointerenter", enter);
        cleanups.push(() => {
          badge.removeEventListener("pointerdown", down);
          badge.removeEventListener("pointermove", move);
          badge.removeEventListener("pointerup", up);
          badge.removeEventListener("pointercancel", up);
          badge.removeEventListener("lostpointercapture", up);
          badge.removeEventListener("pointerenter", enter);
        });
      });

      const sizes = new ResizeObserver(() => {
        for (const m of map.values()) m.length = m.strap.offsetHeight || 1;
      });
      sizes.observe(rail);

      // Swing in the first time the badges are seen; sleep while off screen.
      const seen = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (!visible) return;
          if (!introduced) {
            introduced = true;
            let i = 0;
            for (const m of map.values()) m.av += INTRO_KICKS[i++ % INTRO_KICKS.length];
          }
          wake();
        },
        { threshold: 0.35 },
      );
      seen.observe(rail);

      return () => {
        gsap.ticker.remove(tick);
        sizes.disconnect();
        seen.disconnect();
        cleanups.forEach((fn) => fn());
        kick.current = () => {};
        for (const m of map.values()) gsap.set([m.arm, m.strap, m.badge], { clearProps: "transform" });
        map.clear();
      };
    });
    return () => mm.revert();
  }, []);

  // A tap or key press (not the end of a drag) highlights the profile and nudges the badge.
  const choose = (id: string) => {
    const m = sims.current.get(id);
    if (m?.moved) {
      m.moved = false;
      return;
    }
    setActive(id);
    kick.current(id, 1.2);
  };

  return (
    <div ref={root}>
      <div {...reveal()}>
        {/* The rail the lanyards hang from */}
        <div aria-hidden="true" className="h-2 rounded-full border border-white/12 bg-navy-700" />
        <ul data-rail className="-mt-1 grid grid-cols-4">
          {speakers.map((sp, i) => (
            <li key={sp.id} data-lanyard={sp.id} className="flex justify-center">
              <div data-arm className="flex origin-top flex-col items-center will-change-transform">
                <span
                  data-strap
                  aria-hidden="true"
                  className={`lanyard-strap block w-2.5 origin-top sm:w-3.5 ${i % 2 ? "h-20 sm:h-32" : "h-12 sm:h-20"}`}
                />
                <button
                  data-badge
                  type="button"
                  aria-pressed={active === sp.id}
                  aria-controls={`speaker-${sp.id}`}
                  aria-label={`${sp.name}, show profile`}
                  onPointerDown={() => setActive(sp.id)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(sp.id)}
                  onFocus={() => setActive(sp.id)}
                  onClick={() => choose(sp.id)}
                  className="flex origin-top cursor-grab touch-pan-y select-none flex-col items-center will-change-transform active:cursor-grabbing"
                >
                  {/* Clip and ring */}
                  <span aria-hidden="true" className="h-2.5 w-5 rounded-sm bg-linear-to-b from-zinc-200 to-zinc-500 sm:h-3 sm:w-7" />
                  <span aria-hidden="true" className="-mt-0.5 size-3 rounded-full border-2 border-zinc-300 sm:size-4" />
                  <span
                    className={`relative -mt-1.5 block w-[min(4.75rem,21vw)] rounded-lg bg-mist px-1.5 pb-2 pt-3.5 text-center text-navy shadow-xl shadow-black/40 transition-shadow sm:-mt-2 sm:w-32 sm:rounded-2xl sm:px-3 sm:pb-3.5 sm:pt-6 lg:w-40 ${
                      active === sp.id ? "ring-2 ring-gold ring-offset-2 ring-offset-navy" : ""
                    }`}
                  >
                    <span aria-hidden="true" className="absolute left-1/2 top-1 h-1 w-5 -translate-x-1/2 rounded-full bg-navy sm:top-2 sm:h-1.5 sm:w-9" />
                    <span className="hidden font-mono text-[10px] text-navy/55 sm:block">speaker-0{i + 1}</span>
                    {sp.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small pre-optimised WebP
                      <img
                        src={sp.photo}
                        alt=""
                        width={320}
                        height={320}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="mx-auto block aspect-square w-13 rounded-full border-2 border-gold object-cover sm:mt-1.5 sm:w-24 lg:w-28"
                      />
                    ) : (
                      <span className="mx-auto grid aspect-square w-13 place-items-center rounded-full border-2 border-gold font-display text-lg font-extrabold sm:mt-1.5 sm:w-24 sm:text-3xl lg:w-28">
                        {sp.initials}
                      </span>
                    )}
                    <span className="mt-1.5 block font-display text-[11px] font-extrabold leading-none sm:mt-2.5 sm:text-base sm:leading-tight">
                      <span className="sm:hidden">{sp.name.split(" ")[0]}</span>
                      <span className="hidden sm:inline">{sp.name}</span>
                    </span>
                    <span className="mt-2.5 hidden rounded-full bg-navy py-1 font-mono text-[10px] text-gold sm:block">{label}</span>
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-2 lg:grid-cols-4">
        {speakers.map((sp, i) => (
          <article
            key={sp.id}
            id={`speaker-${sp.id}`}
            {...reveal(i * 100)}
            onPointerEnter={() => {
              setActive(sp.id);
              kick.current(sp.id, 0.9);
            }}
            // The highlight is a data attribute: changing className here would
            // wipe the "is-in" class RevealObserver adds, hiding the card again.
            data-active={active === sp.id}
            className="relative rounded-2xl border border-white/12 bg-navy-800 p-6 data-[active=true]:border-gold data-[active=true]:bg-navy-700"
          >
            <span aria-hidden="true" className="font-mono text-xs text-mist/40">
              speaker-0{i + 1}
            </span>
            <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight">{sp.name}</h3>
            <p className="mt-2 font-display text-sm font-semibold leading-snug text-gold">{sp.role}</p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-mist/85">{sp.bio}</p>
            {sp.linkedin && (
              <a
                href={sp.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/70 px-4 py-2 font-mono text-sm text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                LinkedIn
                <span aria-hidden="true">↗</span>
                <span className="sr-only">
                  profile of {sp.name} (opens in a new tab)
                </span>
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
