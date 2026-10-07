import { event } from "@/content/event";
import { reveal } from "@/lib/reveal";
import ShareButtons from "@/components/share/ShareButtons";
import { eventShareText } from "@/lib/share/messages";
import RegisterForm from "./RegisterForm";
import Section from "./Section";

export default function Register() {
  const { payment, price, seats } = event;
  const steps = [
    "Fill in the form.",
    `Send ${price.label} by ${payment.method} to ${payment.number} (${payment.accountName}).`,
    payment.reference,
  ];
  return (
    <Section id="register" tab="register" title="Save your seat">
      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div {...reveal()}>
          <RegisterForm />
        </div>

        <aside {...reveal(120)} className="rounded-2xl border border-white/12 bg-navy-800 p-7 sm:p-9 lg:sticky lg:top-28">
          <p className="font-display text-6xl font-extrabold leading-none text-gold sm:text-7xl">{price.label}</p>
          <p className="mt-3 text-lg text-mist/90">
            {price.covers}. {price.refundPolicy}
          </p>
          <p className="mt-5 inline-block rounded-full border border-gold/60 px-4 py-2 font-mono text-sm text-gold">
            {seats.total} seats · {seats.policy.toLowerCase()}
          </p>

          <h3 className="mt-8 border-t border-white/12 pt-6 font-display text-xl font-extrabold">How it works</h3>
          <ol className="mt-5 space-y-4">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-gold font-mono text-sm font-bold text-navy">
                  {i + 1}
                </span>
                <p className="pt-1 leading-snug text-mist/95">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 font-display font-semibold text-white">{payment.confirmation}</p>

          <h3 className="mt-8 border-t border-white/12 pt-6 font-display text-xl font-extrabold">Know someone who should come?</h3>
          <p className="mt-2 text-mist/85">Send them this page.</p>
          <ShareButtons className="mt-4" url={event.url} text={eventShareText} />
        </aside>
      </div>
    </Section>
  );
}
