import HeaderScrollState from "@/components/HeaderScrollState";
import TabsLogo from "@/components/TabsLogo";

// Fixed site header.
// Over the hero it is transparent with a large logo. The logo stays hidden
// while the room scene plays (it is on the board there) and fades in once the
// title appears. After the hero has scrolled away it becomes a slim solid bar
// with a smaller logo, so page content passes cleanly underneath it.
export default function Header() {
  return (
    <header
      data-site-header
      data-compact="false"
      className="group pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-transparent px-4 py-3 transition-[background-color,border-color,padding] duration-300 data-[compact=true]:pointer-events-auto data-[compact=true]:border-white/12 data-[compact=true]:bg-navy data-[compact=true]:py-2 sm:px-6 sm:py-4 sm:data-[compact=true]:py-2"
    >
      <HeaderScrollState />
      <a
        href="#top"
        aria-label="The AI Build Shop, back to top"
        className="site-logo pointer-events-auto rounded-xl bg-navy/90 p-1.5 transition-[padding] duration-300 group-data-[compact=true]:bg-transparent group-data-[compact=true]:p-0"
      >
        <TabsLogo
          blink={false}
          className="h-12 w-auto transition-[height] duration-300 group-data-[compact=true]:h-9 sm:h-[4.5rem] sm:group-data-[compact=true]:h-10"
        />
      </a>
      <a
        href="#register"
        className="pointer-events-auto rounded-full bg-gold px-5 py-2.5 font-display text-sm font-extrabold text-navy shadow-[0_6px_24px_rgb(13_27_42/0.35)] ring-2 ring-navy transition-[transform,padding] duration-300 hover:scale-105 group-data-[compact=true]:py-1.5 group-data-[compact=true]:shadow-none sm:text-base sm:group-data-[compact=true]:text-sm"
      >
        Register
      </a>
    </header>
  );
}
