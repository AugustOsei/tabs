# n8n webhooks

The site posts JSON to n8n. Set the URLs in `.env.local` (see `.env.example`).
If `N8N_WEBHOOK_SECRET` is set, every request carries it in an
`X-Webhook-Secret` header so the flow can reject other callers.

A webhook that fails or times out (8 seconds) is logged on the server and never
blocks the registration. The payload builders live in `lib/n8n.ts`.

## 1. New registration

- **Env:** `N8N_WEBHOOK_REGISTRATION_URL`
- **Sent:** once, right after the row is saved and the AI idea is generated.
- **Flow:** "TABS 1.0 — New registration" on n8n.augustwheel.com (id `I0cXLW6maNCwi7XP`, webhook path `/webhook/tabs-registration`). It checks the secret header, then emails the person their AI idea and the payment details through the "Gmail account" credential, with replies going to the event contact email. A copy without the secret is in `n8n/tabs-new-registration.json`.

```json
{
  "event_type": "registration.created",
  "version": 1,
  "occurred_at": "2026-10-07T12:30:05.120Z",
  "registration": {
    "id": "8f0c6a3e-2b1d-4c7e-9a55-0d6f3b2a1c44",
    "created_at": "2026-10-07T12:30:02.481Z",
    "full_name": "Ama Mensah",
    "first_name": "Ama",
    "whatsapp": "+233241234567",
    "email": "ama@example.com",
    "occupation": "entrepreneur",
    "site_topic": "My catering business and the events I have cooked for",
    "ai_experience": "some",
    "heard_from": "A friend",
    "ai_idea": "Two or three sentences, or null if the idea could not be generated.",
    "payment_status": "pending",
    "paid_at": null
  },
  "channels": {
    "email": { "enabled": true, "to": "ama@example.com" },
    "whatsapp": { "enabled": false, "to": "+233241234567" }
  },
  "event": {
    "name": "The AI Build Shop",
    "edition": "TABS 1.0",
    "url": "https://events.theaugustdispatch.com",
    "dates": ["2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28"],
    "dates_label": "Saturdays 7, 14, 21 and 28 November 2026",
    "start_time": "11:00",
    "end_time": "14:00",
    "timezone": "Africa/Accra",
    "venue_name": "Venture Nest",
    "venue_address": "HR4F+WR6, Klannaa St, Osu, Accra",
    "venue_maps_url": "https://www.google.com/maps/search/?api=1&query=HR4F%2BWR6%20Accra",
    "contact_whatsapp": "0207926546",
    "contact_email": "theteam@augustwheel.com"
  },
  "payment": {
    "provider": "manual_momo",
    "amount": 200,
    "currency": "GHS",
    "amountLabel": "GHS 200",
    "method": "Mobile Money",
    "number": "0597580640",
    "accountName": "Daniel Kwaku Merki",
    "reference": "Ama Mensah",
    "referenceNote": "Use your full name as the reference.",
    "confirmationNote": "Your seat is confirmed once payment is received.",
    "refundPolicy": "Payments are non-refundable."
  }
}
```

### Field notes

- `occupation` is one of `entrepreneur`, `worker`, `student`, `other`.
- `ai_experience` is one of `none`, `some`, `regular`.
- `whatsapp` is always E.164 (`+233...` for Ghana numbers).
- `heard_from` and `ai_idea` can be `null`. Give the email a fallback line for a missing idea.

### Adding WhatsApp later

`channels` has one entry per delivery channel. In n8n, put an IF node on
`channels.whatsapp.enabled` after the webhook and hang the WhatsApp branch off
it. When Meta Business verification is approved, flip `enabled` to `true` in
`lib/n8n.ts`; the email branch does not change.

## 2. Marked as paid

- **Env:** `N8N_WEBHOOK_PAID_URL`
- **Sent:** once, when "Mark as paid" is clicked on `/admin`. A row that is already paid never sends again.
- **Flow:** "TABS 1.0 — Seat confirmed" on n8n.augustwheel.com (id `rhuxUfwEF9oxbReK`, webhook path `/webhook/tabs-paid`). It checks the secret header, then emails "Your seat is confirmed" with a calendar invite (`the-ai-build-shop.ics`, one entry per Saturday) and the what-to-bring list. A copy without the secret is in `n8n/tabs-seat-confirmed.json`.

The payload has exactly the same shape as the new-registration one, with these differences:

```json
{
  "event_type": "registration.paid",
  "registration": {
    "payment_status": "paid",
    "paid_at": "2026-10-20T09:14:55.031Z"
  }
}
```

Both payloads also carry `event.what_to_bring` (a list of strings) and `event.setup_checklist_note`.

The setup checklist itself is not in the email yet. When the content is ready, add it to the Code node in the flow (or to `content/event.ts` and the payload).

## 3. Reminders the day before each Saturday

These need no webhook from the site. Run them from an n8n Schedule trigger and
read paid registrations from Supabase with the service role key.
