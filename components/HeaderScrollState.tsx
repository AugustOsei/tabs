"use client";

import { useEffect } from "react";

// Switches the header to its compact bar once the hero has scrolled away.
export default function HeaderScrollState() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const hero = document.getElementById("top");
    if (!header || !hero) return;
    const io = new IntersectionObserver(([entry]) => {
      header.dataset.compact = String(!entry.isIntersecting);
    }, { rootMargin: "-72px 0px 0px 0px" });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return null;
}
