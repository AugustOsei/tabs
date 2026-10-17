/**
 * The hero character's head rig.
 *
 * `body.webp` is the portrait with the head removed, with `pad` empty rows
 * above it so a lifted head has room. The canvas paints it, then
 * one cell from a grid of real head poses on top: rows are up/down tilt (top
 * row looks up), columns turn from image-left to image-right. The grid is cut
 * from Higgsfield image edits by scripts/build-head-rig.py, which also
 * records where the eyes sit in every cell so blinks can be painted on.
 */
const BASE = "/assets/hero-head/";
const BLEND = 70; // ms

type Eye = [x: number, y: number, rx: number, ry: number, lid: string];
type Rig = {
  box: [number, number, number, number];
  stage: [number, number];
  pad: number;
  frame: [number, number];
  cols: number;
  center: number;
  pitch: number[];
  rows: { src: string; eyes: Eye[][] }[];
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function image(src: string, signal: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error(`Character asset failed: ${src}`));
    signal.addEventListener("abort", () => reject(signal.reason));
    im.src = src;
  });
}

export async function createHeadRig(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const response = await fetch(BASE + "rig.json", { signal });
  if (!response.ok) throw new Error(`Character rig failed: ${response.status}`);
  const rig: Rig = await response.json();
  const rows: (HTMLImageElement | null)[] = rig.rows.map(() => null);
  let dirty = true;

  // Body and the level row first, so he can look left and right right away;
  // the other rows stream in nearest-to-level first.
  const order = rig.pitch.map((_, i) => i).sort((a, b) => Math.abs(rig.pitch[a]) - Math.abs(rig.pitch[b]));
  const [body, level] = await Promise.all([image(BASE + "body.webp", signal), image(BASE + rig.rows[order[0]].src, signal)]);
  rows[order[0]] = level;
  (async () => {
    for (const i of order.slice(1)) {
      try {
        rows[i] = await image(BASE + rig.rows[i].src, signal);
        dirty = true;
      } catch {
        return;
      }
    }
  })();

  const [pw, ph] = rig.stage;
  const [fw, fh] = rig.frame;
  const [bx, by, bx1, by1] = rig.box;
  // Eyes when facing forward, as a fraction of the portrait, to aim from.
  const front = rig.rows[order[0]].eyes[rig.center];
  const eyeFx = front.length === 2 ? (front[0][0] + front[1][0]) / 2 / (bx1 - bx) : 0.5;
  const eyeFy = front.length === 2 ? (front[0][1] + front[1][1]) / 2 / (by1 - by) : 0.35;

  let yaw = 0;
  let pitch = 0;
  let vYaw = 0;
  let vPitch = 0;
  let tYaw = 0;
  let tPitch = 0;
  let current = { row: -1, col: -1 };
  let previous = current;
  let switchedAt = 0;
  let lidsUntil = 0;
  let nextBlink = performance.now() + rand(1500, 3500);

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(Math.min(r.width * dpr, pw));
    canvas.height = Math.round((canvas.width * ph) / pw);
    dirty = true;
  };

  const rowFor = (p: number) => {
    let best = -1;
    rig.pitch.forEach((value, i) => {
      if (rows[i] && (best < 0 || Math.abs(value - p) < Math.abs(rig.pitch[best] - p))) best = i;
    });
    return best;
  };

  // Closed eyes: cover each eye with eyelid skin, then a soft lash line.
  const drawLids = (eyes: Eye[], s: number) => {
    for (const [ex, ey, rx, ry, lid] of eyes) {
      const x = (bx + ex) * s;
      const y = (by + ey) * s;
      const w = rx * 1.15 * s;
      const h = ry * 1.5 * s;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, h / w);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
      g.addColorStop(0, lid);
      g.addColorStop(0.7, lid);
      g.addColorStop(1, lid + "00");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, w, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "rgba(28, 14, 10, 0.9)";
      ctx.lineWidth = Math.max(1.2, ry * 0.32 * s);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - rx * 0.95 * s, y - ry * 0.1 * s);
      ctx.quadraticCurveTo(x, y + ry * 0.75 * s, x + rx * 0.95 * s, y - ry * 0.1 * s);
      ctx.stroke();
    }
  };

  const draw = (now: number) => {
    dirty = false;
    if (current.row < 0 || !canvas.width) return;
    const s = canvas.width / pw;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(body, 0, 0, canvas.width, canvas.height);
    const cell = (pose: typeof current) =>
      ctx.drawImage(rows[pose.row]!, pose.col * fw, 0, fw, fh, bx * s, by * s, (bx1 - bx) * s, (by1 - by) * s);
    // Neighbouring poses are about 10 degrees apart, so the new one fades in
    // over a few frames on top of the old one (which stays fully opaque, so
    // the page never shows through mid-blend).
    const t = (now - switchedAt) / BLEND;
    if (previous.row >= 0 && t < 1) {
      cell(previous);
      ctx.globalAlpha = t;
      cell(current);
      ctx.globalAlpha = 1;
      dirty = true;
    } else {
      cell(current);
    }
    if (now < lidsUntil) drawLids(rig.rows[current.row].eyes[current.col], s);
  };

  resize();

  return {
    /** Aim at a point on screen. */
    lookAt(px: number, py: number) {
      const r = canvas.getBoundingClientRect();
      const ex = r.left + r.width * ((bx + eyeFx * (bx1 - bx)) / pw);
      const ey = r.top + r.height * ((by + eyeFy * (by1 - by)) / ph);
      const sx = Math.max(window.innerWidth * 0.3, r.width * 0.6);
      const sy = Math.max(window.innerHeight * 0.3, r.width * 0.5);
      tYaw = Math.tanh((px - ex) / sx);
      // Looking up is gentler: the nav sits above him, and his strongest
      // upward pose should be rare.
      const lift = Math.tanh((py - ey) / sy);
      tPitch = lift < 0 ? lift * 0.75 : lift;
    },
    lookToward(x: number, y: number) {
      tYaw = clamp(x, -1, 1);
      tPitch = clamp(y, -1, 1);
    },
    update(dt: number, now: number) {
      // Slightly under-damped, so each turn settles with a little life.
      const k = 70;
      const c = 2 * 0.78 * Math.sqrt(k);
      vYaw += ((tYaw - yaw) * k - vYaw * c) * dt;
      vPitch += ((tPitch - pitch) * k - vPitch * c) * dt;
      yaw += vYaw * dt;
      pitch += vPitch * dt;

      // Random blinks, sometimes a double.
      if (now > nextBlink && now > lidsUntil) {
        lidsUntil = now + rand(110, 150);
        nextBlink = now + (Math.random() < 0.18 ? 280 : rand(2400, 5600));
        dirty = true;
      }
      if (lidsUntil && now > lidsUntil) {
        lidsUntil = 0;
        dirty = true;
      }

      const col = clamp(Math.round(rig.center + clamp(yaw, -1, 1) * rig.center), 0, rig.cols - 1);
      const row = rowFor(clamp(pitch, -1, 1));
      if (row !== current.row || col !== current.col) {
        previous = current;
        current = { row, col };
        switchedAt = now;
        dirty = true;
      }
      if (dirty) draw(now);
    },
    blink(ms = 130) {
      lidsUntil = performance.now() + ms;
      dirty = true;
    },
    /** The neutral pose, for reduced motion. */
    rest() {
      yaw = pitch = vYaw = vPitch = tYaw = tPitch = 0;
      lidsUntil = 0;
      current = { row: rowFor(0), col: rig.center };
      previous = { row: -1, col: -1 };
      draw(0);
    },
    resize,
  };
}
