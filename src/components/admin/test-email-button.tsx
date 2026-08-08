"use client";

import { useActionState } from "react";

import {
  sendTestLoginEmail,
  type TestEmailState,
} from "@/app/(app)/admin/actions";
import { FormNotice } from "@/components/ui/form-notice";

const initialState: TestEmailState = {};

export function TestEmailButton() {
  const [state, formAction, isPending] = useActionState(
    sendTestLoginEmail,
    initialState
  );

  return (
    <div className="flex flex-col gap-3 border border-warm-gray/20 p-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          Email setup
        </span>
        <p className="text-sm font-normal text-off-white/70">
          Send yourself a sample login email to confirm Resend works before
          inviting people.
        </p>
      </div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white transition-colors hover:border-off-white disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Send test login email to me"}
        </button>
      </form>
      {state.error ? <FormNotice tone="error">{state.error}</FormNotice> : null}
      {state.success && state.detail ? (
        <FormNotice tone="success">{state.detail}</FormNotice>
      ) : null}
    </div>
  );
}
