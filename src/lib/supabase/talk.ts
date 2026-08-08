import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, TalkPost, TalkReply } from "@/types/database";

export async function getTalkPosts(
  supabase: SupabaseClient<Database>,
  limit?: number
): Promise<TalkPost[]> {
  let query = supabase
    .from("talk_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error("getTalkPosts failed", error);
    return [];
  }

  return data ?? [];
}

export async function getTalkReplies(
  supabase: SupabaseClient<Database>
): Promise<TalkReply[]> {
  const { data, error } = await supabase
    .from("talk_replies")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getTalkReplies failed", error);
    return [];
  }

  return data ?? [];
}

export interface TalkLikeRow {
  post_id: string;
  profile_id: string;
}

export async function getTalkLikes(
  supabase: SupabaseClient<Database>
): Promise<TalkLikeRow[]> {
  const { data, error } = await supabase
    .from("talk_post_likes")
    .select("post_id, profile_id");

  if (error) {
    // Table may not exist yet if the migration hasn't run — degrade quietly.
    console.error("getTalkLikes failed", error);
    return [];
  }

  return data ?? [];
}

export async function createTalkPost(
  supabase: SupabaseClient<Database>,
  authorId: string,
  title: string,
  body: string
): Promise<TalkPost | null> {
  const { data, error } = await supabase
    .from("talk_posts")
    .insert({ author_id: authorId, title, body })
    .select("*")
    .single();

  if (error) {
    console.error("createTalkPost failed", error);
    return null;
  }

  return data;
}

export async function createTalkReply(
  supabase: SupabaseClient<Database>,
  authorId: string,
  postId: string,
  body: string
): Promise<TalkReply | null> {
  const { data, error } = await supabase
    .from("talk_replies")
    .insert({ author_id: authorId, post_id: postId, body })
    .select("*")
    .single();

  if (error) {
    console.error("createTalkReply failed", error);
    return null;
  }

  return data;
}

export async function deleteTalkPostById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("talk_posts").delete().eq("id", id);

  if (error) {
    console.error("deleteTalkPostById failed", error);
    return false;
  }

  return true;
}

export async function deleteTalkReplyById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("talk_replies").delete().eq("id", id);

  if (error) {
    console.error("deleteTalkReplyById failed", error);
    return false;
  }

  return true;
}

export async function likeTalkPostById(
  supabase: SupabaseClient<Database>,
  postId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("talk_post_likes")
    .insert({ post_id: postId, profile_id: profileId });

  // Ignore unique-violation (already liked) — treat as success.
  if (error && error.code !== "23505") {
    console.error("likeTalkPostById failed", error);
    return false;
  }

  return true;
}

export async function unlikeTalkPostById(
  supabase: SupabaseClient<Database>,
  postId: string,
  profileId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("talk_post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("profile_id", profileId);

  if (error) {
    console.error("unlikeTalkPostById failed", error);
    return false;
  }

  return true;
}
