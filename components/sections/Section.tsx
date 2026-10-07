import type { ReactNode } from "react";
import TabLabel from "@/components/TabLabel";
import { reveal } from "@/lib/reveal";

type Props = { id: string; tab: string; title: string; intro?: string; children: ReactNode };

export default function Section({ id, tab, title, intro, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative overflow-hidden px-5 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div {...reveal()}>
          <TabLabel>{tab}</TabLabel>
          <h2 id={`${id}-title`} className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
            {title}
          </h2>
          {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mist/85">{intro}</p>}
        </div>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
