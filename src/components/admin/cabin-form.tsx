"use client";

import { useActionState, useState } from "react";

import {
  proposeCabin,
  type CabinFormState,
} from "@/app/(app)/cabins/actions";
import { cabinSchema } from "@/lib/validations/cabin";

interface FormValues {
  name: string;
  url: string;
  location: string;
  priceTotal: string;
  pricePerPerson: string;
  bedrooms: string;
  bathrooms: string;
  maxOccupancy: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: CabinFormState = {};
const initialValues: FormValues = {
  name: "",
  url: "",
  location: "",
  priceTotal: "",
  pricePerPerson: "",
  bedrooms: "",
  bathrooms: "",
  maxOccupancy: "",
  notes: "",
};

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";
const labelClass = "text-sm font-normal text-off-white/80";

export function CabinForm() {
  const [state, formAction, isPending] = useActionState(
    proposeCabin,
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
    const result = cabinSchema.safeParse(nextValues);

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
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={inputClass}
        />
        {fieldErrors.name ? (
          <p className="text-sm text-off-white/70">{fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="url" className={labelClass}>
            Listing URL
          </label>
          <input
            id="url"
            name="url"
            type="text"
            value={values.url}
            onChange={(event) => updateField("url", event.target.value)}
            className={inputClass}
          />
          {fieldErrors.url ? (
            <p className="text-sm text-off-white/70">{fieldErrors.url}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={values.location}
            onChange={(event) => updateField("location", event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="priceTotal" className={labelClass}>
            Total price ($)
          </label>
          <input
            id="priceTotal"
            name="priceTotal"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.priceTotal}
            onChange={(event) =>
              updateField("priceTotal", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.priceTotal ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.priceTotal}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="pricePerPerson" className={labelClass}>
            Per person ($)
          </label>
          <input
            id="pricePerPerson"
            name="pricePerPerson"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.pricePerPerson}
            onChange={(event) =>
              updateField("pricePerPerson", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.pricePerPerson ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.pricePerPerson}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="bedrooms" className={labelClass}>
            Bedrooms
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={values.bedrooms}
            onChange={(event) => updateField("bedrooms", event.target.value)}
            className={inputClass}
          />
          {fieldErrors.bedrooms ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.bedrooms}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="bathrooms" className={labelClass}>
            Bathrooms
          </label>
          <input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={values.bathrooms}
            onChange={(event) => updateField("bathrooms", event.target.value)}
            className={inputClass}
          />
          {fieldErrors.bathrooms ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.bathrooms}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="maxOccupancy" className={labelClass}>
            Sleeps
          </label>
          <input
            id="maxOccupancy"
            name="maxOccupancy"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={values.maxOccupancy}
            onChange={(event) =>
              updateField("maxOccupancy", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.maxOccupancy ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.maxOccupancy}
            </p>
          ) : null}
        </div>
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

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Propose cabin"}
      </button>
    </form>
  );
}
