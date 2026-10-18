-- 0001_starter_notes.sql — the notes table for the auth module (and the synced store). Idempotent: safe to run twice.
-- Run in the Supabase SQL editor, or `supabase db push`. Every object is prefixed starter_ (hk:init renames it to your app's prefix),
-- so several apps can share one Supabase project without colliding.

create table if not exists public.starter_notes (
  id          uuid primary key,                                   -- made on the device (OFF-2): exists before the server sees it
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body        text not null default '' check (char_length(body) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),                 -- the EDIT time from the device: last write wins by this
  deleted_at  timestamptz,                                        -- tombstone: the person's other devices learn about deletions
  synced_at   timestamptz not null default now()                  -- the SERVER's clock: "what changed since my last pull"
);

create index if not exists starter_notes_user_synced on public.starter_notes (user_id, synced_at);

-- RLS: one policy per command, each limited to the signed-in person (SEC-4, Appendix A.5). (select auth.uid()) is evaluated once per query.
alter table public.starter_notes enable row level security;

drop policy if exists "starter_notes: owner select" on public.starter_notes;
create policy "starter_notes: owner select" on public.starter_notes for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "starter_notes: owner insert" on public.starter_notes;
create policy "starter_notes: owner insert" on public.starter_notes for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "starter_notes: owner update" on public.starter_notes;
create policy "starter_notes: owner update" on public.starter_notes for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "starter_notes: owner delete" on public.starter_notes;
create policy "starter_notes: owner delete" on public.starter_notes for delete to authenticated
  using (user_id = (select auth.uid()));

-- The server decides three things no device can be trusted with:
--  1. synced_at is always the server's clock (devices pull "changed since" by it)
--  2. an edit time from the future is clamped to now — a phone with a wrong clock must not win every conflict forever
--  3. an OLDER write that arrives late (a phone coming back online) never replaces a newer row: last write wins on the server too,
--     so every device converges on the newest text whatever order the uploads arrive in
create or replace function public.starter_notes_stamp() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.updated_at > now() then new.updated_at := now(); end if;
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return old;                                                     -- keep the newer row untouched
  end if;
  new.synced_at := now();
  return new;
end $$;

drop trigger if exists starter_notes_stamp on public.starter_notes;
create trigger starter_notes_stamp before insert or update on public.starter_notes
  for each row execute function public.starter_notes_stamp();
