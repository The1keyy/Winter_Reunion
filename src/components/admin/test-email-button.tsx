"use client";

import { useActionState } from "react";

import {
  sendTestLoginEmail,
  sendTestLoginSms,
  type TestDeliveryState,
} from "@/app/(app)/admin/actions";
import { FormNotice } from "@/components/ui/form-notice";

const emailInitial: TestDeliveryState = {};
const smsInitial: TestDeliveryState = {};

export function TestEmailButton() {
  const [emailState, emailAction, emailPending] = useActionState(
    sendTestLoginEmail,
    emailInitial
  );
  const [smsState, smsAction, smsPending] = useActionState(
    sendTestLoginSms,
    smsInitial
  );

  return (
    <div className="flex flex-col gap-4 border border-warm-gray/20 p-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          Delivery setup
        </span>
        <p className="text-sm font-normal text-off-white/70">
          Test email (Resend) and text (Twilio) before inviting people. Texts go
          to the phone on your profile.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form action={emailAction}>
          <button
            type="submit"
            disabled={emailPending}
            className="border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white transition-colors hover:border-off-white disabled:opacity-50"
          >
            {emailPending ? "Sending..." : "Send test email to me"}
          </button>
        </form>
        <form action={smsAction}>
          <button
            type="submit"
            disabled={smsPending}
            className="border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white transition-colors hover:border-off-white disabled:opacity-50"
          >
            {smsPending ? "Sending..." : "Send test text to me"}
          </button>
        </form>
      </div>

      {emailState.error ? (
        <FormNotice tone="error">{emailState.error}</FormNotice>
      ) : null}
      {emailState.success && emailState.detail ? (
        <FormNotice tone="success">{emailState.detail}</FormNotice>
      ) : null}
      {smsState.error ? (
        <FormNotice tone="error">{smsState.error}</FormNotice>
      ) : null}
      {smsState.success && smsState.detail ? (
        <FormNotice tone="success">{smsState.detail}</FormNotice>
      ) : null}
    </div>
  );
}
