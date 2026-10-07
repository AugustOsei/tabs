"use client";

import { Suspense, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TabsLogo from "@/components/TabsLogo";
import { cursorPath, hero, MOBILE_QUERY, SCROLL_VIEWPORTS, stops, type HeroVariant } from "@/config/hero";
import ArrowCursor from "./ArrowCursor";
import BoardDebug from "./BoardDebug";
import { createGlyphRain } from "./glyphRain";
import TitleBlock from "./TitleBlock";

const vars = (v: HeroVariant) =>
  `--ar:${v.aspect};--bx:${v.board.x};--by:${v.board.y};--bw:${v.board.w};--bh:${v.board.h};--bias:${v.verticalBias};--fit:${v.logoFit};`;

const heroVars = `.hero{--scroll-vh:${SCROLL_VIEWPORTS};${vars(hero.desktop)}}@media ${MOBILE_QUERY}{.hero{${vars(hero.mobile)}}}`;

const srcSet = (v: HeroVariant, ext: string) =>
  v.widths.map((w) => `${v.image}-${w}.${ext} ${w}w`).join(", ");

function bezier(t: number, a: number, b: number, c: number, d: number) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia(el);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(el);
      const stage = q(".hero-stage")[0] as HTMLElement;
      const wrap = q(".hero-scene-wrap")[0] as HTMLElement;
      const scene = q(".hero-scene")[0] as HTMLElement;
      const board = q(".hero-board")[0] as HTMLElement;
      const arrow = q(".hero-arrow")[0];
      const canvas = q(".hero-canvas")[0] as HTMLCanvasElement;

      const rain = createGlyphRain(canvas, stops.zoomStart, stops.zoomEnd);

      // Where the scene must move and how far it must scale for the board to
      // fill the visible viewport.
      const zoom = { x: 0, y: 0, scale: 1 };
      const measure = () => {
        const bx = wrap.offsetLeft + board.offsetLeft;
        const by = wrap.offsetTop + board.offsetTop;
        const bw = board.offsetWidth;
        const bh = board.offsetHeight;
        const vw = stage.clientWidth;
        const vh = window.innerHeight;
        zoom.scale = Math.max(vw / bw, vh / bh) * 1.04;
        zoom.x = vw / 2 - (bx + bw / 2);
        zoom.y = vh / 2 - (by + bh / 2);
        gsap.set(scene, {
          transformOrigin: `${board.offsetLeft + bw / 2}px ${board.offsetTop + bh / 2}px`,
        });
        rain.resize();
      };
      measure();
      ScrollTrigger.addEventListener("refreshInit", measure);

      const glide = { t: 0 };
      const placeArrow = () => {
        const { from, c1, c2, to } = cursorPath;
        gsap.set(arrow, {
          x: bezier(glide.t, from.x, c1.x, c2.x, to.x),
          y: bezier(glide.t, from.y, c1.y, c2.y, to.y),
        });
      };
      placeArrow();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => rain.render(tl.progress()),
      });

      // the scene settles, with a little parallax on the logo.
      tl.fromTo(scene, { scale: 1.06 }, { scale: 1, duration: stops.settleEnd, ease: "power1.out" }, 0)
        .fromTo(".hero-logo", { yPercent: 4 }, { yPercent: 0, duration: stops.settleEnd, ease: "power1.out" }, 0)
        .to(arrow, { opacity: 1, duration: 0.03 }, stops.glideStart - 0.03);

      // the arrow glides along a curve to the logo's tab.
      tl.to(
        glide,
        { t: 1, duration: stops.glideEnd - stops.glideStart, ease: "power2.inOut", onUpdate: placeArrow },
        stops.glideStart,
      );

      // click. The arrow dips, the tab lights up, a ripple spreads.
      tl.to(".hero-arrow-shape", { scale: 0.8, duration: 0.02 }, stops.clickStart)
        .to(".hero-arrow-shape", { scale: 1, duration: 0.03 }, stops.clickStart + 0.025)
        .to(".logo-tab-fill", { opacity: 1, duration: 0.02 }, stops.clickStart + 0.02)
        .to(".logo-tab-text", { fill: "#0D1B2A", duration: 0.02 }, stops.clickStart + 0.02)
        .fromTo(
          ".hero-ripple",
          { attr: { r: 0 }, opacity: 0.8 },
          { attr: { r: 70 }, opacity: 0, duration: 0.07, ease: "power1.out", immediateRender: false },
          stops.clickStart + 0.02,
        );

      // dive into the board. The glyph burst is drawn in onUpdate.
      const zoomDuration = stops.zoomEnd - stops.zoomStart;
      tl.to(
        scene,
        { x: () => zoom.x, y: () => zoom.y, scale: () => zoom.scale, duration: zoomDuration, ease: "power2.inOut" },
        stops.zoomStart,
      )
        .to(arrow, { opacity: 0, duration: 0.06 }, stops.zoomStart + 0.03)
        .to(".hero-logo", { opacity: 0, duration: 0.1 }, stops.zoomStart + zoomDuration * 0.55)
        .to(".hero-fill", { opacity: 1, duration: 0.08 }, stops.zoomEnd - 0.09);

            // Beat 1 (poster): header logo, backdrop, big title and the full figure.
      const A = stops.titleStart;
      tl.fromTo(document.querySelector(".site-logo"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, A)
        .fromTo('.hero-title [data-in="fade"]', { opacity: 0 }, { opacity: 1, duration: 0.04 }, A)
        .fromTo(
          '.hero-title [data-in="rise"]',
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.07, stagger: 0.012, ease: "power2.out" },
          A + 0.01,
        )
        .fromTo(
          '.hero-title [data-in="figure"]',
          { opacity: 0, yPercent: 16 },
          { opacity: 1, yPercent: 0, duration: 0.09, ease: "power2.out" },
          A + 0.02,
        );

      // Beat 2 (details): the title drops back to a ghost, the figure slides
      // right and is cropped, and the copy and facts form on the left.
      const B = stops.detailStart;
      tl.to(".title-poster", { opacity: 0.07, duration: 0.08 }, B)
        .to(".title-caption", { opacity: 0, duration: 0.05 }, B)
        .fromTo(".title-figure-move", { "--p": 0 }, { "--p": 1, duration: 0.13, ease: "power2.inOut" }, B)
        .fromTo(
          '.hero-title [data-in="sheet"]',
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" },
          B + 0.05,
        )
        .fromTo(
          '.hero-title [data-in="detail"]',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.06, stagger: 0.012, ease: "power2.out" },
          B + 0.07,
        )
        .set({}, {}, 1);

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", measure);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="top" className="hero" aria-label="Introduction">
      <style>{heroVars}</style>
      <div className="hero-stage">
        <div className="hero-room">
          <div className="hero-scene-wrap">
            <div className="hero-scene">
              <picture>
                <source media={MOBILE_QUERY} type="image/avif" srcSet={srcSet(hero.mobile, "avif")} sizes={hero.mobile.sizes} />
                <source media={MOBILE_QUERY} type="image/webp" srcSet={srcSet(hero.mobile, "webp")} sizes={hero.mobile.sizes} />
                <source type="image/avif" srcSet={srcSet(hero.desktop, "avif")} sizes={hero.desktop.sizes} />
                <source type="image/webp" srcSet={srcSet(hero.desktop, "webp")} sizes={hero.desktop.sizes} />
                <img
                  src={`${hero.desktop.image}-${hero.desktop.widths[0]}.webp`}
                  alt="Five adults at laptops in a bright workshop room in Accra, facing a large board at the front."
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                />
              </picture>
              <div className="hero-board">
                <TabsLogo className="hero-logo">
                  <ArrowCursor />
                </TabsLogo>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-fill" aria-hidden="true" />
        <canvas className="hero-canvas font-mono" aria-hidden="true" />
        <TitleBlock />
        <Suspense>
          <BoardDebug />
        </Suspense>
      </div>
    </section>
  );
}
