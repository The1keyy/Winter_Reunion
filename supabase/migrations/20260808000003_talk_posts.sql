-- Informal "Talk" board: important-but-outside-the-normal trip threads
-- (ride ideas, dietary rabbit holes, side plans). Not a replacement for
-- admin announcements.

create table public.talk_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.talk_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.talk_posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_talk_posts_created_at on public.talk_posts(created_at desc);
create index idx_talk_replies_post_id on public.talk_replies(post_id);
create index idx_talk_replies_created_at on public.talk_replies(created_at asc);

create trigger trg_talk_posts_set_updated_at
  before update on public.talk_posts
  for each row execute function public.set_updated_at();

alter table public.talk_posts enable row level security;
alter table public.talk_replies enable row level security;

create policy "talk_posts_select_all" on public.talk_posts
  for select to authenticated using (true);

create policy "talk_posts_insert_own" on public.talk_posts
  for insert to authenticated
  with check (author_id = auth.uid());

create policy "talk_posts_update_own_or_admin" on public.talk_posts
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy "talk_posts_delete_own_or_admin" on public.talk_posts
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy "talk_replies_select_all" on public.talk_replies
  for select to authenticated using (true);

create policy "talk_replies_insert_own" on public.talk_replies
  for insert to authenticated
  with check (author_id = auth.uid());

create policy "talk_replies_delete_own_or_admin" on public.talk_replies
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());
