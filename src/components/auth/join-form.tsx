"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { join, type JoinState } from "@/app/join/actions";
import { PasswordField } from "@/components/auth/password-field";
import { FormNotice } from "@/components/ui/form-notice";
import { joinSchema } from "@/lib/validations/join";

interface FormValues {
  firstName: string;
  lastInitial: string;
  email: string;
  phone: string;
  password: string;
  passcode: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: JoinState = {};
const initialValues: FormValues = {
  firstName: "",
  lastInitial: "",
  email: "",
  phone: "",
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

  if (state.success) {
    const deliveryBits = [
      state.emailSent ? "email" : null,
      state.smsSent ? "text" : null,
    ].filter(Boolean);

    return (
      <div className="flex flex-col gap-5">
        <FormNotice tone="success">
          You&apos;re in{state.displayName ? `, ${state.displayName}` : ""}.
        </FormNotice>
        <div className="flex flex-col gap-2 border border-warm-gray/20 p-4">
          <p className="text-sm font-normal text-off-white">
            Your sign-in is your email
            {state.email ? ` (${state.email})` : ""} + the password you chose.
          </p>
          {deliveryBits.length > 0 ? (
            <p className="text-sm font-normal text-off-white/70">
              We sent those details to your {deliveryBits.join(" and ")} so you
              don&apos;t have to remember them alone.
            </p>
          ) : (
            <p className="text-sm font-normal text-off-white/70">
              Screenshot or save your email + password now. Key can also reset
              it later if you get locked out. (Auto email/text turns on once
              Key finishes provider setup.)
            </p>
          )}
          {state.message ? (
            <p className="text-sm font-normal text-off-white/60">
              {state.message}
            </p>
          ) : null}
        </div>
        <Link
          href="/home"
          className="w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal"
        >
          Continue to home
        </Link>
      </div>
    );
  }

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
            This is your username for signing in. We&apos;ll email your login
            here.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="phone"
          className="text-sm font-normal text-off-white/80"
        >
          Mobile number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="(555) 123-4567"
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          className={inputClass}
        />
        {fieldErrors.phone ? (
          <p className="text-sm text-off-white/70">{fieldErrors.phone}</p>
        ) : (
          <p className="text-sm font-normal text-off-white/50">
            We&apos;ll text your login here too (once SMS is turned on), and Key
            can reach you for urgent trip updates.
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
        hint="Pick anything you'll remember — at least 6 characters. We'll send it to your email/phone so you don't lose it."
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
