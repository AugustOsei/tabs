"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LID_CLOSED = -112;
const LID_OPEN = 6;

// A vector laptop whose lid swings open as it scrolls into view, then a
// portfolio page assembles itself on the screen block by block.
export default function LaptopBuild() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia(el);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 88%", end: "center 42%", scrub: 0.6 },
      });
      tl.fromTo(".laptop-lid", { rotationX: LID_CLOSED }, { rotationX: LID_OPEN, duration: 0.55, ease: "power1.inOut" }, 0)
        .fromTo(".laptop-glow", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5 }, 0.1)
        .fromTo(
          "[data-block]",
          { opacity: 0, y: 14, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.12, stagger: 0.045, ease: "power2.out" },
          0.5,
        )
        .fromTo(".laptop-cursor", { opacity: 0, x: 60, y: 40 }, { opacity: 1, x: 0, y: 0, duration: 0.15, ease: "power2.out" }, 0.84);
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className="laptop" aria-hidden="true">
      <div className="laptop-glow" />
      <div className="laptop-body">
        <div className="laptop-lid">
          <div className="laptop-lid-front">
            <div className="laptop-screen">
              {/* Browser chrome */}
              <div data-block className="flex items-center gap-1.5 border-b-2 border-gold/70 px-[4%] py-[2.5%]">
                <span className="h-[0.5em] w-[18%] rounded-sm bg-gold" />
                <span className="ml-auto size-[0.45em] rounded-full bg-gold" />
                <span className="size-[0.45em] rounded-full bg-gold" />
                <span className="size-[0.45em] rounded-full bg-gold" />
              </div>
              <div className="flex flex-1 flex-col gap-[5%] p-[5%]">
                {/* Intro block */}
                <div data-block className="flex items-center gap-[5%]">
                  <span className="aspect-square w-[17%] rounded-full bg-gold" />
                  <span className="flex flex-1 flex-col gap-[0.5em]">
                    <span className="h-[0.9em] w-[70%] rounded-sm bg-white" />
                    <span className="h-[0.45em] w-[92%] rounded-sm bg-white/35" />
                    <span className="h-[0.45em] w-[58%] rounded-sm bg-white/35" />
                  </span>
                </div>
                {/* Cards */}
                <div className="grid flex-1 grid-cols-3 gap-[4%]">
                  {["bg-gold/90", "bg-mist", "bg-navy-700"].map((tone) => (
                    <div data-block key={tone} className="flex flex-col gap-[8%] rounded-md border border-white/15 bg-navy-800 p-[8%]">
                      <span className={`flex-1 rounded-sm ${tone}`} />
                      <span className="h-[0.4em] w-[80%] rounded-sm bg-white/40" />
                      <span className="h-[0.4em] w-[50%] rounded-sm bg-white/25" />
                    </div>
                  ))}
                </div>
                {/* Contact button */}
                <div data-block className="relative flex items-center gap-[4%]">
                  <span className="h-[1.9em] w-[34%] rounded-full bg-gold" />
                  <span className="h-[0.45em] w-[22%] rounded-sm bg-white/30" />
                  <svg viewBox="0 0 32 47" className="laptop-cursor absolute left-[24%] top-[35%] h-[2.4em]">
                    <path d="M0 0 L0 40 L10.5 30.5 L17.5 47 L25 43.8 L18 27.5 L32 27.5 Z" fill="#fff" stroke="#0D1B2A" strokeWidth="2.5" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="laptop-lid-back">
            <svg viewBox="0 0 64 48" className="w-[16%]">
              <path d="M3 44 L3 8 Q3 3 8 3 L22 3 L28 10 L56 10 Q61 10 61 15 L61 44 Z" fill="none" stroke="#0D1B2A" strokeWidth="4" strokeLinejoin="round" opacity="0.5" />
            </svg>
          </div>
        </div>
        <div className="laptop-base">
          <div className="laptop-keys" />
          <div className="laptop-trackpad" />
        </div>
      </div>
    </div>
  );
}
