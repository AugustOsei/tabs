// Scroll-driven burst of falling gold glyphs. Rendering is a pure function of
// progress, so scrubbing backwards plays it in reverse and nothing runs when
// the burst is out of range.

const GLYPHS = ["T", "A", "B", "S", "A", "I", "{", "}", "<", "/", ">"];

type Column = { x: number; speed: number; offset: number; size: number; seed: number; length: number };

// Small deterministic PRNG so the pattern is identical on every render.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGlyphRain(canvas: HTMLCanvasElement, start: number, end: number) {
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let columns: Column[] = [];
  let cleared = true;
  // Canvas cannot resolve CSS variables, so read the resolved mono family.
  let family = "monospace";

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    family = getComputedStyle(canvas).fontFamily || family;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rand = mulberry32(7);
    const count = Math.max(10, Math.min(34, Math.round(width / 42)));
    columns = Array.from({ length: count }, (_, i) => ({
      x: ((i + 0.15 + rand() * 0.7) / count) * width,
      speed: 1.1 + rand() * 1.3,
      offset: rand() * 0.9,
      size: 14 + Math.round(rand() * 12),
      seed: Math.floor(rand() * 1000),
      length: 6 + Math.floor(rand() * 9),
    }));
    cleared = false;
  }

  function render(progress: number) {
    if (!ctx) return;
    const t = (progress - start) / (end - start);
    if (t <= 0 || t >= 1) {
      if (!cleared) {
        ctx.clearRect(0, 0, width, height);
        cleared = true;
      }
      return;
    }
    cleared = false;
    ctx.clearRect(0, 0, width, height);

    // Fade in fast, hold briefly, fade out.
    const envelope = Math.min(1, t / 0.2) * Math.min(1, (1 - t) / 0.45);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (const col of columns) {
      const step = col.size * 1.25;
      const head = (t * col.speed - col.offset * 0.5) * (height + col.length * step);
      ctx.font = `700 ${col.size}px ${family}`;
      for (let i = 0; i < col.length; i++) {
        const y = head - i * step;
        if (y < -step || y > height) continue;
        const n = col.seed + i * 7 + Math.floor(head / step);
        const glyph = GLYPHS[((n % GLYPHS.length) + GLYPHS.length) % GLYPHS.length];
        const tail = 1 - i / col.length;
        ctx.fillStyle = i === 0 ? "#FFF3B8" : "#F5C518";
        ctx.globalAlpha = envelope * tail * (i === 0 ? 1 : 0.75);
        ctx.fillText(glyph, col.x, y);
      }
    }
    ctx.globalAlpha = 1;
  }

  resize();
  return { resize, render };
}
