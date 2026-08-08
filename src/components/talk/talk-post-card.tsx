"use client";

import { MessageCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteTalkPost, deleteTalkReply } from "@/app/(app)/talk/actions";
import { TalkLikeButton } from "@/components/talk/talk-like-button";
import { TalkReplyForm } from "@/components/talk/talk-reply-form";
import { Avatar } from "@/components/ui/avatar";
import { relativeTime } from "@/lib/format-relative-time";
import type { TalkReply } from "@/types/database";

interface TalkPostCardProps {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  authorName: string;
  replies: TalkReply[];
  nameById: Map<string, string>;
  isAdmin: boolean;
  currentUserId: string;
  currentUserName: string;
  liked: boolean;
  likeCount: number;
  canDelete: boolean;
  startOpen?: boolean;
}

export function TalkPostCard({
  id,
  title,
  body,
  createdAt,
  authorName,
  replies,
  nameById,
  isAdmin,
  currentUserId,
  currentUserName,
  liked,
  likeCount,
  canDelete,
  startOpen = false,
}: TalkPostCardProps) {
  const [open, setOpen] = useState(startOpen);

  return (
    <article className="wr-post-card wr-fade-up flex gap-3">
      <Avatar name={authorName} size="md" className="mt-0.5" />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
            <span className="truncate text-sm font-semibold text-off-white">
              {authorName}
            </span>
            <span className="text-xs text-warm-gray">·</span>
            <span className="shrink-0 text-xs text-warm-gray">
              {relativeTime(createdAt)}
            </span>
          </div>
          {canDelete ? (
            <form action={deleteTalkPost.bind(null, id)}>
              <button
                type="submit"
                className="wr-icon-btn !min-h-8 !px-2 text-warm-gray hover:text-off-white"
                aria-label="Delete post"
              >
                <Trash2 className="size-3.5" />
              </button>
            </form>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-base font-semibold text-off-white">
            {title}
          </h2>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-off-white/80">
            {body}
          </p>
        </div>

        <div className="-ml-2.5 flex items-center gap-1">
          <TalkLikeButton
            postId={id}
            initialLiked={liked}
            initialCount={likeCount}
          />
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={"wr-icon-btn " + (open ? "text-ice" : "")}
          >
            <MessageCircle className="size-4" />
            <span className="tabular-nums">
              {replies.length > 0 ? replies.length : "Reply"}
            </span>
          </button>
        </div>

        {open ? (
          <div className="flex flex-col gap-3 border-t border-warm-gray/15 pt-3">
            {replies.map((reply) => {
              const replyAuthor = reply.author_id
                ? (nameById.get(reply.author_id) ?? "Member")
                : "Member";
              const canDeleteReply =
                isAdmin || reply.author_id === currentUserId;
              return (
                <div key={reply.id} className="flex items-start gap-2.5">
                  <Avatar name={replyAuthor} size="xs" className="mt-0.5" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-2xl bg-surface-raised/60 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-baseline gap-1.5 text-xs">
                        <span className="font-semibold text-off-white">
                          {replyAuthor}
                        </span>
                        <span className="text-warm-gray">
                          {relativeTime(reply.created_at)}
                        </span>
                      </span>
                      {canDeleteReply ? (
                        <form action={deleteTalkReply.bind(null, reply.id)}>
                          <button
                            type="submit"
                            className="text-warm-gray hover:text-off-white"
                            aria-label="Delete reply"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </form>
                      ) : null}
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-off-white/85">
                      {reply.body}
                    </p>
                  </div>
                </div>
              );
            })}

            <TalkReplyForm postId={id} myName={currentUserName} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
