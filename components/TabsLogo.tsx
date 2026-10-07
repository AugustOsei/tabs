import type { ReactNode } from "react";

type Props = {
  className?: string;
  /** Blink the gold text cursor. */
  blink?: boolean;
  /** Extra SVG drawn in the logo's coordinate space (viewBox 0 0 506 296). */
  children?: ReactNode;
};

// Mirrors /public/assets/tabs-logo.svg. Parts carry class names so the hero
// timeline can animate them.
export default function TabsLogo({ className, blink = true, children }: Props) {
  return (
    <svg
      viewBox="0 0 506 296"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="The AI Build Shop, TABS 1.0"
      className={className}
      overflow="visible"
    >
      <path
        className="logo-tab-fill"
        d="M10 56 L10 14 Q10 4 20 4 L170 4 L192 28 L192 56 Z"
        fill="#F5C518"
        opacity="0"
      />
      <path
        d="M10 280 L10 14 Q10 4 20 4 L170 4 L192 28 L486 28 Q496 28 496 38 L496 280 Q496 290 486 290 L20 290 Q10 290 10 280 Z"
        fill="none"
        stroke="#F5C518"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <line x1="10" y1="56" x2="496" y2="56" stroke="#F5C518" strokeWidth="7" />
      <text
        className="logo-tab-text"
        x="34"
        y="44"
        fontFamily="var(--font-jetbrains), monospace"
        fontWeight="700"
        fontSize="17"
        fill="#fff"
        letterSpacing="1.5"
      >
        TABS 1.0
      </text>
      <circle cx="440" cy="42" r="5.5" fill="#F5C518" />
      <circle cx="459" cy="42" r="5.5" fill="#F5C518" />
      <circle cx="478" cy="42" r="5.5" fill="#F5C518" />
      <text
        x="38"
        y="152"
        fontFamily="var(--font-bricolage), sans-serif"
        fontWeight="800"
        fontSize="80"
        fill="#fff"
        letterSpacing="-2"
      >
        The AI
      </text>
      <text
        x="38"
        y="238"
        fontFamily="var(--font-bricolage), sans-serif"
        fontWeight="800"
        fontSize="80"
        fill="#fff"
        letterSpacing="-2"
      >
        Build Shop
      </text>
      <rect
        className={blink ? "logo-cursor logo-cursor-blink" : "logo-cursor"}
        x="452"
        y="180"
        width="12"
        height="62"
        fill="#F5C518"
      />
      {children}
    </svg>
  );
}
