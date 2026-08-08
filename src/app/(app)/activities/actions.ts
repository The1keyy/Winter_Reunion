"use server";

import { revalidatePath } from "next/cache";

import {
  createActivity,
  deleteActivityById,
  setActivityResponse,
  updateActivityStatus,
} from "@/lib/supabase/activities";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { activitySchema } from "@/lib/validations/activity";
import type { ActivityResponseValue } from "@/types/database";

export interface ActivityFormState {
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

export async function proposeActivity(
  _prevState: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!user || !isAdmin) {
    return { error: "Only trip admins can propose activities." };
  }

  const parsed = activitySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    activityDate: formData.get("activityDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    location: formData.get("location"),
    costPerPerson: formData.get("costPerPerson"),
  });

  if (!parsed.success) {
    return { error: "Check that all fields are filled in correctly." };
  }

  const result = await createActivity(supabase, user.id, {
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category,
    activity_date: parsed.data.activityDate,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    location: parsed.data.location,
    cost_per_person: parsed.data.costPerPerson,
  });

  if (!result) {
    return { error: "Could not add the activity. Please try again." };
  }

  revalidatePath("/activities");

  return { success: true, postedAt: Date.now() };
}

export async function confirmActivity(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updateActivityStatus(supabase, id, "confirmed");
  revalidatePath("/activities");
}

export async function cancelActivity(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updateActivityStatus(supabase, id, "cancelled");
  revalidatePath("/activities");
}

export async function reopenActivity(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updateActivityStatus(supabase, id, "proposed");
  revalidatePath("/activities");
}

export async function deleteActivity(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await deleteActivityById(supabase, id);
  revalidatePath("/activities");
}

export async function respondToActivity(
  activityId: string,
  response: ActivityResponseValue,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await setActivityResponse(supabase, activityId, user.id, response);
  revalidatePath("/activities");
}
