// Section label styled as a small browser tab, e.g. `the-four-saturdays`.
export default function TabLabel({ children }: { children: string }) {
  return (
    <p className="mb-6 inline-flex items-center gap-2 rounded-t-lg border-2 border-b-0 border-gold/70 px-3 pb-1.5 pt-2 font-mono text-xs font-medium tracking-wide text-gold">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
      {children}
    </p>
  );
}
