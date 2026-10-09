# Handover and open work

Last updated: 7 October 2026. The site is live at https://events.theaugustdispatch.com with all five build phases done. This file lists what is still open, in the order it matters.

## 1. Do before announcing the event (August)

- [x] **Supabase redirect URL for the live site.** `https://events.theaugustdispatch.com/admin` is allowed (confirmed 7 October 2026), so the admin sign-in link works on the live site.
- [ ] **Supabase redirect URL for local use (optional).** `http://localhost:3000/admin` is not in the list yet. It is only needed to sign in to `/admin` on a local dev server.
- [ ] **Run the referral migration.** Paste `supabase/migrations/0002_referrals.sql` into the Supabase SQL editor and run it. Until then registrations still work, but referrals are not recorded and `/admin` shows none.
- [ ] **Test a referral.** After the migration, register through someone's share link (`/going/...`, then "Save your seat") and check `/admin` shows "Referred by" on the new row and "Referred 1" on the sharer.
- [ ] **Test a real registration on the live site.** Submit the form, then check: the success screen shows an AI idea, the row appears in Supabase, and the "One step left" email arrives and looks right, including the share card near the bottom.
- [ ] **Test "Mark as paid".** Sign in at `/admin`, mark your test row as paid, and check the "Your seat is confirmed" email and its calendar invite.
- [ ] **Delete your own test rows** with the Delete button in `/admin`. The two original test rows were removed on 7 October 2026.

## 2. Content still needed from August

- [ ] **Setup checklist.** The confirmation email promises one but does not include it. Add it to the Code node of the "Seat confirmed" n8n workflow, or to `content/event.ts` and the payload.
- [ ] **White-text Venture Nest logo.** The current file has dark text, so the footer shows it on a white plate.
- [ ] **Showcase site URL.** `showcaseUrl` in `content/event.ts` is `null`.
- [ ] **Confirm two derived links** in `content/event.ts`: the WhatsApp link (`wa.me/233207926546`) and the Google Maps link built from the plus code.

## 3. Decisions waiting on August

| Decision | Context |
|---|---|
| Day-before reminders | Not built. They need the Supabase service key stored as a credential in n8n. Needs a yes. |
| Email sender address | Emails go out through the existing Gmail credential, shown as "The AI Build Shop", replies to theteam@augustwheel.com. Sending from theteam@ itself needs its own n8n credential. |
| Future events | TABS 1.0 is the home page. Before a second event, move it to its own address (for example `/tabs-1-0`) and make the home page a list. Worth doing before links are shared widely. |
| Public repo contents | The repo is public and includes `n8n/` (server address, webhook paths, workflow IDs; no secrets) and 13 MB of `assets/drafts/`. Remove them or make the repo private if preferred. |
| Own Supabase project | The current project is shared with another site, so login users are shared too. |
| Woman illustration | Her kente stole is large, more than the "tiny accents" in the brand brief. Can be regenerated. |
| New speakers | Sam Kwabena A. Yeboah and Joelon Johnson were added from their LinkedIn profiles. The schedule says Sam gives a welcome for Venture Nest on 7 Nov and Joelon a guest talk on 14 Nov. Confirm the bios with them and whether they attend in person. |
| Deploying small changes | The last wording change was deployed without asking first. Say if each deploy should be approved. |

## 4. Never verified

- A real phone, especially a mid-range Android (only desktop emulation was used).
- The reduced-motion version of the page.
- The admin table on screen while signed in (only its API was tested).
- The chat widget on a desktop-width screen since the avatar was added.
- The compact header on a desktop-width screen (checked at phone size only).
- How the two emails look in a mail client.
- Lighthouse against the live address. Local production build, mobile: Accessibility, Best practices and SEO 100; Performance 87 to 88 in the default simulated mode (target 90) and 98 with throttling actually applied.
- Whether the footer line drawing reads as the Black Star Gate.
- The speaker lanyards on a real touchscreen. Dragging was tested with scripted pointer events in desktop emulation only.
- Google Analytics receiving hits. The tag (`G-FYJ7X23G8Y`, in `app/layout.tsx`) is in the production build output but has not been checked in GA's Realtime view.

## 5. Not built

- **Seats counter and waitlist.** Left out at August's request. The static "40 seats" line remains.
- **Reminder workflow.** See decisions above.
- **WhatsApp messages.** Payloads carry a `channels.whatsapp` block, switched off. After Meta approval, flip `enabled` in `lib/n8n.ts` and fill the placeholder node in each workflow.
- **Share signing key.** Share links are signed with a key derived from `SUPABASE_SERVICE_ROLE_KEY`. Rotating that key makes existing share links return "not found".
- **Meta Pixel.** Not installed. Needs a Pixel ID from August.
- **Analytics events and consent.** Google Analytics counts page views only, on the live site only (`VERCEL_ENV=production`), and on every route including `/admin`. No registration conversion event and no cookie notice.
- **Paystack.** Payment details are isolated in `lib/payment.ts` for this.
- **Undo for "Mark as paid".** Reversing a mistake means editing the row in Supabase.

## 6. Known limits

- Rate limits (form, chat, admin sign-in) are held in memory per server instance, so on Vercel they slow bursts rather than guarantee a cap.
- "Start a new chat" gives a visitor a fresh 12 questions; the 20-per-ten-minutes limit is the real bound.
- Hero images are 2x upscales of 1344 px drafts and are slightly soft on large retina screens. Higgsfield can upscale them properly.

## 7. What is running where

| Thing | Where |
|---|---|
| Site | Vercel project `events-theaugustdispatch` (account `augustwheel-8319`) |
| DNS | GoDaddy, `A` record `events` to Vercel |
| Database | Supabase table `public.registrations` (shared project) |
| Emails | n8n.augustwheel.com: "TABS 1.0 — New registration" (`I0cXLW6maNCwi7XP`) and "TABS 1.0 — Seat confirmed" (`rhuxUfwEF9oxbReK`) |
| AI | Claude API, model from `ANTHROPIC_MODEL` (default `claude-haiku-4-5`) |
| Images | Generated with Higgsfield; sources in `assets/drafts/` |

Webhook payloads: [n8n-webhooks.md](n8n-webhooks.md).
