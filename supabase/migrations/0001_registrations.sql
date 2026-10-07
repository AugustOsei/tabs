-- TABS 1.0 registrations.
-- Run in the Supabase SQL editor, or with `supabase db push`.

create table if not exists public.registrations (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  full_name      text not null check (char_length(full_name) between 2 and 120),
  whatsapp       text not null check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  email          text not null check (char_length(email) between 5 and 254),
  occupation     text not null check (occupation in ('entrepreneur', 'worker', 'student', 'other')),
  site_topic     text not null check (char_length(site_topic) between 3 and 600),
  ai_experience  text not null check (ai_experience in ('none', 'some', 'regular')),
  heard_from     text check (char_length(heard_from) <= 200),
  consent        boolean not null check (consent),

  ai_idea        text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  paid_at        timestamptz,
  notes          text
);

create index if not exists registrations_created_at_idx on public.registrations (created_at desc);
create index if not exists registrations_payment_status_idx on public.registrations (payment_status);

-- Row Level Security: the public can insert only. There is no select, update
-- or delete policy, so the anon and authenticated roles cannot read or change
-- anything. The site's server uses the service role key, which bypasses RLS.
alter table public.registrations enable row level security;

revoke all on public.registrations from anon, authenticated;
grant insert on public.registrations to anon, authenticated;

drop policy if exists "Public can register" on public.registrations;
create policy "Public can register"
  on public.registrations
  for insert
  to anon, authenticated
  with check (
    -- A public insert can never mark itself paid or write staff-only fields.
    payment_status = 'pending'
    and paid_at is null
    and ai_idea is null
    and notes is null
  );
