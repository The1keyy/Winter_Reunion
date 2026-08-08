"use server";

import { revalidatePath } from "next/cache";

import {
  addSuggestionVote,
  createSuggestion,
  deleteSuggestionById,
  removeSuggestionVote,
  updateSuggestionStatus,
} from "@/lib/supabase/suggestions";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { suggestionSchema } from "@/lib/validations/suggestion";
import type { SuggestionStatus } from "@/types/database";

export interface SuggestionFormState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

export async function proposeSuggestion(
  _prevState: SuggestionFormState,
  formData: FormData
): Promise<SuggestionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const parsed = suggestionSchema.safeParse({
    category: formData.get("category"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: "Enter a category and title." };
  }

  const result = await createSuggestion(supabase, user.id, parsed.data);

  if (!result) {
    return { error: "Could not add the suggestion. Please try again." };
  }

  revalidatePath("/suggestions");

  return { success: true, postedAt: Date.now() };
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

export async function setSuggestionStatus(
  id: string,
  status: SuggestionStatus,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updateSuggestionStatus(supabase, id, status);
  revalidatePath("/suggestions");
}

export async function deleteSuggestion(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  // Relies on RLS ("suggestions_delete_own_or_admin") to enforce that only
  // the author or an admin can actually delete the row.
  const supabase = await createClient();
  await deleteSuggestionById(supabase, id);
  revalidatePath("/suggestions");
}

export async function voteForSuggestion(
  suggestionId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await addSuggestionVote(supabase, suggestionId, user.id);
  revalidatePath("/suggestions");
}

export async function removeVoteForSuggestion(
  suggestionId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await removeSuggestionVote(supabase, suggestionId, user.id);
  revalidatePath("/suggestions");
}
