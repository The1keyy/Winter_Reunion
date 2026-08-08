"use server";

import { revalidatePath } from "next/cache";

import {
  createAnnouncement,
  deleteAnnouncementById,
} from "@/lib/supabase/announcements";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { announcementSchema } from "@/lib/validations/announcement";

export interface AnnouncementState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isAdmin: false };
  }

  const profile = await getProfile(supabase, user.id);
  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";

  return { supabase, user, isAdmin };
}

export async function postAnnouncement(
  _prevState: AnnouncementState,
  formData: FormData
): Promise<AnnouncementState> {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!user || !isAdmin) {
    return { error: "Only trip admins can post announcements." };
  }

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    pinned: formData.get("pinned"),
  });

  if (!parsed.success) {
    return { error: "Enter a title and announcement text." };
  }

  const result = await createAnnouncement(supabase, user.id, parsed.data);

  if (!result) {
    return { error: "Could not post the announcement. Please try again." };
  }

  revalidatePath("/home");
  revalidatePath("/admin/announcements");

  return { success: true, postedAt: Date.now() };
}

export async function deleteAnnouncement(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;

  const { supabase, isAdmin } = await requireAdmin();

  if (!isAdmin) return;

  await deleteAnnouncementById(supabase, id);

  revalidatePath("/home");
  revalidatePath("/admin/announcements");
}
