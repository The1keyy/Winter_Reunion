"use client";

import { useActionState, useState } from "react";

import { postTalk, type TalkPostState } from "@/app/(app)/talk/actions";
import { Avatar } from "@/components/ui/avatar";
import { FormNotice } from "@/components/ui/form-notice";
import { talkPostSchema } from "@/lib/validations/talk";

interface FormValues {
  title: string;
  body: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: TalkPostState = {};
const initialValues: FormValues = { title: "", body: "" };

export function TalkComposer({ myName }: { myName: string }) {
  const [state, formAction, isPending] = useActionState(postTalk, initialState);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [expanded, setExpanded] = useState(false);
  const [lastPostedAt, setLastPostedAt] = useState<number | undefined>();

  if (state.postedAt && state.postedAt !== lastPostedAt) {
    setLastPostedAt(state.postedAt);
    setValues(initialValues);
    setFieldErrors({});
    setExpanded(false);
  }

  function validate(next: FormValues) {
    const result = talkPostSchema.safeParse(next);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") {
        errors[key as keyof FormValues] = issue.message;
      }
    }
    setFieldErrors(errors);
    return false;
  }

  return (
    <div className="wr-post-card flex gap-3">
      <Avatar name={myName} size="md" className="mt-0.5" />
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!validate(values)) event.preventDefault();
        }}
        noValidate
        className="flex flex-1 flex-col gap-3"
      >
        {expanded ? (
          <input
            id="title"
            name="title"
            type="text"
            autoComplete="off"
            placeholder="Give it a headline"
            value={values.title}
            onChange={(event) =>
              setValues({ ...values, title: event.target.value })
            }
            className="w-full border-none bg-transparent text-base font-semibold text-off-white outline-none placeholder:text-warm-gray/70"
          />
        ) : null}
        <textarea
          id="body"
          name="body"
          rows={expanded ? 3 : 1}
          placeholder="What's on your mind, crew?"
          value={values.body}
          onFocus={() => setExpanded(true)}
          onChange={(event) =>
            setValues({ ...values, body: event.target.value })
          }
          className="w-full resize-none border-none bg-transparent text-[15px] text-off-white outline-none placeholder:text-warm-gray/70"
        />

        {fieldErrors.title ? (
          <p className="text-sm text-off-white/70">{fieldErrors.title}</p>
        ) : null}
        {fieldErrors.body ? (
          <p className="text-sm text-off-white/70">{fieldErrors.body}</p>
        ) : null}
        {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}

        {expanded ? (
          <div className="flex items-center justify-end gap-2 border-t border-warm-gray/15 pt-3">
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setValues(initialValues);
                setFieldErrors({});
              }}
              className="wr-btn !min-h-9 !px-3.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="wr-btn-primary !min-h-9 !px-4 text-xs"
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
