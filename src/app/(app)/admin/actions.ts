"use server";

import { sendLoginDetails } from "@/lib/notifications/send-login-details";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export interface TestEmailState {
  error?: string;
  success?: boolean;
  detail?: string;
}

/**
 * Sends a sample login-details email to the signed-in admin so they can
 * confirm Resend is wired before inviting the group.
 */
export async function sendTestLoginEmail(
  _prevState: TestEmailState,
  _formData: FormData
): Promise<TestEmailState> {
  void _formData;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "You must be signed in." };
  }

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "admin" && profile?.role !== "co-admin") {
    return { error: "Only admins can send a test email." };
  }

  if (!process.env.RESEND_API_KEY) {
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
