"use client";

import { useActionState, useState } from "react";

import { submitRsvp, type RsvpState } from "@/app/(app)/rsvp/actions";
import { registrationSchema } from "@/lib/validations/registration";
import type { Registration } from "@/types/database";

interface RsvpFormProps {
  registration: Registration | null;
}

interface FormValues {
  attending: "yes" | "no";
  guestsCount: string;
  dietaryRestrictions: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: RsvpState = {};

function toFormValues(registration: Registration | null): FormValues {
  return {
    attending: registration ? (registration.attending ? "yes" : "no") : "yes",
    guestsCount: registration ? String(registration.guests_count) : "0",
    dietaryRestrictions: registration?.dietary_restrictions ?? "",
    notes: registration?.notes ?? "",
  };
}

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";
const labelClass = "text-sm font-normal text-off-white/80";

export function RsvpForm({ registration }: RsvpFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitRsvp,
    initialState
  );
  const [values, setValues] = useState<FormValues>(() =>
    toFormValues(registration)
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(nextValues: FormValues) {
    const result = registrationSchema.safeParse(nextValues);

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
      className="flex w-full flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <span className={labelClass}>Are you attending?</span>
        <div className="flex gap-6">
          {(["yes", "no"] as const).map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-sm font-normal text-off-white"
            >
              <input
                type="radio"
                name="attending"
                value={option}
                checked={values.attending === option}
                onChange={() => updateField("attending", option)}
                className="accent-off-white"
              />
              {option === "yes" ? "Yes, I'm in" : "No, can't make it"}
            </label>
          ))}
        </div>
        {fieldErrors.attending ? (
          <p className="text-sm text-off-white/70">{fieldErrors.attending}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="guestsCount" className={labelClass}>
          Guests you&apos;re bringing (not counting yourself)
        </label>
        <input
          id="guestsCount"
          name="guestsCount"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={values.guestsCount}
          onChange={(event) =>
            updateField("guestsCount", event.target.value)
          }
          className={inputClass}
        />
        {fieldErrors.guestsCount ? (
          <p className="text-sm text-off-white/70">
            {fieldErrors.guestsCount}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dietaryRestrictions" className={labelClass}>
          Dietary restrictions
        </label>
        <textarea
          id="dietaryRestrictions"
          name="dietaryRestrictions"
          rows={2}
          value={values.dietaryRestrictions}
          onChange={(event) =>
            updateField("dietaryRestrictions", event.target.value)
          }
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-off-white/90">{state.error}</p>
      ) : null}

      {state.success ? (
        <p className="text-sm text-off-white/90">RSVP saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save RSVP"}
      </button>
    </form>
  );
}
