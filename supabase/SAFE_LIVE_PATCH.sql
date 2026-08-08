-- ============================================================================
-- Winter Reunion — SAFE LIVE PATCH (add-only)
-- Paste this ENTIRE file into Supabase → SQL Editor → Run
--
-- Safe on an existing DB: only adds missing columns / tables / policies.
-- Does NOT recreate profiles, cabins, activities, etc.
-- Supabase may warn on DROP POLICY — OK (permission rules only, not data).
-- ============================================================================

-- 1) Announcement links
alter table public.announcements
  add column if not exists link_url text;

-- 2) Activity cards (link preview + members can propose)
alter table public.activities
  add column if not exists link_url text,
  add column if not exists link_title text,
  add column if not exists link_description text,
  add column if not exists link_image text;

drop policy if exists "activities_insert_admin_only" on public.activities;

drop policy if exists "activities_insert_own_or_admin" on public.activities;

create policy "activities_insert_own_or_admin" on public.activities
  for insert to authenticated
  with check (created_by = auth.uid() or public.is_admin());

-- 3) Cabin cards (link preview + Yes/No votes + members can propose)
alter table public.cabins
  add column if not exists link_title text,
  add column if not exists link_description text,
  add column if not exists link_image text;

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

alter table public.cabins
  alter column status set default 'voting';

drop policy if exists "cabins_insert_admin_only" on public.cabins;

drop policy if exists "cabins_insert_own_or_admin" on public.cabins;

create policy "cabins_insert_own_or_admin" on public.cabins
  for insert to authenticated
  with check (created_by = auth.uid() or public.is_admin());

-- 4) Talk board (skip if you already created these tables)
create table if not exists public.talk_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.talk_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.talk_posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_talk_posts_created_at
  on public.talk_posts(created_at desc);

create index if not exists idx_talk_replies_post_id
  on public.talk_replies(post_id);

create index if not exists idx_talk_replies_created_at
  on public.talk_replies(created_at asc);

do $$
begin
  create trigger trg_talk_posts_set_updated_at
    before update on public.talk_posts
    for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end $$;

alter table public.talk_posts enable row level security;
alter table public.talk_replies enable row level security;

drop policy if exists "talk_posts_select_all" on public.talk_posts;
create policy "talk_posts_select_all" on public.talk_posts
  for select to authenticated using (true);

drop policy if exists "talk_posts_insert_own" on public.talk_posts;
create policy "talk_posts_insert_own" on public.talk_posts
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "talk_posts_update_own_or_admin" on public.talk_posts;
create policy "talk_posts_update_own_or_admin" on public.talk_posts
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "talk_posts_delete_own_or_admin" on public.talk_posts;
create policy "talk_posts_delete_own_or_admin" on public.talk_posts
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "talk_replies_select_all" on public.talk_replies;
create policy "talk_replies_select_all" on public.talk_replies
  for select to authenticated using (true);

drop policy if exists "talk_replies_insert_own" on public.talk_replies;
create policy "talk_replies_insert_own" on public.talk_replies
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "talk_replies_delete_own_or_admin" on public.talk_replies;
create policy "talk_replies_delete_own_or_admin" on public.talk_replies
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- 5) Talk post likes (the heart button on the feed)
create table if not exists public.talk_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.talk_posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, profile_id)
);

create index if not exists idx_talk_post_likes_post_id
  on public.talk_post_likes(post_id);

alter table public.talk_post_likes enable row level security;

drop policy if exists "talk_post_likes_select_all" on public.talk_post_likes;
create policy "talk_post_likes_select_all" on public.talk_post_likes
  for select to authenticated using (true);

drop policy if exists "talk_post_likes_insert_own" on public.talk_post_likes;
create policy "talk_post_likes_insert_own" on public.talk_post_likes
  for insert to authenticated with check (profile_id = auth.uid());

drop policy if exists "talk_post_likes_delete_own" on public.talk_post_likes;
create policy "talk_post_likes_delete_own" on public.talk_post_likes
  for delete to authenticated using (profile_id = auth.uid());
