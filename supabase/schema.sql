-- Monogram OS: one row of studio data per signed-in user.
-- Run in the Supabase SQL editor. Public sign-ups are disabled in
-- Authentication settings; invite users from Authentication → Users.

create table if not exists public.studio_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  db jsonb not null,
  discovery jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.studio_state enable row level security;

create policy "Read own studio" on public.studio_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own studio" on public.studio_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own studio" on public.studio_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- New projects do not grant table access to API roles automatically.
grant select, insert, update on table public.studio_state to authenticated;
revoke all on table public.studio_state from anon;
