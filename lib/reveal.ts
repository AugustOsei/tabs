import type { CSSProperties } from "react";

/** Props for a scroll-in reveal (fade, rise, blur clearing). See RevealObserver. */
export function reveal(delayMs = 0) {
  return {
    "data-reveal": "",
    style: { "--d": `${delayMs}ms` } as CSSProperties,
  };
}
