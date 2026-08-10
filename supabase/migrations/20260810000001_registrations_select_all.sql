-- Let everyone see who's RSVP'd (name + attending + guest count), matching
-- how every other feature in this app already works (activities, cabins,
-- polls, etc. are all select-all). Previously registrations could only be
-- read by the row's own owner or an admin, which blocked the "who's coming"
-- board on Home from showing anyone but yourself.
--
-- Writes are unaffected - people can still only create/update their own
-- registration (registrations_insert_own_or_admin / ..._update_own_or_admin).
drop policy if exists "registrations_select_own_or_admin" on public.registrations;
create policy "registrations_select_all" on public.registrations
  for select to authenticated using (true);
