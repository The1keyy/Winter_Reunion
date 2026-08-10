-- The role-change guard (trg_prevent_unauthorized_role_change) blocked the
-- service-role bootstrap script (scripts/ensure-admin.mjs) from ever setting
-- the very first admin, because auth.uid() is null when there's no logged-in
-- user (i.e. calls made with the service role key) - so is_admin() always
-- returned false and the trigger raised on every attempt.
--
-- Fix: only require is_admin() when a real user session is making the
-- change (auth.uid() is not null). Service-role calls are already a higher
-- trust boundary than any in-app role - only someone holding the Supabase
-- service_role secret can reach this path - so it's safe to let them
-- through. Members changing their own role through the app always go
-- through PostgREST as "authenticated" with a JWT, so auth.uid() is set and
-- the admin check still applies exactly as before.
create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins or co-admins can change roles.';
  end if;
  return new;
end;
$$;
