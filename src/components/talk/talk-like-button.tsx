"use client";

import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import { likeTalkPost, unlikeTalkPost } from "@/app/(app)/talk/actions";

interface TalkLikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function TalkLikeButton({
  postId,
  initialLiked,
  initialCount,
}: TalkLikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (_current, liked: boolean) => ({
      liked,
      count: initialCount + (liked ? 1 : 0) - (initialLiked ? 1 : 0),
    })
  );

  function toggle() {
    const next = !state.liked;
    startTransition(async () => {
      setOptimistic(next);
      const formData = new FormData();
      if (next) {
        await likeTalkPost(postId, formData);
      } else {
        await unlikeTalkPost(postId, formData);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={state.liked}
      className={
        "wr-icon-btn " + (state.liked ? "wr-icon-btn-active" : "")
      }
    >
      <Heart
        key={state.liked ? "liked" : "unliked"}
        className={
          "size-4 transition-transform " + (state.liked ? "wr-pop" : "")
        }
        fill={state.liked ? "currentColor" : "none"}
        strokeWidth={2}
      />
      <span className="tabular-nums">
        {state.count > 0 ? state.count : "Like"}
      </span>
    </button>
  );
}
