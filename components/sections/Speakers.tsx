import { event } from "@/content/event";
import { reveal } from "@/lib/reveal";
import Section from "./Section";

export default function Speakers() {
  return (
    <Section id="speakers" tab="speakers" title="Speakers">
      <div className="grid gap-6 md:grid-cols-2">
        {event.speakers.map((sp, i) => (
          <article
            key={sp.id}
            {...reveal(i * 120)}
            className="relative overflow-hidden rounded-2xl border border-white/12 bg-navy-800 p-7 sm:p-9"
          >
            <span aria-hidden="true" className="absolute right-6 top-6 font-mono text-xs text-mist/40">
              speaker-0{i + 1}
            </span>
            {/* Photo in the gold ring, or the monogram when there is none */}
            <div aria-hidden={sp.photo ? undefined : true} className="relative grid size-28 place-items-center">
              <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-gold" />
              {sp.photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- small pre-optimised WebP
                <img
                  src={sp.photo}
                  alt={`Portrait of ${sp.name}`}
                  width={320}
                  height={320}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-1.5 size-[calc(100%-0.75rem)] rounded-full object-cover"
                />
              ) : (
                <>
                  <span className="absolute inset-2 rounded-full border border-dashed border-gold/50" />
                  <span className="font-display text-3xl font-extrabold text-gold">{sp.initials}</span>
                </>
              )}
            </div>
            <h3 className="mt-6 font-display text-3xl font-extrabold tracking-tight">{sp.name}</h3>
            <p className="mt-2 font-display font-semibold leading-snug text-gold">{sp.role}</p>
            <p className="mt-4 leading-relaxed text-mist/85">{sp.bio}</p>
            {sp.linkedin && (
              <a
                href={sp.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/70 px-4 py-2 font-mono text-sm text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                LinkedIn
                <span aria-hidden="true">↗</span>
                <span className="sr-only">
                  profile of {sp.name} (opens in a new tab)
                </span>
              </a>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
