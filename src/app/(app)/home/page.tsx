import Link from "next/link";

import { TripOverview } from "@/components/trip/trip-overview";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { getTripSettings } from "@/lib/supabase/trip-settings";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, trip] = await Promise.all([
    user ? getProfile(supabase, user.id) : Promise.resolve(null),
    getTripSettings(supabase),
  ]);

  const canSetUpTrip = profile?.role === "admin" || profile?.role === "co-admin";

  if (!trip) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-light text-off-white md:text-2xl">
          Welcome{profile ? `, ${profile.name}` : ""}.
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          {canSetUpTrip
            ? "Trip details haven't been set up yet. Add the trip name, dates, and location to get started."
            : "Trip details haven't been set up yet. Check back soon."}
        </p>
        {canSetUpTrip ? (
          <Link
            href="/admin/trip-settings"
            className="mt-2 w-fit border border-off-white px-4 py-2.5 text-sm font-normal text-off-white transition-opacity hover:opacity-80"
          >
            Set up trip details
          </Link>
        ) : null}
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
    </div>
  );
}
