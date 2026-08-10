"use client";

import { useActionState, useState } from "react";

import {
  createMemberAccount,
  type CreateMemberState,
} from "@/app/(app)/admin/members/actions";
import { PasswordField } from "@/components/auth/password-field";
import { FormNotice } from "@/components/ui/form-notice";
import { createMemberSchema } from "@/lib/validations/member";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialState: CreateMemberState = {};
const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

/**
 * Lets the trip admin create a real account for someone directly - no
 * signup page, no passcode, no email confirmation step. The admin sets the
 * password and hands it to them however they like (text, in person, etc.).
 */
export function CreateMemberForm() {
  const [state, formAction, isPending] = useActionState(
    createMemberAccount,
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
    const result = createMemberSchema.safeParse(nextValues);

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (
        key === "name" ||
        key === "email" ||
        key === "phone" ||
        key === "password"
      ) {
        errors[key] = issue.message;
      }
    }
    setFieldErrors(errors);
    return false;
  }

  function updateField<K extends keyof FormValues>(key: K, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (fieldErrors[key]) validate(next);
  }

  return (
    <div className="wr-panel flex flex-col gap-4 border-winter-green/50">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-winter-green text-sm font-semibold text-off-white"
        >
          +
        </span>
        <div className="flex flex-col">
          <span className="wr-section-label !text-winter-green">
            Add a member
          </span>
          <p className="text-sm font-normal text-off-white/70">
            Create their account and set a password directly - they can sign
            in right away, no invite email needed.
          </p>
        </div>
      </div>

      <form
        action={formAction}
        onSubmit={(event) => {
          if (!validate(values)) {
            event.preventDefault();
          }
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="new-member-name" className="wr-label">
            Name
          </label>
          <input
            id="new-member-name"
            name="name"
            type="text"
            placeholder="Keyshawn J."
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="wr-input"
          />
          {fieldErrors.name ? (
            <p className="text-sm text-off-white/70">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-member-email" className="wr-label">
            Email (their login)
          </label>
          <input
            id="new-member-email"
            name="email"
            type="email"
            autoComplete="off"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="wr-input"
          />
          {fieldErrors.email ? (
            <p className="text-sm text-off-white/70">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-member-phone" className="wr-label">
            Phone (optional)
          </label>
          <input
            id="new-member-phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="wr-input"
          />
          {fieldErrors.phone ? (
            <p className="text-sm text-off-white/70">{fieldErrors.phone}</p>
          ) : null}
        </div>

        <PasswordField
          id="new-member-password"
          name="password"
          label="Set their password"
          autoComplete="new-password"
          value={values.password}
          onChange={(value) => updateField("password", value)}
          hint="At least 6 characters. They can change it later if they want."
          error={fieldErrors.password}
        />

        {state.error ? (
          <FormNotice tone="error">{state.error}</FormNotice>
        ) : null}
        {state.success ? (
          <FormNotice tone="success">
            Account created. They can sign in at /login with that email and
            password right away.
          </FormNotice>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-winter-green bg-winter-green px-5 py-2.5 text-sm font-semibold text-off-white shadow-[0_4px_20px_color-mix(in_oklab,var(--color-winter-green)_35%,transparent)] transition-[filter,transform,opacity] duration-150 hover:brightness-110 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
