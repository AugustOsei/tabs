import { getServiceClient } from "@/lib/supabase";

export const isAdminEmail = (email: string | null | undefined) => {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!admin && !!email && email.trim().toLowerCase() === admin;
};

/**
 * Checks the Supabase access token sent as `Authorization: Bearer <token>` and
 * confirms it belongs to the admin email. Every admin API route calls this.
 */
export async function requireAdmin(request: Request) {
  const supabase = getServiceClient();
  if (!supabase) return { ok: false as const, status: 503, message: "Supabase is not configured." };

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false as const, status: 401, message: "Sign in to continue." };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { ok: false as const, status: 401, message: "Your session has expired. Sign in again." };
  if (!isAdminEmail(data.user.email)) return { ok: false as const, status: 403, message: "This account does not have access." };

  return { ok: true as const, supabase };
}
