import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Activity,
  ActivityResponseValue,
  ActivityStatus,
  Database,
} from "@/types/database";

/** Fetches all activities, soonest date first (undated activities last). */
export async function getActivities(
  supabase: SupabaseClient<Database>
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("activity_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getActivities failed", error);
    return [];
  }

  return data ?? [];
}

export interface ActivityResponseRow {
  activity_id: string;
  profile_id: string;
  response: ActivityResponseValue;
}

/**
 * Fetches every activity response so the caller can compute per-activity
 * tallies and the current user's own response.
 */
export async function getActivityResponses(
  supabase: SupabaseClient<Database>
): Promise<ActivityResponseRow[]> {
  const { data, error } = await supabase
    .from("activity_responses")
    .select("activity_id, profile_id, response");

  if (error) {
    console.error("getActivityResponses failed", error);
    return [];
  }

  return data ?? [];
}

export interface ActivityInput {
  name: string;
  description: string | null;
  category: string | null;
  activity_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  cost_per_person: number | null;
}

/**
 * Creates an activity proposal. Relies on the "activities_insert_admin_only"
 * RLS policy - callers should also gate this in the UI.
 */
export async function createActivity(
  supabase: SupabaseClient<Database>,
  createdBy: string,
  input: ActivityInput
): Promise<Activity | null> {
  const { data, error } = await supabase
    .from("activities")
    .insert({ created_by: createdBy, ...input })
    .select("*")
    .single();

  if (error) {
    console.error("createActivity failed", error);
    return null;
  }

  return data;
}

/**
 * Updates an activity's status. Relies on the "activities_update_admin_only"
 * RLS policy.
 */
export async function updateActivityStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: ActivityStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("activities")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updateActivityStatus failed", error);
    return false;
  }

  return true;
}

/**
 * Deletes an activity. Relies on the "activities_delete_admin_only" RLS
 * policy.
 */
export async function deleteActivityById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("activities").delete().eq("id", id);

  if (error) {
    console.error("deleteActivityById failed", error);
    return false;
  }

  return true;
}

/**
 * Sets (creates or updates) the current user's response to an activity.
 * Relies on the "activity_responses_insert_own" / "..._update_own_or_admin"
 * RLS policies and the (activity_id, profile_id) uniqueness constraint.
 */
export async function setActivityResponse(
  supabase: SupabaseClient<Database>,
  activityId: string,
  profileId: string,
  response: ActivityResponseValue
): Promise<boolean> {
  const { error } = await supabase.from("activity_responses").upsert(
    { activity_id: activityId, profile_id: profileId, response },
    { onConflict: "activity_id,profile_id" }
  );

  if (error) {
    console.error("setActivityResponse failed", error);
    return false;
  }

  return true;
}
