"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import TabsLogo from "@/components/TabsLogo";

type Registration = {
  id: string;
  created_at: string;
  full_name: string;
  whatsapp: string;
  email: string;
  occupation: string;
  site_topic: string;
  ai_experience: string;
  heard_from: string | null;
  ai_idea: string | null;
  payment_status: "pending" | "paid";
  paid_at: string | null;
  notes: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The browser client only handles the magic-link session. All data goes
// through /api/admin/*, which checks the session against ADMIN_EMAIL.
let browserClient: SupabaseClient | null = null;
function getBrowserClient() {
  if (!supabaseUrl || !supabaseAnon) return null;
  browserClient ??= createClient(supabaseUrl, supabaseAnon, { auth: { flowType: "implicit", detectSessionInUrl: true } });
  return browserClient;
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra" }) : "";

const csvCell = (v: unknown) => {
  let s = String(v ?? "");
  // Stop spreadsheet apps from running a cell as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

function exportCsv(rows: Registration[]) {
  const cols: (keyof Registration)[] = ["created_at", "full_name", "whatsapp", "email", "occupation", "site_topic", "ai_experience", "heard_from", "payment_status", "paid_at", "ai_idea", "notes", "id"];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `tabs-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Shell({ children, onSignOut }: { children: React.ReactNode; onSignOut?: () => void }) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <TabsLogo blink={false} className="h-14 w-auto" />
          <span className="rounded-t-lg border-2 border-b-0 border-gold/70 px-3 pb-1 pt-1.5 font-mono text-xs text-gold">admin</span>
        </div>
        {onSignOut && (
          <button type="button" onClick={onSignOut} className="rounded-full border border-white/25 px-4 py-2 text-sm text-mist/90 hover:border-gold hover:text-gold">
            Sign out
          </button>
        )}
      </header>
      <main className="mx-auto mt-8 max-w-7xl">{children}</main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => null);
    const json = await res?.json().catch(() => null);
    if (!res?.ok || !json?.ok) {
      setError(json?.message ?? "Could not send the link. Try again.");
      setState("idle");
      return;
    }
    setState("sent");
  }

  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border-2 border-gold/80 bg-navy-800 p-7 sm:p-9">
      <h1 className="font-display text-3xl font-extrabold">Admin sign in</h1>
      {state === "sent" ? (
        <p role="status" className="mt-5 text-mist/90">
          If that address has access, a sign-in link is on its way. Open it on this device.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="font-display font-semibold">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/20 bg-navy px-4 py-3 text-white focus:border-gold focus:outline-none"
            />
          </div>
          <div role="alert">{error && <p className="text-sm text-[#ff9d8f]">{error}</p>}</div>
          <button type="submit" disabled={state === "sending"} className="w-full rounded-full bg-gold px-6 py-3 font-display font-extrabold text-navy disabled:opacity-60">
            {state === "sending" ? "Sending..." : "Email me a sign-in link"}
          </button>
        </form>
      )}
    </div>
  );
}

function Dashboard({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "paid">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const api = useCallback(
    (path: string, init?: RequestInit) =>
      fetch(path, { ...init, headers: { ...init?.headers, "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` } }),
    [session.access_token],
  );

  const load = useCallback(async () => {
    const res = await api("/api/admin/registrations").catch(() => null);
    const json = await res?.json().catch(() => null);
    if (!res?.ok || !json?.ok) {
      setError(json?.message ?? "Could not load registrations.");
      setRows([]);
      return;
    }
    setError("");
    setRows(json.registrations);
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    load();
  }, [load]);

  async function markPaid(r: Registration) {
    if (!window.confirm(`Mark ${r.full_name} as paid?\n\nThis sends their "seat confirmed" email.`)) return;
    setBusyId(r.id);
    setNotice("");
    const res = await api("/api/admin/mark-paid", { method: "POST", body: JSON.stringify({ id: r.id }) }).catch(() => null);
    const json = await res?.json().catch(() => null);
    setBusyId(null);
    if (!res?.ok || !json?.ok) {
      setNotice(json?.message ?? "Could not mark as paid.");
      load();
      return;
    }
    setRows((prev) => prev?.map((x) => (x.id === r.id ? { ...x, ...json.registration } : x)) ?? prev);
    setNotice(
      json.webhookSent
        ? `${r.full_name} is marked as paid and the confirmation was sent to n8n.`
        : json.webhookConfigured
          ? `${r.full_name} is marked as paid, but n8n did not accept the confirmation. Email them yourself.`
          : `${r.full_name} is marked as paid. No confirmation was sent because the paid webhook is not set.`,
    );
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) =>
        (status === "all" || r.payment_status === status) &&
        (!q || [r.full_name, r.email, r.whatsapp, r.site_topic, r.heard_from].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [rows, query, status]);

  const paid = rows?.filter((r) => r.payment_status === "paid").length ?? 0;
  const stats = [
    { label: "Registered", value: rows?.length ?? 0 },
    { label: "Paid", value: paid },
    { label: "Pending", value: (rows?.length ?? 0) - paid },
  ];

  return (
    <Shell onSignOut={onSignOut}>
      <h1 className="font-display text-4xl font-extrabold">Registrations</h1>

      <dl className="mt-6 grid max-w-xl grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/12 bg-navy-800 px-4 py-3">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-gold">{s.label}</dt>
            <dd className="font-display text-3xl font-extrabold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label htmlFor="admin-search" className="font-mono text-xs text-mist/70">
            Search
          </label>
          <input
            id="admin-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, email, number or topic"
            className="mt-1 w-full rounded-lg border border-white/20 bg-navy-800 px-4 py-2.5 text-white placeholder:text-mist/40 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="admin-status" className="font-mono text-xs text-mist/70">
            Payment
          </label>
          <select
            id="admin-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="mt-1 block rounded-lg border border-white/20 bg-navy-800 px-4 py-2.5 text-white focus:border-gold focus:outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <button type="button" onClick={load} className="rounded-lg border border-white/25 px-4 py-2.5 text-mist/90 hover:border-gold hover:text-gold">
          Refresh
        </button>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          disabled={!filtered.length}
          className="rounded-lg bg-gold px-4 py-2.5 font-display font-extrabold text-navy disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <div role="status" aria-live="polite" className="mt-4 min-h-6 text-sm">
        {error && <p className="text-[#ff9d8f]">{error}</p>}
        {notice && <p className="text-gold">{notice}</p>}
      </div>

      <div className="mt-2 overflow-x-auto rounded-2xl border border-white/12">
        <table className="w-full min-w-[60rem] text-left text-sm">
          <caption className="sr-only">Registrations, newest first</caption>
          <thead className="bg-navy-800 font-mono text-[11px] uppercase tracking-widest text-gold">
            <tr>
              {["Registered", "Name", "Contact", "About", "Payment", ""].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-mist/70">
                  Loading...
                </td>
              </tr>
            )}
            {rows !== null && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-mist/70">
                  {rows.length ? "No registrations match." : "No registrations yet."}
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/10 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-mist/80">{fmt(r.created_at)}</td>
                <th scope="row" className="px-4 py-3 font-display text-base font-semibold">
                  {r.full_name}
                  <span className="block font-sans text-xs font-normal text-mist/60">
                    {r.occupation} · AI: {r.ai_experience}
                  </span>
                </th>
                <td className="px-4 py-3">
                  <a href={`https://wa.me/${r.whatsapp.replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="block text-gold underline underline-offset-2">
                    {r.whatsapp}
                  </a>
                  <a href={`mailto:${r.email}`} className="block text-mist/90 underline underline-offset-2">
                    {r.email}
                  </a>
                </td>
                <td className="max-w-xs px-4 py-3 text-mist/90">
                  {r.site_topic}
                  {r.heard_from && <span className="mt-1 block text-xs text-mist/55">Heard via: {r.heard_from}</span>}
                  {r.ai_idea && (
                    <details className="mt-1 text-xs text-mist/70">
                      <summary className="cursor-pointer text-gold">AI idea</summary>
                      <p className="mt-1">{r.ai_idea}</p>
                    </details>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {r.payment_status === "paid" ? (
                    <>
                      <span className="rounded-full bg-gold px-2.5 py-1 font-mono text-xs font-bold text-navy">Paid</span>
                      <span className="mt-1.5 block text-xs text-mist/60">{fmt(r.paid_at)}</span>
                    </>
                  ) : (
                    <span className="rounded-full border border-white/30 px-2.5 py-1 font-mono text-xs text-mist/85">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.payment_status === "pending" && (
                    <button
                      type="button"
                      onClick={() => markPaid(r)}
                      disabled={busyId === r.id}
                      className="whitespace-nowrap rounded-full border border-gold px-4 py-1.5 font-display font-semibold text-gold hover:bg-gold hover:text-navy disabled:opacity-50"
                    >
                      {busyId === r.id ? "Saving..." : "Mark as paid"}
                      <span className="sr-only">: {r.full_name}</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 font-mono text-xs text-mist/50">
        Showing {filtered.length} of {rows?.length ?? 0}. Times are Accra time.
      </p>
    </Shell>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const supabase = getBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <Shell>
        <p className="mt-16 text-center text-mist/80">Admin is not configured. Add the Supabase keys to the environment.</p>
      </Shell>
    );
  }
  if (session === undefined) {
    return (
      <Shell>
        <p className="mt-16 text-center text-mist/70">Loading...</p>
      </Shell>
    );
  }
  if (!session) {
    return (
      <Shell>
        <Login />
      </Shell>
    );
  }
  return <Dashboard session={session} onSignOut={() => supabase.auth.signOut()} />;
}
