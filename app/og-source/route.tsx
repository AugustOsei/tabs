import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { event } from "@/content/event";

// Source for the link-preview image (app/opengraph-image.png): the logo on navy.
// The PNG is committed so the live site serves a static file. To regenerate it,
// run the dev server, open /og-source and save the result over the PNG.
const size = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

// The logo is drawn at 1.5x its 506 x 296 viewBox.
const S = 1.5;
const GOLD = "#F5C518";

export async function GET() {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });

  const [display, displaySemi, mono] = await Promise.all([
    font("bricolage-grotesque-latin-800-normal.woff"),
    font("bricolage-grotesque-latin-600-normal.woff"),
    font("jetbrains-mono-latin-700-normal.woff"),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0D1B2A" }}>
        <div style={{ position: "relative", display: "flex", width: 506 * S, height: 296 * S }}>
          <svg width={506 * S} height={296 * S} viewBox="0 0 506 296" style={{ position: "absolute", left: 0, top: 0 }}>
            <path
              d="M10 280 L10 14 Q10 4 20 4 L170 4 L192 28 L486 28 Q496 28 496 38 L496 280 Q496 290 486 290 L20 290 Q10 290 10 280 Z"
              fill="none"
              stroke={GOLD}
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <line x1="10" y1="56" x2="496" y2="56" stroke={GOLD} strokeWidth="7" />
            <circle cx="440" cy="42" r="5.5" fill={GOLD} />
            <circle cx="459" cy="42" r="5.5" fill={GOLD} />
            <circle cx="478" cy="42" r="5.5" fill={GOLD} />
            <rect x="452" y="180" width="12" height="62" fill={GOLD} />
          </svg>
          <div style={{ position: "absolute", left: 34 * S, top: 27 * S, fontFamily: "JetBrains Mono", fontSize: 17 * S, letterSpacing: 1.5 * S, color: "#fff", lineHeight: 1 }}>
            {event.edition}
          </div>
          <div style={{ position: "absolute", left: 38 * S, top: 84 * S, display: "flex", flexDirection: "column", fontFamily: "Bricolage", fontWeight: 800, fontSize: 80 * S, letterSpacing: -2 * S, color: "#fff", lineHeight: 1.075 }}>
            <span>The AI</span>
            <span>Build Shop</span>
          </div>
        </div>
        <div style={{ marginTop: 34, fontFamily: "Bricolage", fontWeight: 600, fontSize: 38, color: GOLD }}>{event.tagline}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: display, weight: 800, style: "normal" },
        { name: "Bricolage", data: displaySemi, weight: 600, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 700, style: "normal" },
      ],
    },
  );
}
