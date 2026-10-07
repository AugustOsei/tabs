import { NextResponse } from "next/server";
import { generatePortfolioIdea } from "@/lib/ai/portfolioIdea";
import { postWebhook, registrationCreatedPayload, type RegistrationRecord } from "@/lib/n8n";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { fieldErrors, normaliseWhatsapp, registrationSchema, type RegistrationResult } from "@/lib/registration/schema";
import { createShareToken, readShareToken, sharePath } from "@/lib/share/token";
import { getServiceClient } from "@/lib/supabase";

const fail = (status: number, message: string, errors?: object) =>
  NextResponse.json({ ok: false, message, errors }, { status });

export async function POST(request: Request) {
  if (!rateLimit(`register:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return fail(429, "Too many attempts. Please wait a few minutes and try again.");
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400, "We could not read the form. Please try again.");
  }

  // Honeypot: real people never fill this hidden field. Pretend it worked.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, firstName: "", aiIdea: null, sharePath: null, preview: false } satisfies RegistrationResult);
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Please check the highlighted fields.", fieldErrors(parsed.error));
  }
  const data = parsed.data;
  const firstName = data.fullName.split(/\s+/)[0];

  const supabase = getServiceClient();
  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      console.error("[register] Supabase is not configured");
      return fail(503, "Registration is not available right now. Please contact us on WhatsApp.");
    }
    // Development without Supabase keys: preview the flow, save nothing.
    const aiIdea = await generatePortfolioIdea(data);
    return NextResponse.json({ ok: true, firstName, aiIdea, sharePath: sharePath(createShareToken(firstName, "00000000")), preview: true } satisfies RegistrationResult);
  }

  // 1. Insert the row.
  const fields = {
    full_name: data.fullName,
    whatsapp: normaliseWhatsapp(data.whatsapp),
    email: data.email.toLowerCase(),
    occupation: data.occupation,
    site_topic: data.siteTopic,
    ai_experience: data.aiExperience,
    heard_from: data.heardFrom || null,
    consent: true,
  };
  const insert = (values: object) =>
    supabase
      .from("registrations")
      .insert(values)
      .select("id, created_at, full_name, whatsapp, email, occupation, site_topic, ai_experience, heard_from, ai_idea, payment_status, paid_at")
      .single<RegistrationRecord>();

  // Only a link the site signed counts as a referral.
  const referredBy = data.via ? (readShareToken(data.via)?.ref ?? null) : null;
  let { data: row, error } = await insert(referredBy ? { ...fields, referred_by: referredBy } : fields);
  if (error && referredBy) {
    // A referral must never cost a registration (for example if the column is missing).
    console.error("[register] insert with referral failed, retrying without it", error);
    ({ data: row, error } = await insert(fields));
  }

  if (error || !row) {
    console.error("[register] insert failed", error);
    return fail(500, "We could not save your registration. Please try again, or contact us on WhatsApp.");
  }

  // 2. Generate the portfolio idea and save it. The registration stands even
  //    if this step fails.
  const aiIdea = await generatePortfolioIdea(data);
  if (aiIdea) {
    const { error: updateError } = await supabase.from("registrations").update({ ai_idea: aiIdea }).eq("id", row.id);
    if (updateError) console.error("[register] could not save ai_idea", updateError);
  }

  // 3. Tell n8n.
  await postWebhook(process.env.N8N_WEBHOOK_REGISTRATION_URL, registrationCreatedPayload({ ...row, ai_idea: aiIdea }));

  return NextResponse.json({ ok: true, firstName, aiIdea, sharePath: sharePath(createShareToken(firstName, row.id)), preview: false } satisfies RegistrationResult);
}
