import { redirect } from "next/navigation";

import { TripSettingsForm } from "@/components/admin/trip-settings-form";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { getTripSettings } from "@/lib/supabase/trip-settings";

export default async function TripSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getProfile(supabase, user.id) : null;

  if (profile?.role !== "admin" && profile?.role !== "co-admin") {
    redirect("/home");
  }

  const trip = await getTripSettings(supabase);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Trip details
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          Set the trip name, dates, location, and stage statuses everyone
          sees on the home page.
        </p>
      </div>

      <TripSettingsForm trip={trip} />
    </div>
  );
}
