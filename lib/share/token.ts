import { createHmac, timingSafeEqual } from "node:crypto";

// A share token carries a first name and a short reference, signed by the
// server, so a card can be drawn without a database read and nobody can make
// a card with a name the site did not issue.
//   <base64url(first name)>.<ref>.<signature>

export type ShareCard = { name: string; ref: string };

const NAME_MAX = 24;

const key = () =>
  createHmac("sha256", "tabs-share-signing")
    .update(process.env.SUPABASE_SERVICE_ROLE_KEY ?? "development-only")
    .digest();

const sign = (name: string, ref: string) => createHmac("sha256", key()).update(`${name}\n${ref}`).digest("base64url").slice(0, 16);

/** `id` is the registration id; only its first 8 characters are used. */
export function createShareToken(firstName: string, id: string) {
  const name = firstName.trim().slice(0, NAME_MAX);
  const ref = id.replace(/[^0-9a-f]/gi, "").slice(0, 8).toLowerCase();
  return `${Buffer.from(name).toString("base64url")}.${ref}.${sign(name, ref)}`;
}

export function readShareToken(token: string): ShareCard | null {
  const [encoded, ref, sig, ...rest] = token.split(".");
  if (!encoded || !ref || !sig || rest.length || !/^[0-9a-f]{1,8}$/.test(ref)) return null;
  const name = Buffer.from(encoded, "base64url").toString();
  if (!name || name.length > NAME_MAX) return null;
  const expected = Buffer.from(sign(name, ref));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return { name, ref };
}

export const sharePath = (token: string) => `/going/${token}`;
export const cardPath = (token: string, shape: "wide" | "square") => `/going/${token}/card?shape=${shape}`;
