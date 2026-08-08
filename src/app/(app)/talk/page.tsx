import { format } from "date-fns";
import { redirect } from "next/navigation";

import {
  deleteTalkPost,
  deleteTalkReply,
} from "@/app/(app)/talk/actions";
import { TalkPostForm } from "@/components/talk/talk-post-form";
import { TalkReplyForm } from "@/components/talk/talk-reply-form";
import { getAllProfiles, getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { getTalkPosts, getTalkReplies } from "@/lib/supabase/talk";

function formatDate(value: string) {
  try {
    return format(new Date(value), "MMM d · h:mm a");
  } catch {
    return value;
  }
}

export default async function TalkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile, posts, replies, profiles] = await Promise.all([
    getProfile(supabase, user.id),
    getTalkPosts(supabase),
    getTalkReplies(supabase),
    getAllProfiles(supabase),
  ]);

  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";
  const nameById = new Map(profiles.map((p) => [p.id, p.name]));

  const repliesByPost = new Map<string, typeof replies>();
  for (const reply of replies) {
    const list = repliesByPost.get(reply.post_id) ?? [];
    list.push(reply);
    repliesByPost.set(reply.post_id, list);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">Talk</h1>
        <p className="text-sm font-normal text-off-white/70">
          For important stuff that doesn&apos;t fit RSVP, payments, or
          announcements — side plans, questions, logistics rabbit holes. Keep
          it useful; this isn&apos;t a spam board.
        </p>
      </div>

      <div className="flex flex-col gap-4 border border-warm-gray/20 p-4">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          New thread
        </span>
        <TalkPostForm />
      </div>

      <div className="flex flex-col gap-6">
        {posts.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            No threads yet. Start one if something needs the group&apos;s brain.
          </p>
        ) : (
          posts.map((post) => {
            const postReplies = repliesByPost.get(post.id) ?? [];
            const canDeletePost =
              isAdmin || post.author_id === user.id;

            return (
              <article
                key={post.id}
                className="flex flex-col gap-3 border border-warm-gray/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-normal text-off-white">
                      {post.title}
                    </h2>
                    <p className="text-xs font-normal text-off-white/40">
                      {post.author_id
                        ? (nameById.get(post.author_id) ?? "Member")
                        : "Member"}{" "}
                      · {formatDate(post.created_at)}
                    </p>
                  </div>
                  {canDeletePost ? (
                    <form action={deleteTalkPost.bind(null, post.id)}>
                      <button
                        type="submit"
                        className="text-sm font-normal text-off-white/50 hover:text-off-white"
                      >
                        Delete
                      </button>
                    </form>
                  ) : null}
                </div>
                <p className="text-sm font-normal whitespace-pre-wrap text-off-white/80">
                  {post.body}
                </p>

                <div className="flex flex-col gap-3 border-t border-warm-gray/20 pt-3">
                  {postReplies.map((reply) => {
                    const canDeleteReply =
                      isAdmin || reply.author_id === user.id;
                    return (
                      <div
                        key={reply.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-normal text-off-white/40">
                            {reply.author_id
                              ? (nameById.get(reply.author_id) ?? "Member")
                              : "Member"}{" "}
                            · {formatDate(reply.created_at)}
                          </p>
                          <p className="text-sm font-normal whitespace-pre-wrap text-off-white/75">
                            {reply.body}
                          </p>
                        </div>
                        {canDeleteReply ? (
                          <form action={deleteTalkReply.bind(null, reply.id)}>
                            <button
                              type="submit"
                              className="text-xs font-normal text-off-white/40 hover:text-off-white"
                            >
                              Delete
                            </button>
                          </form>
                        ) : null}
                      </div>
                    );
                  })}
                  <TalkReplyForm postId={post.id} />
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
