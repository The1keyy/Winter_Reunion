"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

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
type Step = 1 | 2 | 3;

const initialState: JoinState = {};
const initialValues: FormValues = {
  firstName: "",
  lastInitial: "",
  email: "",
  phone: "",
  password: "",
  passcode: "",
};

const stepMeta: Record<Step, { title: string; hint: string }> = {
  1: {
    title: "Who are you?",
    hint: "First name + last initial. That's how you show up to the crew.",
  },
  2: {
    title: "How do you sign in?",
    hint: "Email is your username. Pick a password you'll screenshot next.",
  },
  3: {
    title: "Unlock the trip",
    hint: "Enter Key's passcode. Then you're in.",
  },
};

export function JoinForm() {
  const [state, formAction, isPending] = useActionState(join, initialState);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState<Step>(1);

  function validate(next: FormValues, keys?: (keyof FormValues)[]) {
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

    if (keys) {
      const scoped: FieldErrors = {};
      let ok = true;
      for (const key of keys) {
        if (errors[key]) {
          scoped[key] = errors[key];
          ok = false;
        }
      }
      setFieldErrors(scoped);
      return ok;
    }

    setFieldErrors(errors);
    return false;
  }

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (fieldErrors[key]) validate(next, [key]);
  }

  const previewName = useMemo(() => {
    if (!values.firstName.trim() || !values.lastInitial.trim()) return null;
    return `${values.firstName.trim()} ${values.lastInitial.trim().toUpperCase()}.`;
  }, [values.firstName, values.lastInitial]);

  function goNext() {
    if (step === 1) {
      if (!validate(values, ["firstName", "lastInitial"])) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!validate(values, ["email", "phone", "password"])) return;
      setStep(3);
    }
  }

  if (state.success) {
    const name = state.displayName ?? previewName ?? "Member";
    const email = state.email ?? values.email;
    const password = state.password ?? values.password;
    const phone = state.phone ?? values.phone;
    const loginUrl = state.loginUrl ?? "https://winter-reunion.vercel.app/login";
    const continueHref = state.needsEmailConfirm ? "/login" : "/home";

    return (
      <div className="wr-fade-up flex flex-col gap-5">
        <FormNotice tone="success">
          You&apos;re in, {name}. Screenshot this card before you leave.
        </FormNotice>

        <div className="wr-panel border-ember/40">
          <p className="wr-section-label mb-3">Your login — screenshot this</p>
          <dl className="flex flex-col gap-2.5 text-sm">
            <div>
              <dt className="text-warm-gray">Name</dt>
              <dd className="font-medium text-off-white">{name}</dd>
            </div>
            <div>
              <dt className="text-warm-gray">Email (username)</dt>
              <dd className="font-medium text-off-white">{email}</dd>
            </div>
            <div>
              <dt className="text-warm-gray">Password</dt>
              <dd className="font-medium text-ember">{password}</dd>
            </div>
            <div>
              <dt className="text-warm-gray">Phone</dt>
              <dd className="font-medium text-off-white">{phone}</dd>
            </div>
            <div>
              <dt className="text-warm-gray">Sign-in page</dt>
              <dd className="break-all font-medium text-off-white">{loginUrl}</dd>
            </div>
          </dl>
        </div>

        <p className="wr-hint">
          Use that email + password every time. If a Confirm email shows up, tap
          it — it should open this site.
        </p>

        {state.emailSent || state.smsSent ? (
          <p className="wr-hint">
            We also tried to send these details to your{" "}
            {[state.emailSent ? "email" : null, state.smsSent ? "text" : null]
              .filter(Boolean)
              .join(" and ")}
            .
          </p>
        ) : null}

        {state.message ? <p className="wr-hint">{state.message}</p> : null}

        <Link href={continueHref} className="wr-btn-primary w-full sm:w-fit">
          {state.needsEmailConfirm ? "Go to sign in" : "Continue to home"}
        </Link>
      </div>
    );
  }

  const meta = stepMeta[step];

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (step !== 3) {
          event.preventDefault();
          goNext();
          return;
        }
        if (!validate(values)) event.preventDefault();
      }}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="wr-section-label">Step {step} of 3</span>
          <span className="text-xs font-semibold text-ember tabular-nums">
            {Math.round((step / 3) * 100)}%
          </span>
        </div>
        <div className="wr-progress" aria-hidden>
          <span style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        <div className="mt-1 flex gap-1.5" aria-hidden>
          {([1, 2, 3] as const).map((n) => (
            <span
              key={n}
              className={
                "h-1 flex-1 transition-colors " +
                (n <= step ? "bg-ember" : "bg-surface-raised")
              }
            />
          ))}
        </div>
        <h2 className="font-heading mt-2 text-xl font-semibold text-off-white">
          {meta.title}
        </h2>
        <p className="wr-hint">{meta.hint}</p>
      </div>

      {step === 1 ? (
        <div className="wr-fade-up flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_4.5rem] gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="wr-label">
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
                className="wr-input"
              />
              {fieldErrors.firstName ? (
                <p className="text-sm text-off-white/70">{fieldErrors.firstName}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="lastInitial" className="wr-label">
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
                className="wr-input text-center uppercase"
              />
              {fieldErrors.lastInitial ? (
                <p className="text-sm text-off-white/70">
                  {fieldErrors.lastInitial}
                </p>
              ) : null}
            </div>
          </div>
          <p className="wr-hint">
            {previewName
              ? `You'll show up as ${previewName}`
              : "Keeps it light and private."}
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="wr-fade-up flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="wr-label">
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
              className="wr-input"
            />
            {fieldErrors.email ? (
              <p className="text-sm text-off-white/70">{fieldErrors.email}</p>
            ) : (
              <p className="wr-hint">This is your username for signing in.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="wr-label">
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
              className="wr-input"
            />
            {fieldErrors.phone ? (
              <p className="text-sm text-off-white/70">{fieldErrors.phone}</p>
            ) : (
              <p className="wr-hint">So Key can reach you about the trip.</p>
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
        </div>
      ) : null}

      {step === 3 ? (
        <div className="wr-fade-up flex flex-col gap-4">
          {/* Keep earlier fields in the DOM so FormData still posts them */}
          <input type="hidden" name="firstName" value={values.firstName} />
          <input type="hidden" name="lastInitial" value={values.lastInitial} />
          <input type="hidden" name="email" value={values.email} />
          <input type="hidden" name="phone" value={values.phone} />
          <input type="hidden" name="password" value={values.password} />

          <div className="wr-panel text-sm text-off-white/80">
            <p>
              <span className="text-warm-gray">Name: </span>
              {previewName}
            </p>
            <p>
              <span className="text-warm-gray">Email: </span>
              {values.email}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="passcode" className="wr-label">
              Trip passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="text"
              autoComplete="off"
              value={values.passcode}
              onChange={(event) => updateField("passcode", event.target.value)}
              className="wr-input"
            />
            {fieldErrors.passcode ? (
              <p className="text-sm text-off-white/70">{fieldErrors.passcode}</p>
            ) : (
              <p className="wr-hint">Ask Key if you don&apos;t have this yet.</p>
            )}
          </div>
        </div>
      ) : null}

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => (current === 3 ? 2 : 1))}
            className="wr-btn"
          >
            Back
          </button>
        ) : null}
        {step < 3 ? (
          <button type="button" onClick={goNext} className="wr-btn-primary flex-1">
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="wr-btn-primary flex-1"
          >
            {isPending ? "Joining..." : "Join the trip"}
          </button>
        )}
      </div>
    </form>
  );
}
