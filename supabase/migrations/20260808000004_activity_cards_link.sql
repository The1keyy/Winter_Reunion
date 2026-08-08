-- Activity selection cards: optional link + OG preview cache.
-- Any authenticated member can propose a card; admins still manage status/delete.
--
-- Safe for existing data: only ADDs columns and swaps an INSERT policy.
-- Supabase may warn on DROP POLICY — that removes a permission rule, not rows.

-- Step 1 (no warning): new columns
alter table public.activities
  add column if not exists link_url text,
  add column if not exists link_title text,
  add column if not exists link_description text,
  add column if not exists link_image text;

-- Step 2 (Supabase may flag "destructive" — OK: only the old insert rule):
drop policy if exists "activities_insert_admin_only" on public.activities;

create policy "activities_insert_own_or_admin" on public.activities
  for insert to authenticated
  with check (created_by = auth.uid() or public.is_admin());
