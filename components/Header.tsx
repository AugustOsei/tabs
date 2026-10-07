import TabsLogo from "@/components/TabsLogo";

// Fixed site header. The logo stays hidden while the hero's room scene plays
// (the logo is on the board there) and fades in once the title appears.
export default function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
      <a
        href="#top"
        aria-label="The AI Build Shop, back to top"
        className="site-logo pointer-events-auto rounded-xl bg-navy/90 p-1.5"
      >
        <TabsLogo blink={false} className="h-12 w-auto sm:h-[4.5rem]" />
      </a>
      <a
        href="#register"
        className="pointer-events-auto rounded-full bg-gold px-5 py-2.5 font-display text-sm font-extrabold text-navy shadow-[0_6px_24px_rgb(13_27_42/0.35)] ring-2 ring-navy transition-transform hover:scale-105 sm:text-base"
      >
        Register
      </a>
    </header>
  );
}
