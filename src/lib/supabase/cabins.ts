import type { SupabaseClient } from "@supabase/supabase-js";

import type { Cabin, CabinStatus, Database } from "@/types/database";

/** Fetches all cabin proposals, oldest first. */
export async function getCabins(
  supabase: SupabaseClient<Database>
): Promise<Cabin[]> {
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCabins failed", error);
    return [];
  }

  return data ?? [];
}

export interface CabinVoteRow {
  cabin_id: string;
  profile_id: string;
}

/**
 * Fetches every cabin vote so the caller can compute per-cabin counts and
 * whether the current user has already voted. The trip's guest list is
 * small enough that this is cheaper than a separate aggregate query.
 */
export async function getCabinVotes(
  supabase: SupabaseClient<Database>
): Promise<CabinVoteRow[]> {
  const { data, error } = await supabase
    .from("cabin_votes")
    .select("cabin_id, profile_id");

  if (error) {
    console.error("getCabinVotes failed", error);
    return [];
  }

  return data ?? [];
}

export interface CabinInput {
  name: string;
  url: string | null;
  location: string | null;
  price_total: number | null;
  price_per_person: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  max_occupancy: number | null;
  notes: string | null;
}

/**
 * Creates a cabin proposal. Relies on the "cabins_insert_admin_only" RLS
 * policy - callers should also gate this in the UI.
 */
export async function createCabin(
  supabase: SupabaseClient<Database>,
  createdBy: string,
  input: CabinInput
): Promise<Cabin | null> {
  const { data, error } = await supabase
    .from("cabins")
    .insert({ created_by: createdBy, ...input })
    .select("*")
    .single();

  if (error) {
    console.error("createCabin failed", error);
    return null;
  }

  return data;
}

/**
 * Updates a cabin's status. Relies on the "cabins_update_admin_only" RLS
 * policy.
 */
export async function updateCabinStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: CabinStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("cabins")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updateCabinStatus failed", error);
    return false;
  }

  return true;
}

/**
 * Deletes a cabin proposal. Relies on the "cabins_delete_admin_only" RLS
 * policy.
 */
export async function deleteCabinById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("cabins").delete().eq("id", id);

  if (error) {
    console.error("deleteCabinById failed", error);
    return false;
  }

  return true;
}

/**
 * Records a vote from the current user for a cabin. Relies on the
 * "cabin_votes_insert_own" RLS policy and the (cabin_id, profile_id)
 * uniqueness constraint.
 */
export async function addCabinVote(
  supabase: SupabaseClient<Database>,
  cabinId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("cabin_votes")
    .insert({ cabin_id: cabinId, profile_id: profileId });

  if (error) {
    console.error("addCabinVote failed", error);
    return false;
  }

  return true;
}

/** Removes the current user's own vote for a cabin. */
export async function removeCabinVote(
  supabase: SupabaseClient<Database>,
  cabinId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("cabin_votes")
    .delete()
    .eq("cabin_id", cabinId)
    .eq("profile_id", profileId);

  if (error) {
    console.error("removeCabinVote failed", error);
    return false;
  }

  return true;
}
