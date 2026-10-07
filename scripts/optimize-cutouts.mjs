// Trims the transparent person cutouts and exports web sizes, plus the grain tile.
// Run: npm run cutouts
import sharp from "sharp";

const SRC = "assets/drafts";
const OUT = "public/assets";
const WIDTHS = [400, 760];

for (const name of ["man", "woman"]) {
  const trimmed = await sharp(`${SRC}/person-${name}-cutout.png`).trim({ threshold: 10 }).png().toBuffer();
  for (const width of WIDTHS) {
    const base = `${OUT}/person-${name}-${width}`;
    const a = await sharp(trimmed).resize({ width }).avif({ quality: 55, effort: 7 }).toFile(`${base}.avif`);
    const w = await sharp(trimmed).resize({ width }).webp({ quality: 80, effort: 6 }).toFile(`${base}.webp`);
    console.log(`${base}  ${a.width}x${a.height}  avif ${(a.size / 1024) | 0} KB, webp ${(w.size / 1024) | 0} KB`);
  }
}

// Film-grain tile, tiled over dark sections at low opacity.
const N = 96;
const buf = Buffer.alloc(N * N * 4);
let seed = 9;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
for (let i = 0; i < N * N; i++) {
  const v = (rand() * 255) | 0;
  buf.set([v, v, v, 38], i * 4);
}
const g = await sharp(buf, { raw: { width: N, height: N, channels: 4 } }).png({ compressionLevel: 9 }).toFile(`${OUT}/grain.png`);
console.log(`${OUT}/grain.png  ${(g.size / 1024) | 0} KB`);
