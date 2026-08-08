"use client";

import { useActionState, useState } from "react";

import { replyToTalk, type TalkReplyState } from "@/app/(app)/talk/actions";
import { FormNotice } from "@/components/ui/form-notice";
import { talkReplySchema } from "@/lib/validations/talk";

interface TalkReplyFormProps {
  postId: string;
}

const initialState: TalkReplyState = {};

export function TalkReplyForm({ postId }: TalkReplyFormProps) {
  const [state, formAction, isPending] = useActionState(
    replyToTalk.bind(null, postId),
    initialState
  );
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [lastPostedAt, setLastPostedAt] = useState<number | undefined>();

  if (state.postedAt && state.postedAt !== lastPostedAt) {
    setLastPostedAt(state.postedAt);
    setBody("");
    setError(undefined);
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const result = talkReplySchema.safeParse({ body });
        if (!result.success) {
          event.preventDefault();
          setError(result.error.issues[0]?.message);
        }
      }}
      noValidate
      className="flex flex-col gap-2"
    >
      <textarea
        name="body"
        rows={2}
        placeholder="Reply..."
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="border border-warm-gray/40 bg-transparent px-3 py-2 text-sm text-off-white outline-none focus:border-off-white resize-none"
      />
      {error || state.error ? (
        <FormNotice tone="error">{error ?? state.error}</FormNotice>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Reply"}
      </button>
    </form>
  );
}
