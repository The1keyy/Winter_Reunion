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
    .order("created_at", { ascending: false });

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
  link_url?: string | null;
  link_title?: string | null;
  link_description?: string | null;
  link_image?: string | null;
}

/** Creates an activity card. Members may insert their own; admins may insert any. */
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

/** Retract a yes/no vote — removes the row so the user can choose again. */
export async function clearActivityResponse(
  supabase: SupabaseClient<Database>,
  activityId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("activity_responses")
    .delete()
    .eq("activity_id", activityId)
    .eq("profile_id", profileId);

  if (error) {
    console.error("clearActivityResponse failed", error);
    return false;
  }

  return true;
}
