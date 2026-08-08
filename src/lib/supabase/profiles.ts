import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database, Profile } from "@/types/database";

/**
 * Fetches the profile row for a given user id. Returns null if none exists.
 */
export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("getProfile failed", error);
    return null;
  }

  return data;
}

/**
 * Fetches every profile, ordered by name. Used for admin pickers (e.g.
 * assigning a payment to a specific member). Visible to everyone via the
 * "profiles_select_all" RLS policy.
 */
export async function getAllProfiles(
  supabase: SupabaseClient<Database>
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("getAllProfiles failed", error);
    return [];
  }

  return data ?? [];
}

/**
 * Creates a profile row with role "member" the first time a user signs in.
 * Safe to call on every sign-in - it's a no-op if the profile already exists.
 * Relies on the "profiles_insert_self_or_admin" RLS policy, which allows a
 * user to insert their own row (id = auth.uid()).
 */
export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<Profile | null> {
  const existing = await getProfile(supabase, user.id);
  if (existing) return existing;

  const fallbackName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "New Member";

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      name: fallbackName,
      email: user.email ?? "",
      role: "member",
    })
    .select("*")
    .single();

  if (error) {
    console.error("ensureProfile failed", error);
    return null;
  }

  return data;
}
