"use client";

import { useEffect, useRef } from "react";

const KEY = "tabs-person";

// Chosen once per page load, so a repeated effect run cannot flip it back.
let picked: string | null = null;

function pick() {
  if (picked) return picked;
  picked = Math.random() < 0.5 ? "man" : "woman";
  try {
    const last = localStorage.getItem(KEY);
    if (last) picked = last === "man" ? "woman" : "man";
    localStorage.setItem(KEY, picked);
  } catch {
    // Storage unavailable (private mode): the random pick stands.
  }
  return picked;
}

// Alternates the title illustration between the man and the woman on each
// visit. The title is still hidden when this runs, so there is no flash.
export default function PersonRotator() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const title = ref.current?.closest<HTMLElement>(".hero-title");
    if (!title) return;
    title.dataset.person = pick();
  }, []);

  return <span ref={ref} hidden />;
}
