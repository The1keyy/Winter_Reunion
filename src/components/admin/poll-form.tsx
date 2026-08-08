"use client";

import { useActionState, useState } from "react";

import { createPoll, type PollFormState } from "@/app/(app)/polls/actions";
import { pollSchema } from "@/lib/validations/poll";

interface FormValues {
  question: string;
  description: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: PollFormState = {};
const initialValues: FormValues = {
  question: "",
  description: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
};

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";
const labelClass = "text-sm font-normal text-off-white/80";

export function PollForm() {
  const [state, formAction, isPending] = useActionState(
    createPoll,
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
    const result = pollSchema.safeParse(nextValues);

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
      <div className="flex flex-col gap-2">
        <label htmlFor="question" className={labelClass}>
          Question
        </label>
        <input
          id="question"
          name="question"
          type="text"
          value={values.question}
          onChange={(event) => updateField("question", event.target.value)}
          className={inputClass}
        />
        {fieldErrors.question ? (
          <p className="text-sm text-off-white/70">{fieldErrors.question}</p>
        ) : null}
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

      <div className="flex flex-col gap-3">
        <span className={labelClass}>Options</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["option1", "option2", "option3", "option4"] as const).map(
            (key, index) => (
              <div key={key} className="flex flex-col gap-2">
                <input
                  id={key}
                  name={key}
                  type="text"
                  placeholder={
                    index < 2 ? `Option ${index + 1}` : `Option ${index + 1} (optional)`
                  }
                  value={values[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  className={inputClass}
                />
                {fieldErrors[key] ? (
                  <p className="text-sm text-off-white/70">
                    {fieldErrors[key]}
                  </p>
                ) : null}
              </div>
            )
          )}
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-off-white/90">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create poll"}
      </button>
    </form>
  );
}
