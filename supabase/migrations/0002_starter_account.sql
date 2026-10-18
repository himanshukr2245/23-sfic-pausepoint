-- 0002_starter_account.sql — "delete my account": the person's notes and their login, gone (DPDP right to erasure, SEC-4).
-- SECURITY DEFINER because only the database owner may delete from auth.users. It acts ONLY on auth.uid() — the caller's verified
-- identity — never on an argument, has an empty search_path (no schema hijacking), and only signed-in people may call it.
create or replace function public.starter_delete_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  delete from public.starter_notes where user_id = me;
  delete from auth.users where id = me;
end $$;

revoke execute on function public.starter_delete_account() from public, anon;
grant execute on function public.starter_delete_account() to authenticated;
