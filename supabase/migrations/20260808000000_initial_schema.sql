-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.user_role as enum ('admin', 'co-admin', 'member');

create type public.trip_stage_status as enum (
  'Not Started',
  'Planning',
  'Voting Open',
  'Waiting',
  'Finalized',
  'Booked',
  'Completed'
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'co-admin')
  );
$$;

create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins or co-admins can change roles.';
  end if;
  return new;
end;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trip_settings (
  id integer primary key default 1,
  trip_name text not null default '',
  start_date date,
  end_date date,
  state text,
  city_or_area text,
  guest_limit integer,
  estimated_budget_low numeric(10, 2),
  estimated_budget_high numeric(10, 2),
  skiing_status public.trip_stage_status not null default 'Not Started',
  cabin_search_status public.trip_stage_status not null default 'Not Started',
  transportation_status public.trip_stage_status not null default 'Not Started',
  payment_status public.trip_stage_status not null default 'Not Started',
  registration_status public.trip_stage_status not null default 'Not Started',
  selected_cabin_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_settings_single_row check (id = 1)
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  attending boolean not null default true,
  guests_count integer not null default 0,
  dietary_restrictions text,
  notes text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  category text not null,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.suggestion_votes (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (suggestion_id, profile_id)
);

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  question text not null,
  description text,
  is_multiple_choice boolean not null default false,
  status text not null default 'open' check (status in ('open', 'closed')),
  closes_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_text text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, profile_id)
);

create table public.cabins (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  url text,
  location text,
  price_total numeric(10, 2),
  price_per_person numeric(10, 2),
  bedrooms integer,
  bathrooms numeric(3, 1),
  max_occupancy integer,
  notes text,
  status text not null default 'proposed' check (status in ('proposed', 'voting', 'selected', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_settings
  add constraint trip_settings_selected_cabin_fk
  foreign key (selected_cabin_id) references public.cabins(id) on delete set null;

create table public.cabin_votes (
  id uuid primary key default gen_random_uuid(),
  cabin_id uuid not null references public.cabins(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rank integer,
  created_at timestamptz not null default now(),
  unique (cabin_id, profile_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  description text,
  category text,
  activity_date date,
  start_time time,
  end_time time,
  location text,
  cost_per_person numeric(10, 2),
  status text not null default 'proposed' check (status in ('proposed', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_responses (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  response text not null default 'pending' check (response in ('yes', 'no', 'maybe', 'pending')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, profile_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  category text,
  amount numeric(10, 2) not null,
  status text not null default 'unpaid' check (status in ('unpaid', 'pending', 'paid', 'refunded')),
  due_date date,
  paid_at timestamptz,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  item_date date not null,
  start_time time,
  end_time time,
  title text not null,
  description text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.profiles(id) on delete set null,
  name text,
  capacity integer not null default 4,
  departure_location text,
  departure_time timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_passengers (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique (vehicle_id, profile_id)
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_profiles_role on public.profiles(role);

create index idx_registrations_attending on public.registrations(attending);

create index idx_announcements_author_id on public.announcements(author_id);
create index idx_announcements_created_at on public.announcements(created_at desc);

create index idx_suggestions_created_by on public.suggestions(created_by);
create index idx_suggestions_category on public.suggestions(category);
create index idx_suggestions_status on public.suggestions(status);

create index idx_suggestion_votes_profile_id on public.suggestion_votes(profile_id);

create index idx_polls_status on public.polls(status);
create index idx_poll_options_poll_id on public.poll_options(poll_id);
create index idx_poll_votes_option_id on public.poll_votes(option_id);
create index idx_poll_votes_profile_id on public.poll_votes(profile_id);

create index idx_cabins_status on public.cabins(status);
create index idx_cabins_created_by on public.cabins(created_by);
create index idx_cabin_votes_profile_id on public.cabin_votes(profile_id);

create index idx_activities_date on public.activities(activity_date);
create index idx_activities_status on public.activities(status);
create index idx_activity_responses_profile_id on public.activity_responses(profile_id);

create index idx_payments_profile_id on public.payments(profile_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_due_date on public.payments(due_date);

create index idx_itinerary_items_date on public.itinerary_items(item_date);
create index idx_itinerary_items_created_by on public.itinerary_items(created_by);

create index idx_vehicles_driver_id on public.vehicles(driver_id);
create index idx_vehicle_passengers_profile_id on public.vehicle_passengers(profile_id);

create index idx_activity_log_actor_id on public.activity_log(actor_id);
create index idx_activity_log_entity on public.activity_log(entity_type, entity_id);
create index idx_activity_log_created_at on public.activity_log(created_at desc);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

create trigger trg_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.trip_settings
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.registrations
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.suggestions
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.polls
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.cabins
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.activities
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.activity_responses
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.itinerary_items
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROLE PROTECTION TRIGGER
-- ============================================================================

create trigger trg_prevent_unauthorized_role_change before update on public.profiles
  for each row execute function public.prevent_unauthorized_role_change();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.trip_settings enable row level security;
alter table public.registrations enable row level security;
alter table public.announcements enable row level security;
alter table public.suggestions enable row level security;
alter table public.suggestion_votes enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.cabins enable row level security;
alter table public.cabin_votes enable row level security;
alter table public.activities enable row level security;
alter table public.activity_responses enable row level security;
alter table public.payments enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_passengers enable row level security;
alter table public.activity_log enable row level security;

-- profiles
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

create policy "profiles_insert_self_or_admin" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_update_self_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin_only" on public.profiles
  for delete to authenticated using (public.is_admin());

-- trip_settings
create policy "trip_settings_select_all" on public.trip_settings
  for select to authenticated using (true);

create policy "trip_settings_insert_admin_only" on public.trip_settings
  for insert to authenticated with check (public.is_admin());

create policy "trip_settings_update_admin_only" on public.trip_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "trip_settings_delete_admin_only" on public.trip_settings
  for delete to authenticated using (public.is_admin());

-- registrations
create policy "registrations_select_own_or_admin" on public.registrations
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());

create policy "registrations_insert_own_or_admin" on public.registrations
  for insert to authenticated with check (profile_id = auth.uid() or public.is_admin());

create policy "registrations_update_own_or_admin" on public.registrations
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy "registrations_delete_admin_only" on public.registrations
  for delete to authenticated using (public.is_admin());

-- announcements
create policy "announcements_select_all" on public.announcements
  for select to authenticated using (true);

create policy "announcements_insert_admin_only" on public.announcements
  for insert to authenticated with check (public.is_admin());

create policy "announcements_update_admin_only" on public.announcements
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "announcements_delete_admin_only" on public.announcements
  for delete to authenticated using (public.is_admin());

-- suggestions
create policy "suggestions_select_all" on public.suggestions
  for select to authenticated using (true);

create policy "suggestions_insert_own_or_admin" on public.suggestions
  for insert to authenticated with check (created_by = auth.uid() or public.is_admin());

create policy "suggestions_update_own_or_admin" on public.suggestions
  for update to authenticated
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

create policy "suggestions_delete_own_or_admin" on public.suggestions
  for delete to authenticated using (created_by = auth.uid() or public.is_admin());

-- suggestion_votes
create policy "suggestion_votes_select_all" on public.suggestion_votes
  for select to authenticated using (true);

create policy "suggestion_votes_insert_own" on public.suggestion_votes
  for insert to authenticated with check (profile_id = auth.uid());

create policy "suggestion_votes_delete_own_or_admin" on public.suggestion_votes
  for delete to authenticated using (profile_id = auth.uid() or public.is_admin());

-- polls
create policy "polls_select_all" on public.polls
  for select to authenticated using (true);

create policy "polls_insert_admin_only" on public.polls
  for insert to authenticated with check (public.is_admin());

create policy "polls_update_admin_only" on public.polls
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "polls_delete_admin_only" on public.polls
  for delete to authenticated using (public.is_admin());

-- poll_options
create policy "poll_options_select_all" on public.poll_options
  for select to authenticated using (true);

create policy "poll_options_insert_admin_only" on public.poll_options
  for insert to authenticated with check (public.is_admin());

create policy "poll_options_update_admin_only" on public.poll_options
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "poll_options_delete_admin_only" on public.poll_options
  for delete to authenticated using (public.is_admin());

-- poll_votes
create policy "poll_votes_select_all" on public.poll_votes
  for select to authenticated using (true);

create policy "poll_votes_insert_own" on public.poll_votes
  for insert to authenticated with check (profile_id = auth.uid());

create policy "poll_votes_update_own" on public.poll_votes
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "poll_votes_delete_own_or_admin" on public.poll_votes
  for delete to authenticated using (profile_id = auth.uid() or public.is_admin());

-- cabins
create policy "cabins_select_all" on public.cabins
  for select to authenticated using (true);

create policy "cabins_insert_admin_only" on public.cabins
  for insert to authenticated with check (public.is_admin());

create policy "cabins_update_admin_only" on public.cabins
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "cabins_delete_admin_only" on public.cabins
  for delete to authenticated using (public.is_admin());

-- cabin_votes
create policy "cabin_votes_select_all" on public.cabin_votes
  for select to authenticated using (true);

create policy "cabin_votes_insert_own" on public.cabin_votes
  for insert to authenticated with check (profile_id = auth.uid());

create policy "cabin_votes_update_own" on public.cabin_votes
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "cabin_votes_delete_own_or_admin" on public.cabin_votes
  for delete to authenticated using (profile_id = auth.uid() or public.is_admin());

-- activities
create policy "activities_select_all" on public.activities
  for select to authenticated using (true);

create policy "activities_insert_admin_only" on public.activities
  for insert to authenticated with check (public.is_admin());

create policy "activities_update_admin_only" on public.activities
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "activities_delete_admin_only" on public.activities
  for delete to authenticated using (public.is_admin());

-- activity_responses
create policy "activity_responses_select_all" on public.activity_responses
  for select to authenticated using (true);

create policy "activity_responses_insert_own" on public.activity_responses
  for insert to authenticated with check (profile_id = auth.uid());

create policy "activity_responses_update_own_or_admin" on public.activity_responses
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy "activity_responses_delete_own_or_admin" on public.activity_responses
  for delete to authenticated using (profile_id = auth.uid() or public.is_admin());

-- payments
create policy "payments_select_own_or_admin" on public.payments
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());

create policy "payments_insert_admin_only" on public.payments
  for insert to authenticated with check (public.is_admin());

create policy "payments_update_admin_only" on public.payments
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "payments_delete_admin_only" on public.payments
  for delete to authenticated using (public.is_admin());

-- itinerary_items
create policy "itinerary_items_select_all" on public.itinerary_items
  for select to authenticated using (true);

create policy "itinerary_items_insert_admin_only" on public.itinerary_items
  for insert to authenticated with check (public.is_admin());

create policy "itinerary_items_update_admin_only" on public.itinerary_items
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "itinerary_items_delete_admin_only" on public.itinerary_items
  for delete to authenticated using (public.is_admin());

-- vehicles
create policy "vehicles_select_all" on public.vehicles
  for select to authenticated using (true);

create policy "vehicles_insert_own_or_admin" on public.vehicles
  for insert to authenticated with check (driver_id = auth.uid() or public.is_admin());

create policy "vehicles_update_own_or_admin" on public.vehicles
  for update to authenticated
  using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid() or public.is_admin());

create policy "vehicles_delete_own_or_admin" on public.vehicles
  for delete to authenticated using (driver_id = auth.uid() or public.is_admin());

-- vehicle_passengers
create policy "vehicle_passengers_select_all" on public.vehicle_passengers
  for select to authenticated using (true);

create policy "vehicle_passengers_insert_self_or_driver_or_admin" on public.vehicle_passengers
  for insert to authenticated
  with check (
    profile_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.driver_id = auth.uid()
    )
  );

create policy "vehicle_passengers_delete_self_or_driver_or_admin" on public.vehicle_passengers
  for delete to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.driver_id = auth.uid()
    )
  );

-- activity_log
create policy "activity_log_select_admin_only" on public.activity_log
  for select to authenticated using (public.is_admin());
