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
    const name = state.displayName ?? previewName ?? "Member";
    const email = state.email ?? values.email;
    const password = state.password ?? values.password;
    const phone = state.phone ?? values.phone;
    const loginUrl = state.loginUrl ?? "https://winter-reunion.vercel.app/login";
    const continueHref = state.needsEmailConfirm ? "/login" : "/home";

    return (
      <div className="flex flex-col gap-5">
        <FormNotice tone="success">
          You&apos;re in, {name}. Screenshot this card before you leave.
        </FormNotice>

        <div className="flex flex-col gap-3 border border-off-white/40 p-4">
          <p className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
            Your login — screenshot this
          </p>
          <p className="text-sm font-normal text-off-white">
            <span className="text-off-white/50">Name: </span>
            {name}
          </p>
          <p className="text-sm font-normal text-off-white">
            <span className="text-off-white/50">Email (username): </span>
            {email}
          </p>
          <p className="text-sm font-normal text-off-white">
            <span className="text-off-white/50">Password: </span>
            {password}
          </p>
          <p className="text-sm font-normal text-off-white">
            <span className="text-off-white/50">Phone: </span>
            {phone}
          </p>
          <p className="text-sm font-normal text-off-white">
            <span className="text-off-white/50">Sign-in page: </span>
            {loginUrl}
          </p>
        </div>

        <p className="text-sm font-normal text-off-white/70">
          Use that email + password every time. If a Confirm email shows up,
          tap it — it should open this site. Never mind if it looks weird; your
          real login is the screenshot above.
        </p>

        {state.emailSent || state.smsSent ? (
          <p className="text-sm font-normal text-off-white/50">
            We also tried to send these details to your{" "}
            {[state.emailSent ? "email" : null, state.smsSent ? "text" : null]
              .filter(Boolean)
              .join(" and ")}
            .
          </p>
        ) : null}

        {state.message ? (
          <p className="text-sm font-normal text-off-white/60">{state.message}</p>
        ) : null}

        <Link
          href={continueHref}
          className="w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal"
        >
          {state.needsEmailConfirm ? "Go to sign in" : "Continue to home"}
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
            This is your username for signing in.
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
            So Key can reach you. Screenshot your password on the next screen.
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
        hint="At least 6 characters. Next screen shows it so you can screenshot it."
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
