import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const columns = "id, created_at, full_name, whatsapp, email, occupation, site_topic, ai_experience, heard_from, ai_idea, payment_status, paid_at, notes";
  const list = (select: string) => admin.supabase.from("registrations").select(select).order("created_at", { ascending: false });

  let { data, error } = await list(`${columns}, referred_by`);
  if (error) {
    // Before migration 0002 has been run there is no referred_by column.
    console.error("[admin] list with referrals failed, retrying without them", error);
    ({ data, error } = await list(columns));
  }

  if (error) {
    console.error("[admin] list failed", error);
    return NextResponse.json({ ok: false, message: "Could not load registrations." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, registrations: data }, { headers: { "Cache-Control": "no-store" } });
}
