-- Likes on Talk posts — the core "social" reaction.
-- Safe to run on an existing DB: only adds a new table.

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
