import Image from "next/image";
import TabsLogo from "@/components/TabsLogo";
import { event } from "@/content/event";

// Line drawing of Accra's Black Star Gate.
function BlackStarGate({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 150" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M4 144h232" />
      <path d="M30 144V58h180v86" />
      <path d="M22 58h196M26 50h188M36 50V42h168v8" />
      {/* Arches */}
      <path d="M96 144V96a24 24 0 0 1 48 0v48" />
      <path d="M48 144v-40a13 13 0 0 1 26 0v40M166 144v-40a13 13 0 0 1 26 0v40" />
      <path d="M40 72h160" />
      {/* Plinth and star */}
      <path d="M104 42V32h32v10" />
      <path d="m120 6 3.400 7.600 8.300.800-6.300 5.500 1.900 8.100-7.300-4.300-7.300 4.300 1.900-8.100-6.300-5.500 8.300-.800L120 6Z" fill="#F5C518" />
    </svg>
  );
}

export default function Footer() {
  const { contact, venue } = event;
  return (
    <footer className="relative overflow-hidden border-t border-white/12 px-5 pb-10 pt-16 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <TabsLogo blink={false} className="h-24 w-auto" />
            <p className="mt-5 max-w-xs font-display text-lg font-semibold text-gold">{event.tagline}</p>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-gold">Venue</h2>
            <address className="mt-4 space-y-1 not-italic text-mist/90">
              <p className="font-display text-lg font-semibold text-white">{venue.name}</p>
              <p>{venue.address}</p>
              <p className="text-sm text-mist/65">{venue.directionsNote}</p>
              <a href={venue.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block pt-2 text-gold underline underline-offset-4">
                Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </address>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-gold">Contact</h2>
            <ul className="mt-4 space-y-2 text-mist/90">
              <li>
                WhatsApp{" "}
                <a href={contact.whatsappUrl} className="text-gold underline underline-offset-4">
                  {contact.whatsapp}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="text-gold underline underline-offset-4">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-8 border-t border-white/12 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-5 font-mono text-xs tracking-wide text-mist/65">{event.presentedBy}</p>
            <ul className="flex flex-wrap items-center gap-6">
              {event.partners.map((p) => (
                <li key={p.name} className={p.name === "Venture Nest" ? "rounded-lg bg-white px-4 py-3" : ""}>
                  <Image src={p.logo} alt={p.name} width={p.width} height={p.height} className="h-8 w-auto" />
                </li>
              ))}
            </ul>
          </div>
          <BlackStarGate className="h-20 w-auto self-end opacity-80 sm:h-24" />
        </div>
      </div>
    </footer>
  );
}
