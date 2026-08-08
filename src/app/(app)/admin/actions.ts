"use server";

import {
  sendLoginDetails,
  sendLoginSmsOnly,
} from "@/lib/notifications/send-login-details";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export interface TestDeliveryState {
  error?: string;
  success?: boolean;
  detail?: string;
}

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, ok: false as const };
  }

  const profile = await getProfile(supabase, user.id);
  const ok =
    profile?.role === "admin" || profile?.role === "co-admin";

  return { user, profile, ok };
}

/**
 * Sends a sample login-details email to the signed-in admin so they can
 * confirm Resend is wired before inviting the group.
 */
export async function sendTestLoginEmail(
  _prevState: TestDeliveryState,
  _formData: FormData
): Promise<TestDeliveryState> {
  void _formData;

  const { user, profile, ok } = await requireStaff();
  if (!user?.email || !profile || !ok) {
    return { error: "Only admins can send a test email." };
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    return {
      error:
        "RESEND_API_KEY is missing. Add it in .env.local and in Vercel env vars, then redeploy.",
    };
  }

  const delivery = await sendLoginDetails({
    displayName: profile.name || "Key",
    email: user.email,
    password: "(test-password-not-real)",
    phone: profile.phone || "5555555555",
  });

  if (!delivery.emailSent) {
    return {
      error:
        delivery.emailSkippedReason ||
        "Email did not send. With onboarding@resend.dev you can only email the address on your Resend account.",
    };
  }

  return {
    success: true,
    detail: `Test login email sent to ${user.email}. Check inbox (and spam).`,
  };
}

/**
 * Sends a sample login SMS to the admin's profile phone so they can confirm
 * Twilio before inviting the group.
 */
export async function sendTestLoginSms(
  _prevState: TestDeliveryState,
  _formData: FormData
): Promise<TestDeliveryState> {
  void _formData;

  const { user, profile, ok } = await requireStaff();
  if (!user?.email || !profile || !ok) {
    return { error: "Only admins can send a test text." };
  }

  if (
    !process.env.TWILIO_ACCOUNT_SID?.trim() ||
    !process.env.TWILIO_AUTH_TOKEN?.trim() ||
    !process.env.TWILIO_FROM_NUMBER?.trim()
  ) {
    return {
      error:
        "Twilio env vars missing. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER (E.164 like +15551234567) to .env.local and Vercel, then redeploy.",
    };
  }

  if (!profile.phone) {
    return {
      error:
        "Add your mobile number on Home first (phone prompt), then try again.",
    };
  }

  const result = await sendLoginSmsOnly({
    displayName: profile.name || "Key",
    email: user.email,
    password: "(test-password-not-real)",
    phone: profile.phone,
  });

  if (!result.ok) {
    return {
      error:
        result.reason ||
        "Text did not send. On a Twilio trial, verify your phone number in the Twilio console first.",
    };
  }

  return {
    success: true,
    detail: `Test login text sent to ${result.to ?? profile.phone}.`,
  };
}
