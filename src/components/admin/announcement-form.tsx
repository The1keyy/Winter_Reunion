"use client";

import { useActionState, useState } from "react";

import {
  postAnnouncement,
  type AnnouncementState,
} from "@/app/(app)/admin/announcements/actions";
import { announcementSchema } from "@/lib/validations/announcement";

interface FormValues {
  title: string;
  body: string;
  pinned: boolean;
}

type FieldErrors = Partial<Record<"title" | "body", string>>;

const initialState: AnnouncementState = {};
const initialValues: FormValues = { title: "", body: "", pinned: false };

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";
const labelClass = "text-sm font-normal text-off-white/80";

export function AnnouncementForm() {
  const [state, formAction, isPending] = useActionState(
    postAnnouncement,
    initialState
  );
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [lastPostedAt, setLastPostedAt] = useState<number | undefined>();

  if (state.postedAt && state.postedAt !== lastPostedAt) {
    setLastPostedAt(state.postedAt);
    setValues(initialValues);
    setFieldErrors({});
  }

  function validate(nextValues: FormValues) {
    const result = announcementSchema.safeParse(nextValues);

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (key === "title" || key === "body") {
        errors[key] = issue.message;
      }
    }
    setFieldErrors(errors);
    return false;
  }

  function updateField<K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (key !== "pinned" && fieldErrors[key as "title" | "body"]) {
      validate(next);
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!validate(values)) {
          event.preventDefault();
        }
      }}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={inputClass}
        />
        {fieldErrors.title ? (
          <p className="text-sm text-off-white/70">{fieldErrors.title}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="body" className={labelClass}>
          Message
        </label>
        <textarea
          id="body"
          name="body"
          rows={4}
          value={values.body}
          onChange={(event) => updateField("body", event.target.value)}
          className={`${inputClass} resize-none`}
        />
        {fieldErrors.body ? (
          <p className="text-sm text-off-white/70">{fieldErrors.body}</p>
        ) : null}
      </div>

      <label className="flex w-fit items-center gap-2 text-sm font-normal text-off-white">
        <input
          type="checkbox"
          name="pinned"
          checked={values.pinned}
          onChange={(event) => updateField("pinned", event.target.checked)}
          className="accent-off-white"
        />
        Pin to top
      </label>

      {state.error ? (
        <p className="text-sm text-off-white/90">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post announcement"}
      </button>
    </form>
  );
}
