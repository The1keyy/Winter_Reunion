"use client";

import { useActionState, useState } from "react";

import { submitRsvp, type RsvpState } from "@/app/(app)/rsvp/actions";
import { FormNotice } from "@/components/ui/form-notice";
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
        <span className="wr-label">Are you attending?</span>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: "yes" as const, label: "I'm in" },
            { value: "no" as const, label: "Can't make it" },
          ]).map((option) => {
            const selected = values.attending === option.value;
            return (
              <label
                key={option.value}
                className={
                  "flex min-h-14 cursor-pointer items-center justify-center border px-3 text-sm font-semibold transition-[border-color,background-color,transform] duration-150 active:scale-[0.98] " +
                  (selected
                    ? "border-ember bg-ember/15 text-ember"
                    : "border-warm-gray/40 text-off-white/80 hover:border-off-white/60")
                }
              >
                <input
                  type="radio"
                  name="attending"
                  value={option.value}
                  checked={selected}
                  onChange={() => updateField("attending", option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
        {fieldErrors.attending ? (
          <p className="text-sm text-off-white/70">{fieldErrors.attending}</p>
        ) : (
          <p className="wr-hint">Tap one. You can change it later.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="guestsCount" className="wr-label">
          Extra guests (not you)
        </label>
        <input
          id="guestsCount"
          name="guestsCount"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={values.guestsCount}
          onChange={(event) => updateField("guestsCount", event.target.value)}
          className="wr-input"
        />
        {fieldErrors.guestsCount ? (
          <p className="text-sm text-off-white/70">{fieldErrors.guestsCount}</p>
        ) : (
          <p className="wr-hint">0 if it&apos;s just you.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dietaryRestrictions" className="wr-label">
          Dietary restrictions (optional)
        </label>
        <textarea
          id="dietaryRestrictions"
          name="dietaryRestrictions"
          rows={2}
          value={values.dietaryRestrictions}
          onChange={(event) =>
            updateField("dietaryRestrictions", event.target.value)
          }
          className="wr-input resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="wr-label">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className="wr-input resize-none"
        />
      </div>

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}

      {state.success ? (
        <FormNotice tone="success">
          RSVP saved. You can come back and update it anytime.
        </FormNotice>
      ) : null}

      <button type="submit" disabled={isPending} className="wr-btn-primary w-full">
        {isPending ? "Saving..." : "Save RSVP"}
      </button>
    </form>
  );
}
