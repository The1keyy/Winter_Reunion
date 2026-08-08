"use server";

import { revalidatePath } from "next/cache";

import { fetchLinkPreview } from "@/lib/link-preview";
import {
  clearActivityResponse,
  createActivity,
  deleteActivityById,
  setActivityResponse,
  updateActivityStatus,
} from "@/lib/supabase/activities";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { activityCardSchema } from "@/lib/validations/activity";
import type { ActivityResponseValue } from "@/types/database";

export interface ActivityFormState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

async function requireUser() {
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

export async function proposeActivity(
  _prevState: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: "Sign in to add an activity card." };
  }

  const parsed = activityCardSchema.safeParse({
    name: formData.get("name"),
    linkUrl: formData.get("linkUrl"),
    costPerPerson: formData.get("costPerPerson"),
    description: formData.get("description"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Check that all fields are filled in correctly.",
    };
  }

  let linkTitle: string | null = null;
  let linkDescription: string | null = null;
  let linkImage: string | null = null;
  let hostname: string | null = null;

  if (parsed.data.linkUrl) {
    const preview = await fetchLinkPreview(parsed.data.linkUrl);
    if (preview) {
      linkTitle = preview.title;
      linkDescription = preview.description;
      linkImage = preview.image;
      hostname = preview.hostname;
    }
  }

  const name =
    parsed.data.name ||
    linkTitle ||
    hostname ||
    "Untitled activity";

  const result = await createActivity(supabase, user.id, {
    name,
    description: parsed.data.description,
    category: parsed.data.category,
    activity_date: null,
    start_time: null,
    end_time: null,
    location: null,
    cost_per_person: parsed.data.costPerPerson,
    link_url: parsed.data.linkUrl,
    link_title: linkTitle,
    link_description: linkDescription,
    link_image: linkImage,
  });

  if (!result) {
    return {
      error:
        "Could not add the card. If this keeps failing, ask Key to run the latest database update.",
    };
  }

  revalidatePath("/activities");
  revalidatePath("/home");

  return { success: true, postedAt: Date.now() };
}

export async function confirmActivity(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireUser();
  if (!isAdmin) return;

  await updateActivityStatus(supabase, id, "confirmed");
  revalidatePath("/activities");
}

export async function cancelActivity(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireUser();
  if (!isAdmin) return;

  await updateActivityStatus(supabase, id, "cancelled");
  revalidatePath("/activities");
}

export async function reopenActivity(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireUser();
  if (!isAdmin) return;

  await updateActivityStatus(supabase, id, "proposed");
  revalidatePath("/activities");
}

export async function deleteActivity(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireUser();
  if (!isAdmin) return;

  await deleteActivityById(supabase, id);
  revalidatePath("/activities");
  revalidatePath("/home");
}

export async function respondToActivity(
  activityId: string,
  response: Extract<ActivityResponseValue, "yes" | "no">,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, user } = await requireUser();
  if (!user) return;

  await setActivityResponse(supabase, activityId, user.id, response);
  revalidatePath("/activities");
  revalidatePath("/home");
}

export async function retractActivityVote(
  activityId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, user } = await requireUser();
  if (!user) return;

  await clearActivityResponse(supabase, activityId, user.id);
  revalidatePath("/activities");
  revalidatePath("/home");
}
