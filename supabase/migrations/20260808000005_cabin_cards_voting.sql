-- Cabin selection cards: same concept as activities.
-- Members can propose; Yes/No votes with retract; OG preview cache on link.
--
-- Safe for existing data: adds columns, backfills votes as "yes".
-- Supabase may warn on DROP POLICY — that only changes who can insert.

-- Preview fields (cabins already have url)
alter table public.cabins
  add column if not exists link_title text,
  add column if not exists link_description text,
  add column if not exists link_image text;

-- Yes / No on each cabin card (old votes = yes)
alter table public.cabin_votes
  add column if not exists response text;

update public.cabin_votes
set response = 'yes'
where response is null;

alter table public.cabin_votes
  alter column response set default 'yes';

alter table public.cabin_votes
  alter column response set not null;

do $$
begin
  alter table public.cabin_votes
    add constraint cabin_votes_response_check
    check (response in ('yes', 'no'));
exception
  when duplicate_object then null;
end $$;

-- New cards open for voting immediately
alter table public.cabins
  alter column status set default 'voting';

-- Members can add cabin cards
drop policy if exists "cabins_insert_admin_only" on public.cabins;

create policy "cabins_insert_own_or_admin" on public.cabins
  for insert to authenticated
  with check (created_by = auth.uid() or public.is_admin());
