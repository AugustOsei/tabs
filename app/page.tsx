import ChatWidget from "@/components/chat/ChatWidget";
import Header from "@/components/Header";
import Hero from "@/components/hero/Hero";
import RevealObserver from "@/components/RevealObserver";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/sections/Footer";
import Practical from "@/components/sections/Practical";
import Register from "@/components/sections/Register";
import Schedule from "@/components/sections/Schedule";
import Speakers from "@/components/sections/Speakers";
import WhatYoullBuild from "@/components/sections/WhatYoullBuild";
import WhoItsFor from "@/components/sections/WhoItsFor";
import { event } from "@/content/event";
import { hero, MOBILE_QUERY, type HeroVariant } from "@/config/hero";

const avifSet = (v: HeroVariant) => v.widths.map((w) => `${v.image}-${w}.avif ${w}w`).join(", ");

// Structured data so search engines can show the event's dates, place and price.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationEvent",
  name: `${event.name} (${event.edition})`,
  description: event.supportingLine,
  url: event.url,
  startDate: `${event.dates.iso[0]}T${event.time.start}:00+00:00`,
  endDate: `${event.dates.iso[event.dates.iso.length - 1]}T${event.time.end}:00+00:00`,
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: event.venue.name,
    address: { "@type": "PostalAddress", streetAddress: "Klannaa St, Osu", addressLocality: "Accra", addressCountry: "GH" },
  },
  offers: { "@type": "Offer", price: event.price.amount, priceCurrency: event.price.currency, url: `${event.url}/#register`, availability: "https://schema.org/InStock" },
  organizer: { "@type": "Organization", name: event.partners[0].name },
  performer: event.speakers.map((s) => ({ "@type": "Person", name: s.name })),
};

export default function Home() {
  return (
    <>
      {/* Preload the right hero image for this viewport. */}
      <link
        rel="preload"
        as="image"
        type="image/avif"
        imageSrcSet={avifSet(hero.mobile)}
        imageSizes={hero.mobile.sizes}
        media={MOBILE_QUERY}
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        type="image/avif"
        imageSrcSet={avifSet(hero.desktop)}
        imageSizes={hero.desktop.sizes}
        media={`not ${MOBILE_QUERY}`}
        fetchPriority="high"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SmoothScroll />
      <RevealObserver />
      <Header />
      <main>
        <Hero />
        <WhatYoullBuild />
        <WhoItsFor />
        <Schedule />
        <Speakers />
        <Practical />
        <Register />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
