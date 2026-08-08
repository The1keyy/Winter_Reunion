import type { SupabaseClient } from "@supabase/supabase-js";

import type { Announcement, Database } from "@/types/database";

/**
 * Fetches announcements, pinned first then newest first. Pass `limit` to
 * cap the number returned (e.g. for a home page preview).
 */
export async function getAnnouncements(
  supabase: SupabaseClient<Database>,
  limit?: number
): Promise<Announcement[]> {
  let query = supabase
    .from("announcements")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getAnnouncements failed", error);
    return [];
  }

  return data ?? [];
}

export interface AnnouncementInput {
  title: string;
  body: string;
  pinned: boolean;
}

/**
 * Creates a new announcement. Relies on the "announcements_insert_admin_only"
 * RLS policy - callers should also gate this in the UI.
 */
export async function createAnnouncement(
  supabase: SupabaseClient<Database>,
  authorId: string,
  input: AnnouncementInput
): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from("announcements")
    .insert({ author_id: authorId, ...input })
    .select("*")
    .single();

  if (error) {
    console.error("createAnnouncement failed", error);
    return null;
  }

  return data;
}

/**
 * Deletes an announcement by id. Relies on the
 * "announcements_delete_admin_only" RLS policy.
 */
export async function deleteAnnouncementById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteAnnouncementById failed", error);
    return false;
  }

  return true;
}
