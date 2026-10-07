import { event } from "@/content/event";
import { getPaymentInstructions } from "@/lib/payment";

// Payloads are documented in docs/n8n-webhooks.md. Keep the two in step.

export type RegistrationRecord = {
  id: string;
  created_at: string;
  full_name: string;
  whatsapp: string;
  email: string;
  occupation: string;
  site_topic: string;
  ai_experience: string;
  heard_from: string | null;
  ai_idea: string | null;
  payment_status: "pending" | "paid";
  paid_at: string | null;
};

function basePayload(registration: RegistrationRecord) {
  return {
    version: 1,
    occurred_at: new Date().toISOString(),
    registration: {
      ...registration,
      first_name: registration.full_name.split(/\s+/)[0],
    },
    // One entry per delivery channel. WhatsApp becomes a new branch in n8n
    // once Meta Business verification is approved: flip `enabled` here.
    channels: {
      email: { enabled: true, to: registration.email },
      whatsapp: { enabled: false, to: registration.whatsapp },
    },
    event: {
      name: event.name,
      edition: event.edition,
      url: event.url,
      dates: event.dates.iso,
      dates_label: event.dates.label,
      start_time: event.time.start,
      end_time: event.time.end,
      timezone: event.time.timezone,
      venue_name: event.venue.name,
      venue_address: event.venue.address,
      venue_maps_url: event.venue.mapsUrl,
      contact_whatsapp: event.contact.whatsapp,
      contact_email: event.contact.email,
      what_to_bring: event.bring,
      setup_checklist_note: event.setupChecklistNote,
    },
    payment: getPaymentInstructions(registration.full_name),
  };
}

export function registrationCreatedPayload(registration: RegistrationRecord) {
  return { event_type: "registration.created" as const, ...basePayload(registration) };
}

export function registrationPaidPayload(registration: RegistrationRecord) {
  return { event_type: "registration.paid" as const, ...basePayload(registration) };
}

/**
 * Posts a payload to an n8n webhook. Never throws: a failed webhook is logged
 * and reported, but must not fail the registration itself.
 */
export async function postWebhook(url: string | undefined, payload: unknown): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[n8n] webhook responded ${res.status}`);
    return res.ok;
  } catch (error) {
    console.error("[n8n] webhook failed", error);
    return false;
  }
}
