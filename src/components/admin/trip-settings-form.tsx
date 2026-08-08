"use client";

import { useActionState, useState } from "react";

import {
  updateTripSettings,
  type TripSettingsState,
} from "@/app/(app)/admin/trip-settings/actions";
import {
  TRIP_STAGE_STATUSES,
  tripSettingsSchema,
} from "@/lib/validations/trip-settings";
import type { TripSettings } from "@/types/database";

interface TripSettingsFormProps {
  trip: TripSettings | null;
}

interface FormValues {
  tripName: string;
  startDate: string;
  endDate: string;
  state: string;
  cityOrArea: string;
  guestLimit: string;
  estimatedBudgetLow: string;
  estimatedBudgetHigh: string;
  skiingStatus: string;
  cabinSearchStatus: string;
  transportationStatus: string;
  paymentStatus: string;
  registrationStatus: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: TripSettingsState = {};

function toFormValues(trip: TripSettings | null): FormValues {
  return {
    tripName: trip?.trip_name ?? "",
    startDate: trip?.start_date ?? "",
    endDate: trip?.end_date ?? "",
    state: trip?.state ?? "",
    cityOrArea: trip?.city_or_area ?? "",
    guestLimit: trip?.guest_limit != null ? String(trip.guest_limit) : "",
    estimatedBudgetLow:
      trip?.estimated_budget_low != null
        ? String(trip.estimated_budget_low)
        : "",
    estimatedBudgetHigh:
      trip?.estimated_budget_high != null
        ? String(trip.estimated_budget_high)
        : "",
    skiingStatus: trip?.skiing_status ?? "Not Started",
    cabinSearchStatus: trip?.cabin_search_status ?? "Not Started",
    transportationStatus: trip?.transportation_status ?? "Not Started",
    paymentStatus: trip?.payment_status ?? "Not Started",
    registrationStatus: trip?.registration_status ?? "Not Started",
  };
}

const STATUS_FIELDS: { key: keyof FormValues; label: string }[] = [
  { key: "skiingStatus", label: "Skiing" },
  { key: "cabinSearchStatus", label: "Cabin search" },
  { key: "transportationStatus", label: "Transportation" },
  { key: "paymentStatus", label: "Payment" },
  { key: "registrationStatus", label: "Registration" },
];

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";
const labelClass = "text-sm font-normal text-off-white/80";

export function TripSettingsForm({ trip }: TripSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateTripSettings,
    initialState
  );
  const [values, setValues] = useState<FormValues>(() => toFormValues(trip));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(nextValues: FormValues) {
    const result = tripSettingsSchema.safeParse(nextValues);

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
        <label htmlFor="tripName" className={labelClass}>
          Trip name
        </label>
        <input
          id="tripName"
          name="tripName"
          type="text"
          value={values.tripName}
          onChange={(event) => updateField("tripName", event.target.value)}
          className={inputClass}
        />
        {fieldErrors.tripName ? (
          <p className="text-sm text-off-white/70">{fieldErrors.tripName}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="startDate" className={labelClass}>
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={values.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
            className={inputClass}
          />
          {fieldErrors.startDate ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.startDate}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="endDate" className={labelClass}>
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={values.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
            className={inputClass}
          />
          {fieldErrors.endDate ? (
            <p className="text-sm text-off-white/70">{fieldErrors.endDate}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="cityOrArea" className={labelClass}>
            City or area
          </label>
          <input
            id="cityOrArea"
            name="cityOrArea"
            type="text"
            value={values.cityOrArea}
            onChange={(event) =>
              updateField("cityOrArea", event.target.value)
            }
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="state" className={labelClass}>
            State
          </label>
          <input
            id="state"
            name="state"
            type="text"
            value={values.state}
            onChange={(event) => updateField("state", event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="guestLimit" className={labelClass}>
            Guest limit
          </label>
          <input
            id="guestLimit"
            name="guestLimit"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={values.guestLimit}
            onChange={(event) =>
              updateField("guestLimit", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.guestLimit ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.guestLimit}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="estimatedBudgetLow" className={labelClass}>
            Budget low ($)
          </label>
          <input
            id="estimatedBudgetLow"
            name="estimatedBudgetLow"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.estimatedBudgetLow}
            onChange={(event) =>
              updateField("estimatedBudgetLow", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.estimatedBudgetLow ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.estimatedBudgetLow}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="estimatedBudgetHigh" className={labelClass}>
            Budget high ($)
          </label>
          <input
            id="estimatedBudgetHigh"
            name="estimatedBudgetHigh"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.estimatedBudgetHigh}
            onChange={(event) =>
              updateField("estimatedBudgetHigh", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.estimatedBudgetHigh ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.estimatedBudgetHigh}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-warm-gray/20 pt-5">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          Stage statuses
        </span>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {STATUS_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-2">
              <label htmlFor={key} className={labelClass}>
                {label}
              </label>
              <select
                id={key}
                name={key}
                value={values[key]}
                onChange={(event) => updateField(key, event.target.value)}
                className={`${inputClass} bg-charcoal`}
              >
                {TRIP_STAGE_STATUSES.map((status) => (
                  <option key={status} value={status} className="bg-charcoal">
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-off-white/90">{state.error}</p>
      ) : null}

      {state.success ? (
        <p className="text-sm text-off-white/90">Trip details saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save trip details"}
      </button>
    </form>
  );
}
