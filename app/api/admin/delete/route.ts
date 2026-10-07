import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

// Permanently removes one registration. No email is sent.
export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ ok: false, message: admin.message }, { status: admin.status });

  const { id } = await request.json().catch(() => ({ id: null }));
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, message: "Missing registration id." }, { status: 400 });
  }

  const { data: row, error } = await admin.supabase.from("registrations").delete().eq("id", id).select("id").maybeSingle<{ id: string }>();

  if (error) {
    console.error("[admin] delete failed", error);
    return NextResponse.json({ ok: false, message: "Could not delete the registration." }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ ok: false, message: "This registration no longer exists." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: row.id });
}
