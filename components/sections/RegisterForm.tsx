"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import ShareButtons from "@/components/share/ShareButtons";
import { event } from "@/content/event";
import { goingShareText } from "@/lib/share/messages";
import { getPaymentInstructions } from "@/lib/payment";
import {
  experienceLevels,
  fieldErrors,
  occupations,
  registrationSchema,
  type FieldErrors,
  type RegistrationInput,
  type RegistrationResult,
} from "@/lib/registration/schema";

type Field = keyof RegistrationInput;

const inputClass =
  "mt-2 w-full rounded-lg border bg-navy px-4 py-3 text-base text-white placeholder:text-mist/40 transition-colors focus:border-gold focus:outline-none focus-visible:outline-offset-0";

const borderFor = (hasError: boolean) => (hasError ? "border-[#ff8a7a]" : "border-white/20");

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-[#ff9d8f]">
      {message}
    </p>
  );
}

function WindowFrame({ tab, children }: { tab: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-gold/80 bg-navy-800">
      <div className="flex items-center justify-between border-b-2 border-gold/80 bg-navy px-5 py-3">
        <span className="font-mono text-xs font-bold text-gold">{tab}</span>
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2 rounded-full bg-gold" />
          <span className="size-2 rounded-full bg-gold" />
          <span className="size-2 rounded-full bg-gold" />
        </span>
      </div>
      <div className="p-6 sm:p-9">{children}</div>
    </div>
  );
}

function Success({ result, fullName }: { result: RegistrationResult; fullName: string }) {
  const pay = getPaymentInstructions(fullName);
  const steps = [
    { label: `Send ${pay.amountLabel} by ${pay.method}`, value: pay.number },
    { label: "Account name", value: pay.accountName },
    { label: "Reference", value: pay.reference },
  ];
  return (
    <WindowFrame tab="youre-registered">
      <div role="status" tabIndex={-1} id="register-success" className="outline-none">
        {result.preview && (
          <p className="mb-6 rounded-lg border border-dashed border-gold/60 p-3 font-mono text-xs text-gold">
            Preview mode: Supabase keys are not set, so nothing was saved.
          </p>
        )}
        <h3 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          Thank you, {result.firstName}. One step left.
        </h3>

        {result.aiIdea && (
          <figure className="mt-7 rounded-xl border border-gold/50 bg-gold/8 p-5 sm:p-6">
            <figcaption className="font-mono text-xs font-bold uppercase tracking-widest text-gold">
              An idea for your website
            </figcaption>
            <blockquote className="mt-3 text-lg leading-relaxed text-white">{result.aiIdea}</blockquote>
          </figure>
        )}

        <h4 className="mt-8 font-display text-xl font-extrabold">Pay to confirm your seat</h4>
        <ol className="mt-5 space-y-4">
          {steps.map((step, i) => (
            <li key={step.label} className="flex gap-4">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-gold font-mono text-sm font-bold text-navy">
                {i + 1}
              </span>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-gold">{step.label}</p>
                <p className="mt-0.5 font-display text-xl font-semibold leading-snug">{step.value}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-7 rounded-xl bg-gold px-5 py-4 font-display text-lg font-extrabold text-navy">{pay.confirmationNote}</p>
        {result.sharePath && (
          <section className="mt-9 border-t border-white/12 pt-7">
            <h4 className="font-display text-xl font-extrabold">Tell your network</h4>
            <p className="mt-2 text-mist/85">This card is yours. Share it and bring a friend along.</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- generated per person by the card route */}
            <img
              src={`${result.sharePath}/card?shape=square`}
              alt={`${result.firstName} is building at ${event.name}`}
              width={1080}
              height={1080}
              loading="lazy"
              className="mt-5 w-full max-w-sm rounded-xl border border-white/12"
            />
            <ShareButtons
              className="mt-5"
              url={`${event.url}${result.sharePath}`}
              text={goingShareText}
              image={{ src: `${result.sharePath}/card?shape=square`, fileName: "im-building-at-the-ai-build-shop.png" }}
            />
          </section>
        )}
        <p className="mt-8 text-sm text-mist/75">
          {pay.refundPolicy} Questions? WhatsApp{" "}
          <a href={event.contact.whatsappUrl} className="text-gold underline underline-offset-4">
            {event.contact.whatsapp}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${event.contact.email}`} className="text-gold underline underline-offset-4">
            {event.contact.email}
          </a>
          .
        </p>
      </div>
    </WindowFrame>
  );
}

const VIA_KEY = "tabs-via";

function readVia() {
  try {
    return sessionStorage.getItem(VIA_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function RegisterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ result: RegistrationResult; fullName: string } | null>(null);

  // Arriving through someone's share link (?via=<their token>): remember it for
  // this visit so the referral still counts if they browse before registering.
  useEffect(() => {
    try {
      const via = new URLSearchParams(window.location.search).get("via");
      if (via) sessionStorage.setItem(VIA_KEY, via.slice(0, 200));
    } catch {
      // Storage is blocked: the referral is simply not recorded.
    }
  }, []);

  const focusFirstError = (errs: FieldErrors) => {
    const first = Object.keys(errs)[0];
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = new FormData(e.currentTarget);
    const values = {
      fullName: String(form.get("fullName") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      email: String(form.get("email") ?? ""),
      occupation: String(form.get("occupation") ?? ""),
      siteTopic: String(form.get("siteTopic") ?? ""),
      aiExperience: String(form.get("aiExperience") ?? ""),
      heardFrom: String(form.get("heardFrom") ?? ""),
      consent: form.get("consent") === "on",
      via: readVia(),
    };

    const parsed = registrationSchema.safeParse(values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      setFormError("Please check the highlighted fields.");
      focusFirstError(errs);
      return;
    }

    setErrors({});
    setFormError("");
    setPending(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: String(form.get("website") ?? "") }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        const errs: FieldErrors = json.errors ?? {};
        setErrors(errs);
        setFormError(json.message ?? "Something went wrong. Please try again.");
        focusFirstError(errs);
        return;
      }
      setDone({ result: json as RegistrationResult, fullName: parsed.data.fullName });
      requestAnimationFrame(() => {
        const el = document.getElementById("register-success");
        el?.focus({ preventScroll: true });
        document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) return <Success result={done.result} fullName={done.fullName} />;

  const aria = (field: Field) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  return (
    <WindowFrame tab="register">
      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6">
        {/* Honeypot for bots: hidden from people and assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div>
          <label htmlFor="fullName" className="font-display font-semibold">
            Full name
          </label>
          <input id="fullName" name="fullName" type="text" autoComplete="name" required {...aria("fullName")} className={`${inputClass} ${borderFor(!!errors.fullName)}`} />
          <ErrorText id="fullName-error" message={errors.fullName} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="whatsapp" className="font-display font-semibold">
              WhatsApp number
            </label>
            <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="024 000 0000" required {...aria("whatsapp")} className={`${inputClass} ${borderFor(!!errors.whatsapp)}`} />
            <ErrorText id="whatsapp-error" message={errors.whatsapp} />
          </div>
          <div>
            <label htmlFor="email" className="font-display font-semibold">
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required {...aria("email")} className={`${inputClass} ${borderFor(!!errors.email)}`} />
            <ErrorText id="email-error" message={errors.email} />
          </div>
        </div>

        <fieldset {...aria("occupation")}>
          <legend className="font-display font-semibold">What do you do?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {occupations.map((o) => (
              <label key={o.value} className="choice">
                <input type="radio" name="occupation" value={o.value} className="sr-only" />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          <ErrorText id="occupation-error" message={errors.occupation} />
        </fieldset>

        <div>
          <label htmlFor="siteTopic" className="font-display font-semibold">
            What would you like your website to be about? <span className="font-sans text-sm font-normal text-mist/60">(optional)</span>
          </label>
          <p id="siteTopic-hint" className="mt-1 text-sm text-mist/70">
            Not sure yet? That is fine. Leave this blank and you will shape your idea in the first session.
          </p>
          <textarea id="siteTopic" name="siteTopic" rows={3} maxLength={600} {...aria("siteTopic")} aria-describedby={errors.siteTopic ? "siteTopic-hint siteTopic-error" : "siteTopic-hint"} className={`${inputClass} ${borderFor(!!errors.siteTopic)} resize-y`} />
          <ErrorText id="siteTopic-error" message={errors.siteTopic} />
        </div>

        <fieldset {...aria("aiExperience")}>
          <legend className="font-display font-semibold">Your experience with AI tools</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {experienceLevels.map((x) => (
              <label key={x.value} className="choice">
                <input type="radio" name="aiExperience" value={x.value} className="sr-only" />
                <span>{x.label}</span>
              </label>
            ))}
          </div>
          <ErrorText id="aiExperience-error" message={errors.aiExperience} />
        </fieldset>

        <div>
          <label htmlFor="heardFrom" className="font-display font-semibold">
            How did you hear about TABS? <span className="font-sans text-sm font-normal text-mist/60">(optional)</span>
          </label>
          <input id="heardFrom" name="heardFrom" type="text" maxLength={200} {...aria("heardFrom")} className={`${inputClass} ${borderFor(!!errors.heardFrom)}`} />
          <ErrorText id="heardFrom-error" message={errors.heardFrom} />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" name="consent" required {...aria("consent")} className="mt-1 size-5 shrink-0 accent-gold" />
            <span className="text-mist/90">I agree to receive event messages by email and WhatsApp.</span>
          </label>
          <ErrorText id="consent-error" message={errors.consent} />
        </div>

        <div role="alert" aria-live="assertive">
          {formError && <p className="rounded-lg border border-[#ff8a7a] bg-[#ff8a7a]/10 px-4 py-3 text-[#ffb3a8]">{formError}</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 font-display text-lg font-extrabold text-navy transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {pending ? "Saving your seat..." : "Register"}
          {!pending && <span aria-hidden="true">→</span>}
        </button>
        <p className="text-sm text-mist/65">
          After you register you will see how to pay {event.price.label} by {event.payment.method}. {event.payment.confirmation}
        </p>
      </form>
    </WindowFrame>
  );
}
