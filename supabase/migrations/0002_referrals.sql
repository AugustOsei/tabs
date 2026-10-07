-- Referral tracking: who brought a new registration.
-- Run in the Supabase SQL editor, or with `supabase db push`.

-- The first 8 characters of the referring registration's id, taken from the
-- signed share link the new person arrived through. Null when there was none.
alter table public.registrations
  add column if not exists referred_by text check (referred_by ~ '^[0-9a-f]{8}$');

create index if not exists registrations_referred_by_idx on public.registrations (referred_by);

-- Make the API see the new column straight away.
notify pgrst, 'reload schema';
