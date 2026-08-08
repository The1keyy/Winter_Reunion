import Link from "next/link";

import { AnnouncementList } from "@/components/announcements/announcement-list";
import { TripOverview } from "@/components/trip/trip-overview";
import { getAnnouncements } from "@/lib/supabase/announcements";
import { getProfile } from "@/lib/supabase/profiles";
import { getRegistration } from "@/lib/supabase/registrations";
import { createClient } from "@/lib/supabase/server";
import { getTripSettings } from "@/lib/supabase/trip-settings";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, trip, registration, announcements] = await Promise.all([
    user ? getProfile(supabase, user.id) : Promise.resolve(null),
    getTripSettings(supabase),
    user ? getRegistration(supabase, user.id) : Promise.resolve(null),
    getAnnouncements(supabase, 5),
  ]);

  const canSetUpTrip = profile?.role === "admin" || profile?.role === "co-admin";

  const rsvpStatus = !registration
    ? "You haven't RSVP'd yet."
    : registration.attending
      ? "You're marked as attending."
      : "You're marked as not attending.";

  const announcementsSection = (
    <div className="flex flex-col gap-3 border-t border-warm-gray/20 pt-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          Announcements
        </span>
        {canSetUpTrip ? (
          <Link
            href="/admin/announcements"
            className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
          >
            Manage
          </Link>
        ) : null}
      </div>
      <AnnouncementList announcements={announcements} />
    </div>
  );

  if (!trip) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-light text-off-white md:text-2xl">
            Welcome{profile ? `, ${profile.name}` : ""}.
          </h1>
          <p className="text-sm font-normal text-off-white/70">
            {canSetUpTrip
              ? "Trip details haven't been set up yet. Add the trip name, dates, and location to get started."
              : "Trip details haven't been set up yet. Check back soon."}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {canSetUpTrip ? (
              <Link
                href="/admin/trip-settings"
                className="w-fit border border-off-white px-4 py-2.5 text-sm font-normal text-off-white transition-opacity hover:opacity-80"
              >
                Set up trip details
              </Link>
            ) : null}
            <Link
              href="/rsvp"
              className="w-fit border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white transition-colors hover:border-off-white"
            >
              {registration ? "Update RSVP" : "RSVP now"}
            </Link>
            <Link
              href="/cabins"
              className="w-fit border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white transition-colors hover:border-off-white"
            >
              View cabins
            </Link>
            <Link
              href="/activities"
              className="w-fit border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white transition-colors hover:border-off-white"
            >
              View activities
            </Link>
          </div>
        </div>
        {announcementsSection}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-normal text-off-white/70">
          Welcome{profile ? `, ${profile.name}` : ""}.
        </p>
        {canSetUpTrip ? (
          <Link
            href="/admin/trip-settings"
            className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
          >
            Edit trip details
          </Link>
        ) : null}
      </div>
      <TripOverview trip={trip} />
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-warm-gray/20 pt-4">
        <p className="text-sm font-normal text-off-white/70">{rsvpStatus}</p>
        <div className="flex items-center gap-4">
          <Link
            href="/rsvp"
            className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
          >
            {registration ? "Update RSVP" : "RSVP now"}
          </Link>
          <Link
            href="/cabins"
            className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
          >
            Cabins
          </Link>
          <Link
            href="/activities"
            className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
          >
            Activities
          </Link>
        </div>
      </div>
      {announcementsSection}
    </div>
  );
}
