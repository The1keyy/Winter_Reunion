import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, TripSettings } from "@/types/database";

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
