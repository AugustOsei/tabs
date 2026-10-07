import Icon, { type IconName } from "@/components/Icon";
import { event } from "@/content/event";
import { reveal } from "@/lib/reveal";
import Section from "./Section";

const icons: IconName[] = ["briefcase", "badge", "cap", "spark"];

export default function WhoItsFor() {
  const { groups, callout } = event.audience;
  return (
    <Section id="who" tab="who-its-for" title="Who it's for">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group, i) => (
          <li
            key={group}
            {...reveal(i * 90)}
            className="group relative overflow-hidden rounded-2xl rounded-tl-none border border-white/12 bg-navy-800 p-6 pt-7 transition-colors hover:border-gold/70"
          >
            <span aria-hidden="true" className="absolute left-0 top-0 h-1.5 w-16 bg-gold" />
            <span className="grid size-14 place-items-center rounded-xl border-2 border-gold/70 text-gold transition-transform duration-300 group-hover:-translate-y-1">
              <Icon name={icons[i]} className="size-7" />
            </span>
            <p className="mt-6 font-display text-xl font-semibold leading-snug">{group}</p>
            <span aria-hidden="true" className="mt-6 block font-mono text-xs text-mist/45">
              0{i + 1}
            </span>
          </li>
        ))}
      </ul>

      <div
        {...reveal(120)}
        className="relative mt-8 flex flex-col gap-4 overflow-hidden rounded-2xl bg-gold px-6 py-7 text-navy sm:flex-row sm:items-center sm:justify-between sm:px-10"
      >
        <p className="font-display text-2xl font-extrabold leading-tight sm:text-4xl">{callout}</p>
        {/* Arrow cursor, the brand motif */}
        <svg viewBox="0 0 32 47" aria-hidden="true" className="h-14 shrink-0 self-end sm:h-20 sm:self-auto">
          <path d="M0 0 L0 40 L10.5 30.5 L17.5 47 L25 43.8 L18 27.5 L32 27.5 Z" fill="#0D1B2A" />
        </svg>
      </div>
    </Section>
  );
}
