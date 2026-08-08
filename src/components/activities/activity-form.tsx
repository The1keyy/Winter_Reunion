"use client";

import { useActionState, useState } from "react";

import {
  proposeActivity,
  type ActivityFormState,
} from "@/app/(app)/activities/actions";
import { AddOptionBox } from "@/components/guidance/add-option-box";
import { FormNotice } from "@/components/ui/form-notice";
import { activityCardSchema } from "@/lib/validations/activity";

interface FormValues {
  name: string;
  costPerPerson: string;
  linkUrl: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: ActivityFormState = {};
const initialValues: FormValues = {
  name: "",
  costPerPerson: "",
  linkUrl: "",
};

export function ActivityForm() {
  const [state, formAction, isPending] = useActionState(
    proposeActivity,
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
    const result = activityCardSchema.safeParse({
      ...nextValues,
      description: "",
      category: "",
    });

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "costPerPerson" || key === "linkUrl") {
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
    if (Object.keys(fieldErrors).length) validate(next);
  }

  return (
    <AddOptionBox label="Got something to add?" doneAt={state.postedAt}>
      {() => (
        <form
          action={formAction}
          onSubmit={(event) => {
            if (!validate(values)) event.preventDefault();
          }}
          noValidate
          className="flex flex-col gap-4"
        >
          <p className="wr-hint">
            Fill in whatever you have. Name or link is enough — price is a bonus.
          </p>

          <input type="hidden" name="description" value="" />
          <input type="hidden" name="category" value="" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7.5rem]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="wr-label">
                Name{" "}
                <span className="font-normal text-warm-gray">optional</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="off"
                placeholder="Night ski, dinner..."
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="wr-input"
              />
              {fieldErrors.name ? (
                <p className="text-sm text-off-white/70">{fieldErrors.name}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="costPerPerson" className="wr-label">
                $/person{" "}
                <span className="font-normal text-warm-gray">optional</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-warm-gray">
                  $
                </span>
                <input
                  id="costPerPerson"
                  name="costPerPerson"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="—"
                  value={values.costPerPerson}
                  onChange={(event) =>
                    updateField("costPerPerson", event.target.value)
                  }
                  className="wr-input pl-7"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="linkUrl" className="wr-label">
              Link{" "}
              <span className="font-normal text-warm-gray">optional</span>
            </label>
            <input
              id="linkUrl"
              name="linkUrl"
              type="url"
              inputMode="url"
              placeholder="https://..."
              value={values.linkUrl}
              onChange={(event) => updateField("linkUrl", event.target.value)}
              className="wr-input"
            />
            {fieldErrors.linkUrl ? (
              <p className="text-sm text-off-white/70">{fieldErrors.linkUrl}</p>
            ) : null}
          </div>

          {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}
          {state.success ? (
            <FormNotice tone="success">Posted. Crew can vote now.</FormNotice>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="wr-btn-primary w-full"
          >
            {isPending ? "Posting..." : "Drop it on the board"}
          </button>
        </form>
      )}
    </AddOptionBox>
  );
}
