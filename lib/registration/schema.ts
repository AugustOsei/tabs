import { z } from "zod";

export const occupations = [
  { value: "entrepreneur", label: "Entrepreneur or business owner" },
  { value: "worker", label: "Worker or professional" },
  { value: "student", label: "Student or job seeker" },
  { value: "other", label: "Other" },
] as const;

export const experienceLevels = [
  { value: "none", label: "None yet" },
  { value: "some", label: "I've tried a few" },
  { value: "regular", label: "I use them regularly" },
] as const;

/** Stored as the site topic when the registrant leaves that question blank. */
export const SITE_TOPIC_UNDECIDED = "Not sure yet";

/**
 * Normalises a WhatsApp number to E.164. Ghana numbers may be written locally
 * (0207926546) or with the country code (233207926546, +233 20 792 6546);
 * anything else must be a full international number starting with +.
 * Returns null when the number is not valid.
 */
export function normaliseWhatsapp(input: string): string | null {
  const raw = input.replace(/[\s().-]/g, "");
  const ghanaLocal = /^0([235]\d{8})$/.exec(raw);
  if (ghanaLocal) return `+233${ghanaLocal[1]}`;
  const ghanaIntl = /^\+?233([235]\d{8})$/.exec(raw);
  if (ghanaIntl) return `+233${ghanaIntl[1]}`;
  if (/^\+233/.test(raw)) return null; // Ghana code with the wrong length
  if (/^\+[1-9]\d{7,14}$/.test(raw)) return raw;
  return null;
}

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "That name is too long.")
    .refine((v) => v.split(/\s+/).length >= 2, "Enter your first and last name. You will use it as your payment reference."),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Enter your WhatsApp number.")
    .refine((v) => normaliseWhatsapp(v) !== null, "Enter a valid number, such as 0207926546. Outside Ghana, start with + and your country code."),
  email: z.string().trim().min(1, "Enter your email address.").max(254).pipe(z.email("Enter a valid email address.")),
  occupation: z.enum(
    occupations.map((o) => o.value),
    "Choose the option that fits you best.",
  ),
  siteTopic: z
    .string()
    .trim()
    .max(600, "Keep this under 600 characters.")
    .refine((v) => v.length === 0 || v.length >= 3, "Add a few more words, or leave this blank.")
    // Optional on the form; the database column is required, so a blank answer is stored as this.
    .transform((v) => v || SITE_TOPIC_UNDECIDED),
  aiExperience: z.enum(
    experienceLevels.map((e) => e.value),
    "Choose your experience with AI tools.",
  ),
  heardFrom: z.string().trim().max(200, "Keep this under 200 characters.").optional().default(""),
  consent: z.literal(true, "Tick the box so we can send you event messages."),
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;
export type FieldErrors = Partial<Record<keyof RegistrationInput, string>>;

/** First error message per field, for showing next to inputs. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof RegistrationInput;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** What the API returns after a successful registration. */
export type RegistrationResult = {
  ok: true;
  firstName: string;
  aiIdea: string | null;
  /** Path of this person's share page, or null when there is none. */
  sharePath: string | null;
  /** True when Supabase is not configured in development and nothing was saved. */
  preview: boolean;
};
