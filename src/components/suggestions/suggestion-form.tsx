"use client";

import { useActionState, useState } from "react";

import {
  proposeSuggestion,
  type SuggestionFormState,
} from "@/app/(app)/suggestions/actions";
import { suggestionSchema } from "@/lib/validations/suggestion";

interface FormValues {
  category: string;
  title: string;
  description: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: SuggestionFormState = {};
const initialValues: FormValues = { category: "", title: "", description: "" };

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";
const labelClass = "text-sm font-normal text-off-white/80";

export function SuggestionForm() {
  const [state, formAction, isPending] = useActionState(
    proposeSuggestion,
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
    const result = suggestionSchema.safeParse(nextValues);

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

  function updateField<K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (fieldErrors[key]) validate(next);
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <input
            id="category"
            name="category"
            type="text"
            placeholder="Food, activities, lodging..."
            value={values.category}
            onChange={(event) => updateField("category", event.target.value)}
            className={inputClass}
          />
          {fieldErrors.category ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.category}
            </p>
          ) : null}
        </div>

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
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          value={values.description}
          onChange={(event) =>
            updateField("description", event.target.value)
          }
          className={`${inputClass} resize-none`}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-off-white/90">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add suggestion"}
      </button>
    </form>
  );
}
