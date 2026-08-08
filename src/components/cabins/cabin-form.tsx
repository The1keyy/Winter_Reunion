"use client";

import { useActionState, useState } from "react";

import {
  proposeCabin,
  type CabinFormState,
} from "@/app/(app)/cabins/actions";
import { AddOptionBox } from "@/components/guidance/add-option-box";
import { FormNotice } from "@/components/ui/form-notice";
import { cabinCardSchema } from "@/lib/validations/cabin";

type PriceKind = "night" | "total";

interface FormValues {
  name: string;
  price: string;
  url: string;
}

type FieldErrors = Partial<Record<"name" | "price" | "url", string>>;

const initialState: CabinFormState = {};
const initialValues: FormValues = {
  name: "",
  price: "",
  url: "",
};

export function CabinForm() {
  const [state, formAction, isPending] = useActionState(
    proposeCabin,
    initialState
  );
  const [values, setValues] = useState<FormValues>(initialValues);
  const [priceKind, setPriceKind] = useState<PriceKind>("night");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [lastPostedAt, setLastPostedAt] = useState<number | undefined>();

  if (state.postedAt && state.postedAt !== lastPostedAt) {
    setLastPostedAt(state.postedAt);
    setValues(initialValues);
    setFieldErrors({});
    setPriceKind("night");
  }

  function validate(nextValues: FormValues) {
    const result = cabinCardSchema.safeParse({
      name: nextValues.name,
      url: nextValues.url,
      pricePerPerson: priceKind === "night" ? nextValues.price : "",
      priceTotal: priceKind === "total" ? nextValues.price : "",
      notes: "",
      location: "",
      bedrooms: "",
      bathrooms: "",
      maxOccupancy: "",
    });

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "url") {
        errors[key] = issue.message;
      }
      if (key === "pricePerPerson" || key === "priceTotal") {
        errors.price = issue.message;
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
    <AddOptionBox label="Got a stay to add?" doneAt={state.postedAt}>
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
            Fill in whatever you have. Name or Airbnb link is enough — price is
            a bonus.
          </p>

          <input type="hidden" name="notes" value="" />
          <input type="hidden" name="location" value="" />
          <input type="hidden" name="bedrooms" value="" />
          <input type="hidden" name="bathrooms" value="" />
          <input type="hidden" name="maxOccupancy" value="" />
          <input
            type="hidden"
            name="pricePerPerson"
            value={priceKind === "night" ? values.price : ""}
          />
          <input
            type="hidden"
            name="priceTotal"
            value={priceKind === "total" ? values.price : ""}
          />

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
              placeholder="Lakeside lodge..."
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="wr-input"
            />
            {fieldErrors.name ? (
              <p className="text-sm text-off-white/70">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="wr-label">
              Price{" "}
              <span className="font-normal text-warm-gray">optional</span>
            </span>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-warm-gray">
                  $
                </span>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="—"
                  value={values.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  className="wr-input pl-7"
                />
              </div>
              <div className="flex overflow-hidden border border-warm-gray/40">
                {(
                  [
                    { id: "night", label: "/ night" },
                    { id: "total", label: "total" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPriceKind(option.id)}
                    className={
                      "min-h-11 px-3 text-xs font-semibold tracking-wide uppercase transition-colors " +
                      (priceKind === option.id
                        ? "bg-ember text-ember-ink"
                        : "text-warm-gray hover:text-off-white")
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {fieldErrors.price ? (
              <p className="text-sm text-off-white/70">{fieldErrors.price}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="url" className="wr-label">
              Link{" "}
              <span className="font-normal text-warm-gray">optional</span>
            </label>
            <input
              id="url"
              name="url"
              type="url"
              inputMode="url"
              placeholder="https://www.airbnb.com/..."
              value={values.url}
              onChange={(event) => updateField("url", event.target.value)}
              className="wr-input"
            />
            {fieldErrors.url ? (
              <p className="text-sm text-off-white/70">{fieldErrors.url}</p>
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
