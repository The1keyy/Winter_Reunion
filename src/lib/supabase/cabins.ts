import type { SupabaseClient } from "@supabase/supabase-js";

import type { Cabin, CabinStatus, Database } from "@/types/database";

export type CabinVoteResponse = "yes" | "no";

/** Fetches all cabin proposals, newest first. */
export async function getCabins(
  supabase: SupabaseClient<Database>
): Promise<Cabin[]> {
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCabins failed", error);
    return [];
  }

  return data ?? [];
}

export interface CabinVoteRow {
  cabin_id: string;
  profile_id: string;
  response: CabinVoteResponse;
}

export async function getCabinVotes(
  supabase: SupabaseClient<Database>
): Promise<CabinVoteRow[]> {
  const { data, error } = await supabase
    .from("cabin_votes")
    .select("cabin_id, profile_id, response");

  if (error) {
    console.error("getCabinVotes failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    cabin_id: row.cabin_id,
    profile_id: row.profile_id,
    response: (row.response === "no" ? "no" : "yes") as CabinVoteResponse,
  }));
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
  link_title?: string | null;
  link_description?: string | null;
  link_image?: string | null;
  status?: CabinStatus;
}

export async function createCabin(
  supabase: SupabaseClient<Database>,
  createdBy: string,
  input: CabinInput
): Promise<Cabin | null> {
  const { status, ...fields } = input;
  const { data, error } = await supabase
    .from("cabins")
    .insert({
      created_by: createdBy,
      ...fields,
      status: status ?? "voting",
    })
    .select("*")
    .single();

  if (error) {
    console.error("createCabin failed", error);
    return null;
  }

  return data;
}

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

export async function setCabinVote(
  supabase: SupabaseClient<Database>,
  cabinId: string,
  profileId: string,
  response: CabinVoteResponse
): Promise<boolean> {
  const { error } = await supabase.from("cabin_votes").upsert(
    { cabin_id: cabinId, profile_id: profileId, response },
    { onConflict: "cabin_id,profile_id" }
  );

  if (error) {
    console.error("setCabinVote failed", error);
    return false;
  }

  return true;
}

/** @deprecated use setCabinVote — kept for older call sites */
export async function addCabinVote(
  supabase: SupabaseClient<Database>,
  cabinId: string,
  profileId: string
): Promise<boolean> {
  return setCabinVote(supabase, cabinId, profileId, "yes");
}

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
