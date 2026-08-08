"use client";

import { useActionState, useState } from "react";

import {
  proposeActivity,
  type ActivityFormState,
} from "@/app/(app)/activities/actions";
import { activitySchema } from "@/lib/validations/activity";

interface FormValues {
  name: string;
  description: string;
  category: string;
  activityDate: string;
  startTime: string;
  endTime: string;
  location: string;
  costPerPerson: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: ActivityFormState = {};
const initialValues: FormValues = {
  name: "",
  description: "",
  category: "",
  activityDate: "",
  startTime: "",
  endTime: "",
  location: "",
  costPerPerson: "",
};

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";
const labelClass = "text-sm font-normal text-off-white/80";

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
    const result = activitySchema.safeParse(nextValues);

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

        <div className="flex flex-col gap-2">
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <input
            id="category"
            name="category"
            type="text"
            placeholder="Skiing, dining, nightlife..."
            value={values.category}
            onChange={(event) => updateField("category", event.target.value)}
            className={inputClass}
          />
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="activityDate" className={labelClass}>
            Date
          </label>
          <input
            id="activityDate"
            name="activityDate"
            type="date"
            value={values.activityDate}
            onChange={(event) =>
              updateField("activityDate", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.activityDate ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.activityDate}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="startTime" className={labelClass}>
            Start time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            value={values.startTime}
            onChange={(event) =>
              updateField("startTime", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.startTime ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.startTime}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="endTime" className={labelClass}>
            End time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            value={values.endTime}
            onChange={(event) => updateField("endTime", event.target.value)}
            className={inputClass}
          />
          {fieldErrors.endTime ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.endTime}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

        <div className="flex flex-col gap-2">
          <label htmlFor="costPerPerson" className={labelClass}>
            Cost per person ($)
          </label>
          <input
            id="costPerPerson"
            name="costPerPerson"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.costPerPerson}
            onChange={(event) =>
              updateField("costPerPerson", event.target.value)
            }
            className={inputClass}
          />
          {fieldErrors.costPerPerson ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.costPerPerson}
            </p>
          ) : null}
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
        {isPending ? "Adding..." : "Propose activity"}
      </button>
    </form>
  );
}
