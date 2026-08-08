"use client";

import { useActionState, useState } from "react";

import {
  postAnnouncement,
  type AnnouncementState,
} from "@/app/(app)/admin/announcements/actions";
import { FormNotice } from "@/components/ui/form-notice";
import { announcementSchema } from "@/lib/validations/announcement";

interface FormValues {
  title: string;
  body: string;
  linkUrl: string;
  pinned: boolean;
}

type FieldErrors = Partial<Record<"title" | "body" | "linkUrl", string>>;

const initialState: AnnouncementState = {};
const initialValues: FormValues = {
  title: "",
  body: "",
  linkUrl: "",
  pinned: false,
};

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
      if (key === "title" || key === "body" || key === "linkUrl") {
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
    if (key !== "pinned" && fieldErrors[key as keyof FieldErrors]) {
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
      <p className="text-sm font-normal text-off-white/60">
        Keep it short. Lead with what people need to do, then paste a link if
        they need to open Airbnb, Vrbo, Venmo, a map, or a doc.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Cabin shortlist is up"
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
          placeholder="We narrowed it to 3 options. Vote by Friday."
          value={values.body}
          onChange={(event) => updateField("body", event.target.value)}
          className={`${inputClass} resize-none`}
        />
        {fieldErrors.body ? (
          <p className="text-sm text-off-white/70">{fieldErrors.body}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="linkUrl" className={labelClass}>
          Link (optional)
        </label>
        <input
          id="linkUrl"
          name="linkUrl"
          type="url"
          inputMode="url"
          placeholder="https://www.airbnb.com/rooms/..."
          value={values.linkUrl}
          onChange={(event) => updateField("linkUrl", event.target.value)}
          className={inputClass}
        />
        {fieldErrors.linkUrl ? (
          <p className="text-sm text-off-white/70">{fieldErrors.linkUrl}</p>
        ) : (
          <p className="text-sm font-normal text-off-white/50">
            Paste the full URL. People will tap it right from the update.
          </p>
        )}
      </div>

      <label className="flex w-fit items-center gap-2 text-sm font-normal text-off-white">
        <input
          type="checkbox"
          name="pinned"
          checked={values.pinned}
          onChange={(event) => updateField("pinned", event.target.checked)}
          className="accent-off-white"
        />
        Pin to top (important / keep visible)
      </label>

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}
      {state.success ? (
        <FormNotice tone="success">
          Posted. Everyone will see it on Home under group updates.
        </FormNotice>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post update"}
      </button>
    </form>
  );
}
