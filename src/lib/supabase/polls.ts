import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Poll, PollOption, PollStatus } from "@/types/database";

/** Fetches all polls, newest first. */
export async function getPolls(
  supabase: SupabaseClient<Database>
): Promise<Poll[]> {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPolls failed", error);
    return [];
  }

  return data ?? [];
}

/** Fetches every poll option, ordered for display within each poll. */
export async function getPollOptions(
  supabase: SupabaseClient<Database>
): Promise<PollOption[]> {
  const { data, error } = await supabase
    .from("poll_options")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    console.error("getPollOptions failed", error);
    return [];
  }

  return data ?? [];
}

export interface PollVoteRow {
  poll_id: string;
  option_id: string;
  profile_id: string;
}

/**
 * Fetches every poll vote so the caller can compute per-option tallies and
 * the current user's own selection. Note: the (poll_id, profile_id)
 * uniqueness constraint means each user can only have one vote per poll,
 * so polls are effectively single-choice even though `is_multiple_choice`
 * exists on the schema.
 */
export async function getPollVotes(
  supabase: SupabaseClient<Database>
): Promise<PollVoteRow[]> {
  const { data, error } = await supabase
    .from("poll_votes")
    .select("poll_id, option_id, profile_id");

  if (error) {
    console.error("getPollVotes failed", error);
    return [];
  }

  return data ?? [];
}

/**
 * Creates a poll with its options in two sequential inserts. Relies on the
 * "polls_insert_admin_only" / "poll_options_insert_admin_only" RLS
 * policies - callers should also gate this in the UI.
 */
export async function createPollWithOptions(
  supabase: SupabaseClient<Database>,
  createdBy: string,
  question: string,
  description: string | null,
  optionTexts: string[]
): Promise<Poll | null> {
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({ created_by: createdBy, question, description })
    .select("*")
    .single();

  if (pollError || !poll) {
    console.error("createPollWithOptions (poll) failed", pollError);
    return null;
  }

  const { error: optionsError } = await supabase.from("poll_options").insert(
    optionTexts.map((optionText, index) => ({
      poll_id: poll.id,
      option_text: optionText,
      position: index,
    }))
  );

  if (optionsError) {
    console.error("createPollWithOptions (options) failed", optionsError);
    // Best-effort cleanup so we don't leave an option-less poll behind.
    await supabase.from("polls").delete().eq("id", poll.id);
    return null;
  }

  return poll;
}

/**
 * Updates a poll's status. Relies on the "polls_update_admin_only" RLS
 * policy.
 */
export async function updatePollStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: PollStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("polls")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updatePollStatus failed", error);
    return false;
  }

  return true;
}

/**
 * Deletes a poll. Relies on the "polls_delete_admin_only" RLS policy -
 * options and votes cascade via foreign keys.
 */
export async function deletePollById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("polls").delete().eq("id", id);

  if (error) {
    console.error("deletePollById failed", error);
    return false;
  }

  return true;
}

/**
 * Sets the current user's vote for a poll, replacing any existing vote
 * (the poll_votes table allows only one row per poll per user).
 */
export async function setPollVote(
  supabase: SupabaseClient<Database>,
  pollId: string,
  optionId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase.from("poll_votes").upsert(
    { poll_id: pollId, option_id: optionId, profile_id: profileId },
    { onConflict: "poll_id,profile_id" }
  );

  if (error) {
    console.error("setPollVote failed", error);
    return false;
  }

  return true;
}

/** Removes the current user's own vote for a poll. */
export async function removePollVote(
  supabase: SupabaseClient<Database>,
  pollId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("poll_votes")
    .delete()
    .eq("poll_id", pollId)
    .eq("profile_id", profileId);

  if (error) {
    console.error("removePollVote failed", error);
    return false;
  }

  return true;
}
