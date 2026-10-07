import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { event } from "@/content/event";
import "./globals.css";

// next/font downloads, subsets and self-hosts these at build time.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "800"],
  display: "swap",
});

// Body text is not on screen in the first frame (only the logo and the Register
// button are), so this font loads when first used instead of being preloaded.
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const title = `${event.name} (${event.edition}) | ${event.tagline}`;
const description = `Four hands-on Saturdays in Accra: ${event.dates.short}, ${event.time.short} at ${event.venue.name}, Osu. Build your own live website with AI. ${event.price.label}. ${event.audience.callout}`;

export const metadata: Metadata = {
  metadataBase: new URL(event.url),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: event.name,
    title: `${event.name} (${event.edition})`,
    description,
    locale: "en_GH",
  },
  twitter: { card: "summary_large_image", title: `${event.name} (${event.edition})`, description },
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} antialiased`}
    >
      <body>
        <noscript>
          <style>{`.hero-title [data-in] { opacity: 1 !important; } .site-logo { opacity: 1 !important; visibility: visible !important; } .title-figure-move { --p: 1; } .title-poster { opacity: 0.07; } .hero-title .title-caption { display: none; } [data-reveal] { opacity: 1 !important; transform: none !important; filter: none !important; }`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
