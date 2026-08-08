"use client";

import { useActionState, useState } from "react";

import { join, type JoinState } from "@/app/join/actions";
import { PasswordField } from "@/components/auth/password-field";
import { FormNotice } from "@/components/ui/form-notice";
import { joinSchema } from "@/lib/validations/join";

interface FormValues {
  firstName: string;
  lastInitial: string;
  email: string;
  password: string;
  passcode: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: JoinState = {};
const initialValues: FormValues = {
  firstName: "",
  lastInitial: "",
  email: "",
  password: "",
  passcode: "",
};

const inputClass =
  "border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white";

export function JoinForm() {
  const [state, formAction, isPending] = useActionState(join, initialState);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(next: FormValues) {
    const result = joinSchema.safeParse(next);

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

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (fieldErrors[key]) validate(next);
  }

  const previewName =
    values.firstName.trim() && values.lastInitial.trim()
      ? `${values.firstName.trim()} ${values.lastInitial.trim().toUpperCase()}.`
      : null;

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!validate(values)) event.preventDefault();
      }}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="grid grid-cols-[1fr_4.5rem] gap-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="firstName"
            className="text-sm font-normal text-off-white/80"
          >
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Keyshawn"
            value={values.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            className={inputClass}
          />
          {fieldErrors.firstName ? (
            <p className="text-sm text-off-white/70">{fieldErrors.firstName}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="lastInitial"
            className="text-sm font-normal text-off-white/80"
          >
            Last initial
          </label>
          <input
            id="lastInitial"
            name="lastInitial"
            type="text"
            maxLength={1}
            autoComplete="family-name"
            placeholder="J"
            value={values.lastInitial}
            onChange={(event) =>
              updateField("lastInitial", event.target.value.slice(0, 1))
            }
            className={`${inputClass} text-center uppercase`}
          />
          {fieldErrors.lastInitial ? (
            <p className="text-sm text-off-white/70">
              {fieldErrors.lastInitial}
            </p>
          ) : null}
        </div>
      </div>
      <p className="text-sm font-normal text-off-white/50">
        {previewName
          ? `You'll show up as ${previewName}`
          : "First name + last initial only — keeps it light and private."}
      </p>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-sm font-normal text-off-white/80"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          className={inputClass}
        />
        {fieldErrors.email ? (
          <p className="text-sm text-off-white/70">{fieldErrors.email}</p>
        ) : (
          <p className="text-sm font-normal text-off-white/50">
            This is how you sign back in later.
          </p>
        )}
      </div>

      <PasswordField
        id="password"
        name="password"
        label="Choose a password"
        autoComplete="new-password"
        value={values.password}
        onChange={(value) => updateField("password", value)}
        hint="Pick anything you'll remember — at least 6 characters. Show it once to double-check."
        error={fieldErrors.password}
      />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="passcode"
          className="text-sm font-normal text-off-white/80"
        >
          Trip passcode
        </label>
        <input
          id="passcode"
          name="passcode"
          type="text"
          autoComplete="off"
          value={values.passcode}
          onChange={(event) => updateField("passcode", event.target.value)}
          className={inputClass}
        />
        {fieldErrors.passcode ? (
          <p className="text-sm text-off-white/70">{fieldErrors.passcode}</p>
        ) : (
          <p className="text-sm font-normal text-off-white/50">
            Ask Key if you don&apos;t have this yet.
          </p>
        )}
      </div>

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}
      {state.message ? (
        <FormNotice tone="success">{state.message}</FormNotice>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Joining..." : "Join the trip"}
      </button>
    </form>
  );
}
