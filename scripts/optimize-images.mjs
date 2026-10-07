// Builds the web-ready hero images from the source PNGs in assets/drafts.
// Run: npm run images
import sharp from "sharp";
import { stat } from "node:fs/promises";

const SRC = "assets/drafts";
const OUT = "public/assets";

// The 2x widths are Lanczos upscales of the 1x source. Replace the sources with
// true high-resolution art when available and re-run.
const jobs = [
  { src: "hero-desktop-src.png", name: "hero-desktop", widths: [1344, 2688] },
  { src: "hero-mobile-src.png", name: "hero-mobile", widths: [752, 1504] },
];

for (const { src, name, widths } of jobs) {
  for (const width of widths) {
    const base = sharp(`${SRC}/${src}`).resize({ width, kernel: "lanczos3" });
    const targets = [
      [`${OUT}/${name}-${width}.avif`, base.clone().avif({ quality: 55, effort: 7 })],
      [`${OUT}/${name}-${width}.webp`, base.clone().webp({ quality: 78, effort: 6 })],
    ];
    for (const [file, pipeline] of targets) {
      await pipeline.toFile(file);
      const { size } = await stat(file);
      console.log(`${file}  ${(size / 1024).toFixed(0)} KB`);
    }
  }
}
