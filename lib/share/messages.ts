import { event } from "@/content/event";

// Pre-written text for the share buttons. Every fact comes from content/event.ts.

/** For visitors sharing the event itself. */
export const eventShareText = `${event.name}: four hands-on Saturdays in Accra, ${event.dates.short}. ${event.tagline}`;

/** For someone who has registered, sharing their own card. */
export const goingShareText = `I'm building my own website with AI at ${event.name}, ${event.dates.short} at ${event.venue.name}, Accra. Come and build yours too.`;
