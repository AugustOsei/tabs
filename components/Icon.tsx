import type { ReactNode } from "react";

// Line icons in the brand style: 24px grid, 1.75 stroke, round joins.
const paths = {
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2M3 13h18M11 13v1.5h2V13" />
    </>
  ),
  badge: (
    <>
      <rect x="5" y="6" width="14" height="15" rx="2" />
      <path d="M10 6V3.5h4V6M9.5 17.5a2.5 2.5 0 0 1 5 0" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  cap: (
    <>
      <path d="M2 9.5 12 5l10 4.5L12 14 2 9.5Z" />
      <path d="M6.5 11.8V16c1.5 1.4 3.3 2 5.5 2s4-.6 5.5-2v-4.2M21 10v5" />
    </>
  ),
  spark: <path d="M12 3l1.8 5.6L19.5 10l-5.7 1.4L12 17l-1.8-5.6L4.5 10l5.7-1.4L12 3ZM19 16l.7 2 2 .5-2 .6-.7 1.9-.7-1.9-2-.6 2-.5.7-2Z" />,
  laptop: (
    <>
      <rect x="4.5" y="5" width="15" height="10.5" rx="1.5" />
      <path d="M2.5 19h19l-1.6-3.5H4.1L2.5 19Z" />
    </>
  ),
  plug: <path d="M9 3v5M15 3v5M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0V8ZM12 17v4" />,
  account: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.2 18.4a6.5 6.5 0 0 1 11.6 0" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />
    </>
  ),
  window: (
    <>
      <path d="M3 18.5V6a2 2 0 0 1 2-2h5l2 2.5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 10.5h18" />
    </>
  ),
  star: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8L12 3Z" />,
  chat: (
    <>
      <path d="M4 5.5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H10l-4 3.5v-3.500H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
      <path d="M21 9.500a2 2 0 0 1 1 1.700v5a2 2 0 0 1-2 2h-.5V21l-2.500-2" />
    </>
  ),
  link: <path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700L12 6.300M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" />,
  checklist: <path d="M4 6.500 5.500 8 8 5M4 12.500 5.500 14 8 11M4 18.500 5.500 20 8 17M11 6.500h9M11 12.500h9M11 18.500h9" />,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export default function Icon({ name, className = "size-6" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
