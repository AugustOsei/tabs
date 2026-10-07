import Icon, { type IconName } from "@/components/Icon";
import { event } from "@/content/event";
import { reveal } from "@/lib/reveal";
import Section from "./Section";

const bringIcons: IconName[] = ["laptop", "plug", "account", "phone"];
const includedIcons: IconName[] = ["calendar", "window", "star", "chat"];

function WindowCard({
  tab,
  title,
  items,
  icons,
  note,
  delay,
}: {
  tab: string;
  title: string;
  items: readonly string[];
  icons: IconName[];
  note?: string;
  delay: number;
}) {
  return (
    <div {...reveal(delay)} className="overflow-hidden rounded-2xl border border-white/12 bg-navy-800">
      <div className="flex items-center justify-between border-b border-white/12 bg-navy px-5 py-3">
        <span className="font-mono text-xs text-gold">{tab}</span>
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2 rounded-full bg-gold/80" />
          <span className="size-2 rounded-full bg-gold/80" />
          <span className="size-2 rounded-full bg-gold/80" />
        </span>
      </div>
      <div className="p-6 sm:p-8">
        <h3 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h3>
        <ul className="mt-6 space-y-4">
          {items.map((item, i) => (
            <li key={item} className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-gold/60 text-gold">
                <Icon name={icons[i]} />
              </span>
              <span className="text-lg leading-snug text-mist/95">{item}</span>
            </li>
          ))}
        </ul>
        {note && <p className="mt-6 border-l-2 border-gold pl-4 text-sm text-mist/75">{note}</p>}
      </div>
    </div>
  );
}

export default function Practical() {
  return (
    <Section id="practical" tab="practical" title="Practical">
      <div className="grid gap-6 md:grid-cols-2">
        <WindowCard tab="what-to-bring" title="What to bring" items={event.bring} icons={bringIcons} delay={0} />
        <WindowCard
          tab="whats-included"
          title="What's included"
          items={event.included}
          icons={includedIcons}
          note={event.setupChecklistNote}
          delay={120}
        />
      </div>
    </Section>
  );
}
