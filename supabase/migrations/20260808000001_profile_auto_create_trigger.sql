-- Creates a "member" profile row automatically whenever a new auth.users row
-- is inserted (e.g. via admin invite, magic link, or password sign-up).
--
-- This is the primary mechanism for profile creation. The app-level
-- ensureProfile() helper (src/lib/supabase/profiles.ts) remains as a
-- defensive, idempotent fallback for any user created before this trigger
-- existed, but should not be relied on going forward.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      'New Member'
    ),
    coalesce(new.email, ''),
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
