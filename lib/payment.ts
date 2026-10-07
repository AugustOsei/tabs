// All payment logic lives here so a Paystack (Mobile Money) integration can
// replace the manual flow later without touching the form, API or admin code.

import { event } from "@/content/event";

export type PaymentStatus = "pending" | "paid";

export type PaymentInstructions = {
  provider: "manual_momo";
  amount: number;
  currency: string;
  amountLabel: string;
  method: string;
  number: string;
  accountName: string;
  /** What the payer should enter as the reference. */
  reference: string;
  referenceNote: string;
  confirmationNote: string;
  refundPolicy: string;
};

/** Instructions shown on the success screen and sent to n8n. */
export function getPaymentInstructions(fullName: string): PaymentInstructions {
  const { payment, price } = event;
  return {
    provider: "manual_momo",
    amount: price.amount,
    currency: price.currency,
    amountLabel: price.label,
    method: payment.method,
    number: payment.number,
    accountName: payment.accountName,
    reference: fullName,
    referenceNote: payment.reference,
    confirmationNote: payment.confirmation,
    refundPolicy: price.refundPolicy,
  };
}
