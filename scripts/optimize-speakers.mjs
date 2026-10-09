// Crops the speaker photos in assets/drafts to square headshots and exports web sizes.
// Run: npm run speakers
import sharp from "sharp";

const SRC = "assets/drafts";
const OUT = "public/assets";
const SIZE = 320;

// `crop` is the square region of the source to keep; omit it to use the whole photo.
const jobs = [
  { src: "speaker-daniel-src.png", name: "speaker-daniel-merki" },
  { src: "speaker-augustine-src.png", name: "speaker-augustine-osei", crop: { left: 290, top: 0, width: 820, height: 820 } },
  { src: "speaker-sam-src.png", name: "speaker-sam-yeboah" },
  { src: "speaker-joelon-src.png", name: "speaker-joelon-johnson" },
];

for (const { src, name, crop } of jobs) {
  let image = sharp(`${SRC}/${src}`);
  if (crop) image = image.extract(crop);
  const file = `${OUT}/${name}-${SIZE}.webp`;
  const info = await image.resize(SIZE, SIZE, { fit: "cover" }).webp({ quality: 82, effort: 6 }).toFile(file);
  console.log(`${file}  ${info.width}x${info.height}  ${(info.size / 1024) | 0} KB`);
}
