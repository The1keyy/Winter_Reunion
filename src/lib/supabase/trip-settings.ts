import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, TripSettings, TripStageStatus } from "@/types/database";

/**
 * Fetches the single trip_settings row (id = 1). Returns null if an admin
 * hasn't created it yet - callers should render an empty state in that case.
 */
export async function getTripSettings(
  supabase: SupabaseClient<Database>
): Promise<TripSettings | null> {
  const { data, error } = await supabase
    .from("trip_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("getTripSettings failed", error);
    return null;
  }

  return data;
}

export interface TripSettingsInput {
  trip_name: string;
  start_date: string | null;
  end_date: string | null;
  state: string | null;
  city_or_area: string | null;
  guest_limit: number | null;
  estimated_budget_low: number | null;
  estimated_budget_high: number | null;
  skiing_status: TripStageStatus;
  cabin_search_status: TripStageStatus;
  transportation_status: TripStageStatus;
  payment_status: TripStageStatus;
  registration_status: TripStageStatus;
}

/**
 * Creates or updates the single trip_settings row (id = 1). Relies on the
 * "trip_settings_insert_admin_only" / "..._update_admin_only" RLS policies -
 * callers should also gate this in the UI, but the database is the real
 * enforcement point.
 */
export async function upsertTripSettings(
  supabase: SupabaseClient<Database>,
  input: TripSettingsInput
): Promise<TripSettings | null> {
  const { data, error } = await supabase
    .from("trip_settings")
    .upsert({ id: 1, ...input }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    console.error("upsertTripSettings failed", error);
    return null;
  }

  return data;
}
