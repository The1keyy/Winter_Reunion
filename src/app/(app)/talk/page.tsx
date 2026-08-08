import { redirect } from "next/navigation";

import { TalkComposer } from "@/components/talk/talk-composer";
import { TalkPostCard } from "@/components/talk/talk-post-card";
import { getAllProfiles, getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { getTalkLikes, getTalkPosts, getTalkReplies } from "@/lib/supabase/talk";

export default async function TalkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile, posts, replies, likes, profiles] = await Promise.all([
    getProfile(supabase, user.id),
    getTalkPosts(supabase),
    getTalkReplies(supabase),
    getTalkLikes(supabase),
    getAllProfiles(supabase),
  ]);

  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";
  const myName = profile?.name ?? "You";
  const nameById = new Map(profiles.map((p) => [p.id, p.name]));

  const repliesByPost = new Map<string, typeof replies>();
  for (const reply of replies) {
    const list = repliesByPost.get(reply.post_id) ?? [];
    list.push(reply);
    repliesByPost.set(reply.post_id, list);
  }

  const likeCountByPost = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const like of likes) {
    likeCountByPost.set(like.post_id, (likeCountByPost.get(like.post_id) ?? 0) + 1);
    if (like.profile_id === user.id) likedByMe.add(like.post_id);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <header className="wr-fade-up flex flex-col gap-1">
        <span className="wr-section-label">The feed</span>
        <h1 className="font-heading text-2xl font-semibold text-off-white md:text-3xl">
          Talk
        </h1>
        <p className="text-sm text-off-white/70">
          Post it, like it, reply to it. Anything that doesn&apos;t fit RSVP or
          announcements lives here.
        </p>
      </header>

      <TalkComposer myName={myName} />

      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <p className="wr-hint px-2">
            Quiet in here. Be the first to post something.
          </p>
        ) : (
          posts.map((post, index) => {
            const authorName = post.author_id
              ? (nameById.get(post.author_id) ?? "Member")
              : "Member";
            const canDelete = isAdmin || post.author_id === user.id;
            const postReplies = repliesByPost.get(post.id) ?? [];

            return (
              <TalkPostCard
                key={post.id}
                id={post.id}
                title={post.title}
                body={post.body}
                createdAt={post.created_at}
                authorName={authorName}
                replies={postReplies}
                nameById={nameById}
                isAdmin={isAdmin}
                currentUserId={user.id}
                currentUserName={myName}
                liked={likedByMe.has(post.id)}
                likeCount={likeCountByPost.get(post.id) ?? 0}
                canDelete={canDelete}
                startOpen={index === 0 && postReplies.length > 0}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
