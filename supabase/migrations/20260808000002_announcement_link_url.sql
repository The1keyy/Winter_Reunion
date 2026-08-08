-- Optional link on announcements so admins/co-admins can share an Airbnb,
-- Vrbo, Venmo, Google Doc, etc. alongside the update text.

alter table public.announcements
  add column if not exists link_url text;

comment on column public.announcements.link_url is
  'Optional URL (Airbnb, payment link, doc, etc.) shown with the announcement.';
