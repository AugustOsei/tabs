import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { event } from "@/content/event";
import { readShareToken } from "@/lib/share/token";

// The personal "I'm in" card: ?shape=wide (1200 x 630, link previews) or
// ?shape=square (1080 x 1080, WhatsApp Status and Instagram). Add &dl=1 to download.

const NAVY = "#0D1B2A";
const GOLD = "#F5C518";
const MIST = "#EEF2F6";

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

export async function GET(request: Request, { params }: RouteContext<"/going/[token]/card">) {
  const { token } = await params;
  const card = readShareToken(token);
  if (!card) return new Response("Not found", { status: 404 });

  const query = new URL(request.url).searchParams;
  const square = query.get("shape") === "square";
  const width = square ? 1080 : 1200;
  const height = square ? 1080 : 630;
  // One scale for every measurement, so both shapes share a layout.
  const u = square ? 1.3 : 1;
  const pad = square ? 64 : 44;
  // Long names shrink to stay on one line (a Bricolage 800 glyph is about 0.6em wide).
  const nameSize = Math.min((square ? 100 : 120) * u, (width - 2 * pad - 80 * u) / ((card.name.length + 1) * 0.6));

  const [display, displaySemi, mono] = await Promise.all([
    font("bricolage-grotesque-latin-800-normal.woff"),
    font("bricolage-grotesque-latin-600-normal.woff"),
    font("jetbrains-mono-latin-700-normal.woff"),
  ]);

  const facts = [event.dates.short, event.time.short, `${event.venue.name}, Accra`];

  const image = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: NAVY, padding: pad }}>
        {/* Browser window */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: `${5 * u}px solid ${GOLD}`, borderRadius: 22 * u }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `${5 * u}px solid ${GOLD}`, padding: `${14 * u}px ${24 * u}px` }}>
            <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 22 * u, letterSpacing: 1.5 * u, color: GOLD }}>{`${event.edition} / im-in`}</div>
            <div style={{ display: "flex", gap: 10 * u }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 14 * u, height: 14 * u, borderRadius: 14 * u, background: GOLD }} />
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: `${square ? 56 : 30}px ${40 * u}px ${square ? 48 : 30}px` }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "flex-end", fontFamily: "Bricolage", fontWeight: 800, fontSize: nameSize, letterSpacing: -2 * u, lineHeight: 1, whiteSpace: "nowrap", color: GOLD }}>
                <span>{card.name}</span>
                {/* The gold text cursor */}
                <div style={{ width: nameSize * 0.13, height: nameSize * 0.82, marginLeft: nameSize * 0.12, marginBottom: nameSize * 0.06, background: GOLD }} />
              </div>
              <div style={{ display: "flex", marginTop: 14 * u, fontFamily: "Bricolage", fontWeight: 600, fontSize: 40 * u, color: MIST }}>is building at</div>
              {/* The square card has room for the name on two lines, as in the logo. */}
              <div style={{ display: "flex", flexDirection: "column", marginTop: 4 * u, fontFamily: "Bricolage", fontWeight: 800, fontSize: (square ? 92 : 84) * u, letterSpacing: -2 * u, lineHeight: 1.05, color: "#fff" }}>
                {(square ? ["The AI", "Build Shop"] : [event.name]).map((line) => (
                  <div key={line} style={{ display: "flex" }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {square && <div style={{ display: "flex", marginBottom: 28, fontFamily: "Bricolage", fontWeight: 600, fontSize: 40, color: GOLD }}>{event.tagline}</div>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 * u }}>
                {facts.map((fact) => (
                  <div key={fact} style={{ display: "flex", border: `${2 * u}px solid rgba(245,197,24,0.7)`, borderRadius: 999, padding: `${8 * u}px ${18 * u}px`, fontFamily: "JetBrains Mono", fontSize: 21 * u, color: GOLD }}>
                    {fact}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", marginTop: 18 * u, fontFamily: "JetBrains Mono", fontSize: 22 * u, color: MIST }}>{new URL(event.url).host}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: "Bricolage", data: display, weight: 800, style: "normal" },
        { name: "Bricolage", data: displaySemi, weight: 600, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 700, style: "normal" },
      ],
    },
  );

  // The card for a token never changes, so it can be cached for good.
  image.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (query.get("dl")) image.headers.set("Content-Disposition", 'attachment; filename="im-building-at-the-ai-build-shop.png"');
  return image;
}
