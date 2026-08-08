"use client";

import { useActionState, useState } from "react";

import { replyToTalk, type TalkReplyState } from "@/app/(app)/talk/actions";
import { Avatar } from "@/components/ui/avatar";
import { FormNotice } from "@/components/ui/form-notice";
import { talkReplySchema } from "@/lib/validations/talk";

interface TalkReplyFormProps {
  postId: string;
  myName: string;
}

const initialState: TalkReplyState = {};

export function TalkReplyForm({ postId, myName }: TalkReplyFormProps) {
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
      className="flex items-start gap-2.5"
    >
      <Avatar name={myName} size="xs" className="mt-1.5" />
      <div className="flex flex-1 items-center gap-2">
        <input
          name="body"
          type="text"
          placeholder="Reply..."
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="wr-input !py-2 flex-1 !rounded-full text-sm"
        />
        <button
          type="submit"
          disabled={isPending || body.trim().length === 0}
          className="wr-icon-btn shrink-0 text-ice disabled:opacity-40"
        >
          {isPending ? "..." : "Send"}
        </button>
      </div>
      {error || state.error ? (
        <div className="basis-full pl-8">
          <FormNotice tone="error">{error ?? state.error}</FormNotice>
        </div>
      ) : null}
    </form>
  );
}
