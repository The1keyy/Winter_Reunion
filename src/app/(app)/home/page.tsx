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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-normal text-off-white/70">
        Welcome{profile ? `, ${profile.name}` : ""}.
      </p>
      <TripOverview trip={trip} />
    </div>
  );
}
