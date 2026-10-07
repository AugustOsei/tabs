# TABS event site

@AGENTS.md

Start with `README.md` for the layout and commands, and `docs/HANDOVER.md` for open work, pending decisions and what has never been verified. Keep `docs/HANDOVER.md` current when work is finished or new gaps appear.

## Rules for this project

- `content/event.ts` is the single source of truth for event facts. Never put a fact in a component, email or prompt that is not in that file; leave a `TODO` and tell August instead.
- Site copy is warm, direct and confident, with no hype words and no em dashes.
- Brand: navy `#0D1B2A`, gold `#F5C518`, white, light grey `#EEF2F6`; Bricolage Grotesque (display), Instrument Sans (body), JetBrains Mono (labels only). Motif: browser windows, tabs, the gold cursor.
- Animate only transform and opacity; respect `prefers-reduced-motion`.
- Secrets live in `.env.local` and Vercel only. The repo is public.

## Gotchas

- The dev server sometimes serves stale CSS after `app/globals.css` is edited by a script. A real content change (not `touch`) or a restart fixes it.
- Next 16 here has `cacheComponents` on: route handlers must not export `runtime`.
- Tailwind v4 custom variants (`wide`, `short`, `squat`) need the block form of `@custom-variant`.
- The preview pane's desktop screenshots come back very small; phone-sized ones are readable.
- After changing the chat prompt or route, run `npm run test:chat` against the dev server.
