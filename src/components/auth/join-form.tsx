"use client";

import { useActionState, useState } from "react";

import { join, type JoinState } from "@/app/join/actions";
import { joinSchema } from "@/lib/validations/join";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  passcode?: string;
}

const initialState: JoinState = {};

export function JoinForm() {
  const [state, formAction, isPending] = useActionState(join, initialState);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(
    nextName: string,
    nextEmail: string,
    nextPassword: string,
    nextPasscode: string
  ) {
    const result = joinSchema.safeParse({
      name: nextName,
      email: nextEmail,
      password: nextPassword,
      passcode: nextPasscode,
    });

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
        key === "password" ||
        key === "passcode"
      ) {
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
        if (!validate(name, email, password, passcode)) {
          event.preventDefault();
        }
      }}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-normal text-off-white/80">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (fieldErrors.name)
              validate(event.target.value, email, password, passcode);
          }}
          className="border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white"
        />
        {fieldErrors.name ? (
          <p className="text-sm text-off-white/70">{fieldErrors.name}</p>
        ) : null}
      </div>

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
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldErrors.email)
              validate(name, event.target.value, password, passcode);
          }}
          className="border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white"
        />
        {fieldErrors.email ? (
          <p className="text-sm text-off-white/70">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-normal text-off-white/80"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (fieldErrors.password)
              validate(name, email, event.target.value, passcode);
          }}
          className="border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white"
        />
        {fieldErrors.password ? (
          <p className="text-sm text-off-white/70">{fieldErrors.password}</p>
        ) : null}
      </div>

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
          value={passcode}
          onChange={(event) => {
            setPasscode(event.target.value);
            if (fieldErrors.passcode)
              validate(name, email, password, event.target.value);
          }}
          className="border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white"
        />
        {fieldErrors.passcode ? (
          <p className="text-sm text-off-white/70">{fieldErrors.passcode}</p>
        ) : null}
      </div>

      {state.error ? (
        <p className="text-sm text-off-white/90">{state.error}</p>
      ) : null}

      {state.message ? (
        <p className="text-sm text-off-white/90">{state.message}</p>
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
