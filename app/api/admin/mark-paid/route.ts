import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { postWebhook, registrationPaidPayload, type RegistrationRecord } from "@/lib/n8n";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { id } = await request.json().catch(() => ({ id: null }));
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, message: "Missing registration id." }, { status: 400 });
  }

  // Only a pending row changes, so a double click cannot send two confirmations.
  const { data: row, error } = await admin.supabase
    .from("registrations")
    .update({ payment_status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("payment_status", "pending")
    .select("id, created_at, full_name, whatsapp, email, occupation, site_topic, ai_experience, heard_from, ai_idea, payment_status, paid_at")
    .maybeSingle<RegistrationRecord>();

  if (error) {
    console.error("[admin] mark-paid failed", error);
    return NextResponse.json({ ok: false, message: "Could not update the registration." }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ ok: false, message: "This registration is already marked as paid, or no longer exists." }, { status: 409 });
  }

  const webhookConfigured = !!process.env.N8N_WEBHOOK_PAID_URL;
  const webhookSent = await postWebhook(process.env.N8N_WEBHOOK_PAID_URL, registrationPaidPayload(row));
  return NextResponse.json({ ok: true, registration: row, webhookConfigured, webhookSent });
}
