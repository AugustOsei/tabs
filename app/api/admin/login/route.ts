import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin/auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// Sends a magic link, but only ever to the admin email. Every other address
// gets the same response, so the endpoint does not reveal who the admin is.
export async function POST(request: Request) {
  if (!rateLimit(`admin-login:${clientIp(request)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !process.env.ADMIN_EMAIL) {
    return NextResponse.json({ ok: false, message: "Admin sign-in is not configured." }, { status: 503 });
  }

  const { email } = await request.json().catch(() => ({ email: "" }));
  if (isAdminEmail(email)) {
    const supabase = createClient(url, anon, { auth: { persistSession: false, flowType: "implicit" } });
    const { error } = await supabase.auth.signInWithOtp({
      email: String(email).trim(),
      options: { emailRedirectTo: `${new URL(request.url).origin}/admin` },
    });
    if (error) {
      console.error("[admin-login] could not send magic link", error.message);
      return NextResponse.json({ ok: false, message: "We could not send the link. Try again shortly." }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true });
}
