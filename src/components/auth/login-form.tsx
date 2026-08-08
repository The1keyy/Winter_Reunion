"use client";

import { useActionState, useState } from "react";

import { signIn, type SignInState } from "@/app/login/actions";
import { PasswordField } from "@/components/auth/password-field";
import { FormNotice } from "@/components/ui/form-notice";
import { signInSchema } from "@/lib/validations/auth";

interface FieldErrors {
  email?: string;
  password?: string;
}

const initialState: SignInState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signIn,
    initialState
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(nextEmail: string, nextPassword: string) {
    const result = signInSchema.safeParse({
      email: nextEmail,
      password: nextPassword,
    });

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (key === "email" || key === "password") {
        errors[key] = issue.message;
      }
    }
    setFieldErrors(errors);
    return false;
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!validate(email, password)) {
          event.preventDefault();
        }
      }}
      noValidate
      className="flex w-full flex-col gap-5"
    >
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
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldErrors.email) validate(event.target.value, password);
          }}
          className="border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white"
        />
        {fieldErrors.email ? (
          <p className="text-sm text-off-white/70">{fieldErrors.email}</p>
        ) : null}
      </div>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={(value) => {
          setPassword(value);
          if (fieldErrors.password) validate(email, value);
        }}
        error={fieldErrors.password}
      />

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm font-normal text-off-white/50">
        Forgot your password? Ask your trip organizer to help you get back
        in.
      </p>
    </form>
  );
}
