import { event } from "@/content/event";
import PersonRotator from "./PersonRotator";

const facts = [
  { label: "Dates", value: event.dates.short },
  { label: "Time", value: event.time.short },
  { label: "Venue", value: `${event.venue.name}, Osu, Accra` },
  { label: "Price", value: event.price.label },
];

const ticker = [
  `${event.seats.total} seats, ${event.seats.policy.toLowerCase()}`,
  event.audience.callout,
  `${event.price.label} for ${event.price.covers.toLowerCase()}`,
  event.dates.label,
  `${event.venue.name}, Osu, Accra`,
  event.time.label,
];

// "Don't just learn about AI." / "Build with it."
const taglineParts = event.tagline.split(/(?<=\.)\s+/);

const sparkles = [
  "left-[4%] top-[18%]",
  "left-[46%] top-[11%]",
  "left-[31%] top-[86%]",
  "right-[3%] top-[47%]",
  "right-[38%] top-[74%]",
];

const people = [
  { id: "man", ratio: [760, 964], alt: "Illustration of a smiling man in a gold overshirt holding a laptop." },
  { id: "woman", ratio: [760, 1021], alt: "Illustration of a smiling woman with braids in a navy blazer holding a laptop." },
];

function Sparkle({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`title-sparkle absolute size-3 text-gold ${className}`}>
      <path d="M10 0 L11.6 8.4 L20 10 L11.6 11.6 L10 20 L8.4 11.6 L0 10 L8.4 8.4 Z" fill="currentColor" />
    </svg>
  );
}

// Two beats, driven by the hero timeline:
// 1. Poster: the person in full, the title large behind and above them.
// 2. Details: the person slides right and is cropped to head and shoulders
//    while the copy and facts form on the left.
export default function TitleBlock() {
  return (
    <div className="hero-title overflow-hidden" data-person="man">
      <PersonRotator />

      {/* Backdrop: blueprint lines, sparkles, grain */}
      <div data-in="fade" aria-hidden="true" className="absolute inset-0">
        <div className="title-grid absolute inset-0" />
        {sparkles.map((pos) => (
          <Sparkle key={pos} className={pos} />
        ))}
        <div className="title-grain absolute inset-0" />
      </div>

      {/* Beat 1: poster title */}
      <div className="absolute inset-x-0 top-[5.25rem] z-10 px-4 text-center wide:top-[max(6.5rem,10svh)]">
        <h1 className="title-poster font-display text-[min(17vw,13svh)] font-extrabold leading-[0.92] tracking-[-0.03em] wide:text-[min(13vw,17svh)]">
          <span data-in="rise" className="block">
            The AI
          </span>
          <span data-in="rise" className="block whitespace-nowrap">
            Build Shop
          </span>
        </h1>
        <p
          data-in="rise"
          aria-hidden="true"
          className="title-caption mt-3 font-display text-xl font-semibold leading-tight text-gold wide:hidden"
        >
          {taglineParts.map((part) => (
            <span key={part} className="block">
              {part}
            </span>
          ))}
        </p>
      </div>
      {taglineParts.map((part, i) => (
        <p
          key={part}
          data-in="rise"
          aria-hidden="true"
          className={`title-caption absolute bottom-[30%] z-10 hidden w-[20vw] font-display text-[clamp(1.1rem,2vw,2rem)] font-semibold leading-tight text-gold wide:block ${
            i === 0 ? "left-[6vw]" : "right-[6vw] text-right"
          }`}
        >
          {part}
        </p>
      ))}

      {/* The person */}
      <div className="title-figure-move absolute bottom-0 left-1/2 z-20 aspect-[760/964] h-[55svh] -translate-x-1/2 wide:h-[min(60svh,50vw)]">
        <div data-in="figure" className="absolute inset-0">
          {people.map((p) => (
            <picture key={p.id} className={`person-${p.id} absolute inset-0`}>
              <source
                type="image/avif"
                srcSet={`/assets/person-${p.id}-400.avif 400w, /assets/person-${p.id}-760.avif 760w`}
                sizes="(min-aspect-ratio: 4/5) 60vw, 100vw"
              />
              <source
                type="image/webp"
                srcSet={`/assets/person-${p.id}-400.webp 400w, /assets/person-${p.id}-760.webp 760w`}
                sizes="(min-aspect-ratio: 4/5) 60vw, 100vw"
              />
              <img
                src={`/assets/person-${p.id}-760.webp`}
                alt={p.alt}
                width={p.ratio[0]}
                height={p.ratio[1]}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="size-full object-cover object-top"
              />
            </picture>
          ))}
        </div>
      </div>

      {/* Beat 2: details */}
      <div className="pointer-events-none absolute inset-0 z-30 wide:left-[5vw] wide:right-auto wide:flex wide:w-[40vw] wide:flex-col wide:justify-center wide:pb-10 wide:pt-24">
        <p
          data-in="detail"
          className="absolute left-5 top-24 w-[44%] font-display text-[1.35rem] font-semibold leading-[1.15] text-gold wide:static wide:w-auto wide:text-[clamp(1.5rem,2.8vw,2.75rem)] wide:leading-[1.1]"
        >
          {event.tagline}
        </p>
        <div
          data-in="sheet"
          className="pointer-events-auto absolute inset-x-0 bottom-0 border-t-2 border-gold bg-navy px-5 pb-14 pt-5 wide:static wide:mt-5 wide:border-0 wide:bg-transparent wide:p-0"
        >
          <p
            data-in="detail"
            className="max-w-[34rem] text-[13.5px] leading-normal text-mist/90 squat:hidden wide:text-[clamp(0.95rem,1.25vw,1.125rem)] wide:leading-relaxed short:hidden"
          >
            {event.supportingLine}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 wide:mt-6 wide:block wide:border-b wide:border-white/15">
            {facts.map((f) => (
              <div
                key={f.label}
                data-in="detail"
                className="wide:flex wide:items-baseline wide:gap-6 wide:border-t wide:border-white/15 wide:py-2.5"
              >
                <dt className="font-mono text-[10px] uppercase tracking-widest text-gold wide:w-16 wide:shrink-0 wide:text-[11px]">
                  {f.label}
                </dt>
                <dd className="text-[13px] font-semibold leading-snug wide:font-display wide:text-[clamp(1rem,1.5vw,1.375rem)]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
          <div data-in="detail" className="mt-4 wide:mt-7">
            <a
              href="#register"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 font-display text-base font-extrabold text-navy transition-transform hover:scale-[1.03] wide:py-3.5 wide:text-lg"
            >
              Save your seat
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Facts ticker */}
      <div
        data-in="fade"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-40 overflow-hidden border-t border-white/15 bg-navy py-2.5"
      >
        <div className="title-ticker flex w-max font-mono text-[11px] uppercase tracking-widest text-mist/80 sm:text-xs">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0">
              {ticker.map((item) => (
                <li key={item} className="flex items-center whitespace-nowrap">
                  <span className="mx-5 text-gold">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
