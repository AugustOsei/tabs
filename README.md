# The AI Build Shop (TABS 1.0) event site

Event and registration site for The AI Build Shop, a four-Saturday hands-on AI course in Accra.

- **Live:** https://events.theaugustdispatch.com
- **Repo:** https://github.com/AugustOsei/tabs
- **Open work and handover notes:** [docs/HANDOVER.md](docs/HANDOVER.md)

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4, GSAP ScrollTrigger and Lenis for the hero, Supabase (Postgres) for registrations, the Claude API for the portfolio idea and the chat assistant, and n8n for emails. Hosted on Vercel.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Without Supabase keys the form runs in a preview mode that saves nothing.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` / `npm run start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run test:chat` | Chat guard-rail checks against a running server (about 45 real model calls) |
| `npm run images` | Rebuild hero images from `assets/drafts/` |
| `npm run cutouts` | Rebuild the person cutouts and the grain tile |

## Where things are

| Path | What |
|---|---|
| `content/event.ts` | **Every event fact.** The page, the emails and the chat assistant read from here only. |
| `config/hero.ts` | Hero image paths, board rectangle per breakpoint, scroll timeline stops |
| `components/hero/` | Scroll-driven hero and the two-beat title |
| `components/sections/` | Page sections, including the registration form |
| `components/chat/` | The "August" chat widget |
| `app/api/register` | Saves a registration, generates the AI idea, calls n8n |
| `app/api/chat` | Streaming assistant with its guard rails |
| `app/admin`, `app/api/admin/*` | Admin page and its API (magic link, one allowed email) |
| `lib/payment.ts` | All payment details in one module, ready for Paystack later |
| `lib/n8n.ts`, `docs/n8n-webhooks.md` | Webhook payload builders and their documentation |
| `n8n/` | Copies of the two live n8n workflows, secret removed |
| `supabase/migrations/` | The `registrations` table and its Row Level Security |
| `assets/drafts/` | Source images (not published) |

## Useful URLs

- `/?debug=board` outlines the hero board rectangle; arrow keys nudge it and the readout gives values for `config/hero.ts`.
- `/admin` is the registrations table. Sign-in links only go to `ADMIN_EMAIL`.
- `/og-source` (dev only) regenerates the link-preview image; save it over `app/opengraph-image.png`.

## Deploy

Vercel project `events-theaugustdispatch`. It is not connected to GitHub, so deploy from this folder:

```bash
vercel deploy --prod --yes
```

Environment variables live in Vercel's production settings and mirror `.env.example`. A new variable must be added in both `.env.local` and Vercel (`vercel env add NAME production`).
