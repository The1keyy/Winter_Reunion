"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createTalkPost,
  createTalkReply,
  deleteTalkPostById,
  deleteTalkReplyById,
} from "@/lib/supabase/talk";
import { talkPostSchema, talkReplySchema } from "@/lib/validations/talk";

export interface TalkPostState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

export interface TalkReplyState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

export async function postTalk(
  _prevState: TalkPostState,
  formData: FormData
): Promise<TalkPostState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const parsed = talkPostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: "Add a title and a short message." };
  }

  const result = await createTalkPost(
    supabase,
    user.id,
    parsed.data.title,
    parsed.data.body
  );

  if (!result) {
    return { error: "Could not post. Please try again." };
  }

  revalidatePath("/talk");
  revalidatePath("/home");

  return { success: true, postedAt: Date.now() };
}

export async function replyToTalk(
  postId: string,
  _prevState: TalkReplyState,
  formData: FormData
): Promise<TalkReplyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const parsed = talkReplySchema.safeParse({
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: "Write a reply first." };
  }

  const result = await createTalkReply(
    supabase,
    user.id,
    postId,
    parsed.data.body
  );

  if (!result) {
    return { error: "Could not reply. Please try again." };
  }

  revalidatePath("/talk");

  return { success: true, postedAt: Date.now() };
}

export async function deleteTalkPost(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  await deleteTalkPostById(supabase, id);
  revalidatePath("/talk");
  revalidatePath("/home");
}

export async function deleteTalkReply(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  // RLS enforces own-or-admin.
  await deleteTalkReplyById(supabase, id);
  revalidatePath("/talk");
}
