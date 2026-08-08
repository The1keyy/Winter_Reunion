"use client";

import { useActionState, useState } from "react";

import {
  resetMemberPassword,
  type ResetPasswordState,
} from "@/app/(app)/admin/members/actions";
import { PasswordField } from "@/components/auth/password-field";
import { FormNotice } from "@/components/ui/form-notice";
import { resetPasswordSchema } from "@/lib/validations/member";

interface ResetPasswordFormProps {
  profileId: string;
  memberName: string;
}

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({
  profileId,
  memberName,
}: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    resetMemberPassword.bind(null, profileId),
    initialState
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [lastPostedAt, setLastPostedAt] = useState<number | undefined>();

  if (state.postedAt && state.postedAt !== lastPostedAt) {
    setLastPostedAt(state.postedAt);
    setPassword("");
    setError(undefined);
  }

  function validate(value: string) {
    const result = resetPasswordSchema.safeParse({ password: value });
    if (result.success) {
      setError(undefined);
      return true;
    }
    setError(result.error.issues[0]?.message);
    return false;
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!validate(password)) {
          event.preventDefault();
        }
      }}
      noValidate
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <PasswordField
            id={`password-${profileId}`}
            name="password"
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (error) validate(value);
            }}
            hint="At least 6 characters. Send it to them directly after."
            error={error}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal transition-opacity disabled:opacity-50"
        >
          {isPending ? "Setting..." : "Set password"}
        </button>
      </div>

      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}
      {state.success ? (
        <FormNotice tone="success">
          Password updated for {memberName}. Send it to them directly - they
          can sign in with it right away.
        </FormNotice>
      ) : null}
    </form>
  );
}
