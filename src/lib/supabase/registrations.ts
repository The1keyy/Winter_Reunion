import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Registration } from "@/types/database";

/**
 * Fetches the current user's registration row. Returns null if they
 * haven't RSVP'd yet - callers should render an empty form in that case.
 */
export async function getRegistration(
  supabase: SupabaseClient<Database>,
  profileId: string
): Promise<Registration | null> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error("getRegistration failed", error);
    return null;
  }

  return data;
}

export interface RegistrationInput {
  attending: boolean;
  guests_count: number;
  dietary_restrictions: string | null;
  notes: string | null;
}

/**
 * Creates or updates the current user's registration row. Relies on the
 * "registrations_insert_own_or_admin" / "..._update_own_or_admin" RLS
 * policies (profile_id = auth.uid() or an admin).
 */
export async function upsertRegistration(
  supabase: SupabaseClient<Database>,
  profileId: string,
  input: RegistrationInput
): Promise<Registration | null> {
  const { data, error } = await supabase
    .from("registrations")
    .upsert(
      {
        profile_id: profileId,
        ...input,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("upsertRegistration failed", error);
    return null;
  }

  return data;
}
