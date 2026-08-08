"use client";

import { useActionState, useState } from "react";

import { postTalk, type TalkPostState } from "@/app/(app)/talk/actions";
import { FormNotice } from "@/components/ui/form-notice";
import { talkPostSchema } from "@/lib/validations/talk";

interface FormValues {
  title: string;
  body: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: TalkPostState = {};
const initialValues: FormValues = { title: "", body: "" };

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";

export function TalkPostForm() {
  const [state, formAction, isPending] = useActionState(postTalk, initialState);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [lastPostedAt, setLastPostedAt] = useState<number | undefined>();

  if (state.postedAt && state.postedAt !== lastPostedAt) {
    setLastPostedAt(state.postedAt);
    setValues(initialValues);
    setFieldErrors({});
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
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!validate(values)) event.preventDefault();
      }}
      noValidate
      className="flex w-full flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-normal text-off-white/80">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Something important that doesn't fit elsewhere"
          value={values.title}
          onChange={(event) =>
            setValues({ ...values, title: event.target.value })
          }
          className={inputClass}
        />
        {fieldErrors.title ? (
          <p className="text-sm text-off-white/70">{fieldErrors.title}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="body" className="text-sm font-normal text-off-white/80">
          What&apos;s on your mind
        </label>
        <textarea
          id="body"
          name="body"
          rows={3}
          placeholder="Ride swaps, dietary rabbit holes, side plans, questions..."
          value={values.body}
          onChange={(event) =>
            setValues({ ...values, body: event.target.value })
          }
          className={`${inputClass} resize-none`}
        />
        {fieldErrors.body ? (
          <p className="text-sm text-off-white/70">{fieldErrors.body}</p>
        ) : null}
      </div>
      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Start a thread"}
      </button>
    </form>
  );
}
