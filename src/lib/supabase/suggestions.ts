import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Suggestion, SuggestionStatus } from "@/types/database";

/** Fetches all suggestions, newest first. */
export async function getSuggestions(
  supabase: SupabaseClient<Database>
): Promise<Suggestion[]> {
  const { data, error } = await supabase
    .from("suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSuggestions failed", error);
    return [];
  }

  return data ?? [];
}

export interface SuggestionVoteRow {
  suggestion_id: string;
  profile_id: string;
}

/**
 * Fetches every suggestion vote so the caller can compute per-suggestion
 * counts and whether the current user has already voted.
 */
export async function getSuggestionVotes(
  supabase: SupabaseClient<Database>
): Promise<SuggestionVoteRow[]> {
  const { data, error } = await supabase
    .from("suggestion_votes")
    .select("suggestion_id, profile_id");

  if (error) {
    console.error("getSuggestionVotes failed", error);
    return [];
  }

  return data ?? [];
}

export interface SuggestionInput {
  category: string;
  title: string;
  description: string | null;
}

/**
 * Creates a suggestion authored by the current user. Relies on the
 * "suggestions_insert_own_or_admin" RLS policy - any signed-in member can
 * propose one, not just admins.
 */
export async function createSuggestion(
  supabase: SupabaseClient<Database>,
  createdBy: string,
  input: SuggestionInput
): Promise<Suggestion | null> {
  const { data, error } = await supabase
    .from("suggestions")
    .insert({ created_by: createdBy, ...input })
    .select("*")
    .single();

  if (error) {
    console.error("createSuggestion failed", error);
    return null;
  }

  return data;
}

/**
 * Updates a suggestion's status. Relies on the
 * "suggestions_update_own_or_admin" RLS policy - callers should gate this
 * to admins in the UI since status is a triage decision.
 */
export async function updateSuggestionStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: SuggestionStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("suggestions")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updateSuggestionStatus failed", error);
    return false;
  }

  return true;
}

/**
 * Deletes a suggestion. Relies on the "suggestions_delete_own_or_admin" RLS
 * policy (the author or an admin).
 */
export async function deleteSuggestionById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("suggestions").delete().eq("id", id);

  if (error) {
    console.error("deleteSuggestionById failed", error);
    return false;
  }

  return true;
}

/** Records a vote from the current user for a suggestion. */
export async function addSuggestionVote(
  supabase: SupabaseClient<Database>,
  suggestionId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("suggestion_votes")
    .insert({ suggestion_id: suggestionId, profile_id: profileId });

  if (error) {
    console.error("addSuggestionVote failed", error);
    return false;
  }

  return true;
}

/** Removes the current user's own vote for a suggestion. */
export async function removeSuggestionVote(
  supabase: SupabaseClient<Database>,
  suggestionId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("suggestion_votes")
    .delete()
    .eq("suggestion_id", suggestionId)
    .eq("profile_id", profileId);

  if (error) {
    console.error("removeSuggestionVote failed", error);
    return false;
  }

  return true;
}
