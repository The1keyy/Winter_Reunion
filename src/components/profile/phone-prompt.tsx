"use client";

import { useActionState, useState } from "react";

import { savePhone, type PhoneState } from "@/app/(app)/profile/actions";
import { FormNotice } from "@/components/ui/form-notice";
import { phoneSchema } from "@/lib/validations/profile";

const initialState: PhoneState = {};

/**
 * Soft prompt after sign-in: collect a mobile number. "Not now" hides it for
 * this visit only; it returns next time until they save a number (gentle
 * persistence without blocking the rest of Home).
 */
export function PhonePrompt() {
  const [state, formAction, isPending] = useActionState(savePhone, initialState);
  const [phone, setPhone] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (state.success) {
    return (
      <FormNotice tone="success">
        Number saved. You&apos;ll see personal updates here; Key can also reach
        you when something urgent lands.
      </FormNotice>
    );
  }

  function validate(value: string) {
    const result = phoneSchema.safeParse({ phone: value });
    if (result.success) {
      setFieldError(undefined);
      return true;
    }
    setFieldError(result.error.issues[0]?.message);
    return false;
  }

  return (
    <div className="flex flex-col gap-3 border border-warm-gray/30 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-normal text-off-white">
          Add your number (30 seconds)
        </h2>
        <p className="text-sm font-normal text-off-white/70">
          So Key can text you when something important drops — a cabin pick, a
          payment due, or a last-minute change. Your number stays private to
          trip admins.
        </p>
      </div>

      <form
        action={formAction}
        onSubmit={(event) => {
          if (!validate(phone)) event.preventDefault();
        }}
        noValidate
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-2">
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
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              if (fieldError) validate(event.target.value);
            }}
            className="border border-warm-gray/40 bg-transparent px-3 py-2.5 text-off-white outline-none focus:border-off-white"
          />
          {fieldError ? (
            <p className="text-sm text-off-white/70">{fieldError}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save number"}
        </button>
      </form>

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="w-fit text-sm font-normal text-off-white/50 underline underline-offset-4 hover:text-off-white"
      >
        Not now
      </button>
    </div>
  );
}
