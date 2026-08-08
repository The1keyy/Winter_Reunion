"use client";

import { useActionState, useState } from "react";

import {
  addPayment,
  type PaymentFormState,
} from "@/app/(app)/payments/actions";
import { FormNotice } from "@/components/ui/form-notice";
import { paymentSchema } from "@/lib/validations/payment";
import type { Profile } from "@/types/database";

interface PaymentFormProps {
  profiles: Profile[];
}

interface FormValues {
  profileId: string;
  description: string;
  category: string;
  amount: string;
  dueDate: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: PaymentFormState = {};

function initialValues(profiles: Profile[]): FormValues {
  return {
    profileId: profiles[0]?.id ?? "",
    description: "",
    category: "",
    amount: "",
    dueDate: "",
    notes: "",
  };
}

export function PaymentForm({ profiles }: PaymentFormProps) {
  const [state, formAction, isPending] = useActionState(
    addPayment,
    initialState
  );
  const [values, setValues] = useState<FormValues>(() =>
    initialValues(profiles)
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [lastPostedAt, setLastPostedAt] = useState<number | undefined>();

  if (state.postedAt && state.postedAt !== lastPostedAt) {
    setLastPostedAt(state.postedAt);
    setValues({ ...initialValues(profiles), profileId: values.profileId });
    setFieldErrors({});
  }

  function validate(nextValues: FormValues) {
    const result = paymentSchema.safeParse(nextValues);

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

  if (profiles.length === 0) {
    return <p className="wr-hint">No members yet.</p>;
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profileId" className="wr-label">
            Member
          </label>
          <select
            id="profileId"
            name="profileId"
            value={values.profileId}
            onChange={(event) => updateField("profileId", event.target.value)}
            className="wr-input bg-surface"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id} className="bg-charcoal">
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="wr-label">
            Amount ($)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            value={values.amount}
            onChange={(event) => updateField("amount", event.target.value)}
            className="wr-input"
          />
          {fieldErrors.amount ? (
            <p className="text-sm text-off-white/70">{fieldErrors.amount}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="wr-label">
          What for
        </label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Cabin deposit, food run..."
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="wr-input"
        />
        {fieldErrors.description ? (
          <p className="text-sm text-off-white/70">{fieldErrors.description}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="wr-label">
            Category{" "}
            <span className="font-normal text-warm-gray">optional</span>
          </label>
          <input
            id="category"
            name="category"
            type="text"
            placeholder="Lodging, food..."
            value={values.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="wr-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dueDate" className="wr-label">
            Due date{" "}
            <span className="font-normal text-warm-gray">optional</span>
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={values.dueDate}
            onChange={(event) => updateField("dueDate", event.target.value)}
            className="wr-input"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="wr-label">
          Notes <span className="font-normal text-warm-gray">optional</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Venmo handle, cash, etc."
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className="wr-input resize-none"
        />
      </div>

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}
      {state.success ? (
        <FormNotice tone="success">Charge added to the ledger.</FormNotice>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="wr-btn-primary w-full sm:w-fit"
      >
        {isPending ? "Adding..." : "Add charge"}
      </button>
    </form>
  );
}
