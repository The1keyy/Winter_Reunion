"use server";

import { revalidatePath } from "next/cache";

import { getProfile } from "@/lib/supabase/profiles";
import {
  createPollWithOptions,
  deletePollById,
  removePollVote,
  setPollVote,
  updatePollStatus,
} from "@/lib/supabase/polls";
import { createClient } from "@/lib/supabase/server";
import { pollSchema } from "@/lib/validations/poll";

export interface PollFormState {
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

export async function createPoll(
  _prevState: PollFormState,
  formData: FormData
): Promise<PollFormState> {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!user || !isAdmin) {
    return { error: "Only trip admins can create polls." };
  }

  const parsed = pollSchema.safeParse({
    question: formData.get("question"),
    description: formData.get("description"),
    option1: formData.get("option1"),
    option2: formData.get("option2"),
    option3: formData.get("option3"),
    option4: formData.get("option4"),
  });

  if (!parsed.success) {
    return { error: "Enter a question and at least two options." };
  }

  const optionTexts = [
    parsed.data.option1,
    parsed.data.option2,
    parsed.data.option3,
    parsed.data.option4,
  ].filter((text): text is string => text !== null);

  const result = await createPollWithOptions(
    supabase,
    user.id,
    parsed.data.question,
    parsed.data.description,
    optionTexts
  );

  if (!result) {
    return { error: "Could not create the poll. Please try again." };
  }

  revalidatePath("/polls");

  return { success: true, postedAt: Date.now() };
}

export async function closePoll(id: string, _formData: FormData): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updatePollStatus(supabase, id, "closed");
  revalidatePath("/polls");
}

export async function reopenPoll(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updatePollStatus(supabase, id, "open");
  revalidatePath("/polls");
}

export async function deletePoll(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await deletePollById(supabase, id);
  revalidatePath("/polls");
}

export async function voteInPoll(
  pollId: string,
  optionId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await setPollVote(supabase, pollId, optionId, user.id);
  revalidatePath("/polls");
}

export async function clearMyPollVote(
  pollId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await removePollVote(supabase, pollId, user.id);
  revalidatePath("/polls");
}
