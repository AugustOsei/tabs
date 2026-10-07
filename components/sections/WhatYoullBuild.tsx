import TabLabel from "@/components/TabLabel";
import { event } from "@/content/event";
import { reveal } from "@/lib/reveal";
import LaptopBuild from "./LaptopBuild";

export default function WhatYoullBuild() {
  const { build, learn } = event;
  return (
    <section id="build" aria-labelledby="build-title" className="relative overflow-hidden px-5 py-20 sm:px-10 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <LaptopBuild />
        <div {...reveal()}>
          <TabLabel>what-youll-build</TabLabel>
          <h2 id="build-title" className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
            What you&apos;ll build
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-mist/90">{build.summary}</p>
          <h3 className="mt-6 font-display text-2xl font-extrabold text-gold sm:text-3xl">{build.title}</h3>
          <p className="mt-3 text-lg leading-relaxed text-mist/90">{build.description}</p>
          <p className="mt-6 border-l-2 border-gold pl-4 text-mist/80">{build.showcase}</p>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl sm:mt-28">
        <h3 {...reveal()} className="mb-8 font-display text-2xl font-extrabold sm:text-3xl">You&apos;ll learn to</h3>
        <ol {...reveal(100)} className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {learn.map((item, i) => (
            <li key={item} className="flex flex-col gap-4 bg-navy p-6">
              <span className="font-mono text-sm font-bold text-gold">0{i + 1}</span>
              <span className="font-display text-lg font-semibold leading-snug">{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
