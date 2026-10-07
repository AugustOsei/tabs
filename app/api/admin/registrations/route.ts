import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { data, error } = await admin.supabase
    .from("registrations")
    .select("id, created_at, full_name, whatsapp, email, occupation, site_topic, ai_experience, heard_from, ai_idea, payment_status, paid_at, notes")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] list failed", error);
    return NextResponse.json({ ok: false, message: "Could not load registrations." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, registrations: data }, { headers: { "Cache-Control": "no-store" } });
}
