import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ShareButtons from "@/components/share/ShareButtons";
import TabsLogo from "@/components/TabsLogo";
import { event } from "@/content/event";
import { goingShareText } from "@/lib/share/messages";
import { cardPath, readShareToken, sharePath } from "@/lib/share/token";

// A registered person's share page: their card, and a way for friends to join.

export async function generateMetadata({ params }: PageProps<"/going/[token]">): Promise<Metadata> {
  const { token } = await params;
  const card = readShareToken(token);
  if (!card) return { title: `Not found | ${event.name}`, robots: { index: false, follow: false } };

  const title = `${card.name} is building at ${event.name}`;
  const description = `${event.dates.label}, ${event.time.short} at ${event.venue.name}, Accra. ${event.tagline}`;
  const image = { url: cardPath(token, "wide"), width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: sharePath(token) },
    openGraph: { type: "website", url: sharePath(token), siteName: event.name, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

async function Going({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const card = readShareToken(token);
  if (!card) notFound();

  const facts = [event.dates.label, event.time.label, `${event.venue.name}, Osu, Accra`, `${event.price.label}. ${event.price.covers}`];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
      {/* eslint-disable-next-line @next/next/no-img-element -- generated per person by the card route */}
      <img
        src={cardPath(token, "wide")}
        alt={`${card.name} is building at ${event.name}`}
        width={1200}
        height={630}
        className="w-full rounded-2xl border border-white/12"
      />
      <div>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {card.name} is going. <span className="text-gold">Save your seat too.</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-mist/90">{event.supportingLine}</p>
        <ul className="mt-6 space-y-2 font-mono text-sm text-gold">
          {facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href="/#register" className="rounded-full bg-gold px-7 py-3.5 font-display text-lg font-extrabold text-navy">
            Save your seat
          </Link>
          <Link href="/" className="text-gold underline underline-offset-4">
            See the full programme
          </Link>
        </div>

        <h2 className="mt-10 border-t border-white/12 pt-6 font-mono text-xs uppercase tracking-widest text-gold">Share this card</h2>
        <ShareButtons
          className="mt-4"
          url={`${event.url}${sharePath(token)}`}
          text={goingShareText}
          image={{ src: cardPath(token, "square"), fileName: "im-building-at-the-ai-build-shop.png" }}
        />
      </div>
    </div>
  );
}

export default function GoingPage({ params }: PageProps<"/going/[token]">) {
  return (
    <div className="min-h-screen px-5 py-8 sm:px-10">
      <header className="mx-auto max-w-6xl">
        <Link href="/" aria-label={`${event.name} home`} className="inline-block">
          <TabsLogo blink={false} className="h-16 w-auto" />
        </Link>
      </header>
      <main className="mx-auto mt-10 max-w-6xl sm:mt-16">
        <Suspense fallback={<p className="py-24 text-center font-mono text-sm text-mist/60">Loading...</p>}>
          <Going params={params} />
        </Suspense>
      </main>
    </div>
  );
}
