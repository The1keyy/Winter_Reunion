"use server";

import { sendLoginDetails } from "@/lib/notifications/send-login-details";
import { ensureProfile, updateProfilePhone } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { formatJoinDisplayName, joinSchema } from "@/lib/validations/join";

export interface JoinState {
  error?: string;
  message?: string;
  success?: boolean;
  displayName?: string;
  email?: string;
  emailSent?: boolean;
  smsSent?: boolean;
}

export async function join(
  _prevState: JoinState,
  formData: FormData
): Promise<JoinState> {
  const parsed = joinSchema.safeParse({
    firstName: formData.get("firstName"),
    lastInitial: formData.get("lastInitial"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    passcode: formData.get("passcode"),
  });

  if (!parsed.success) {
    return { error: "Check that all fields are filled in correctly." };
  }

  const { firstName, lastInitial, email, phone, password, passcode } =
    parsed.data;

  if (passcode !== process.env.TRIP_JOIN_PASSCODE) {
    return { error: "Invalid passcode." };
  }

  const displayName = formatJoinDisplayName(firstName, lastInitial);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName },
    },
  });

  if (error || !data.user) {
    return { error: "Could not create your account. Please try again." };
  }

  // Trigger usually creates the profile; ensureProfile is a safe fallback.
  await ensureProfile(supabase, data.user);
  await updateProfilePhone(supabase, data.user.id, phone);

  const delivery = await sendLoginDetails({
    displayName,
    email,
    password,
    phone,
  });

  if (!data.session) {
    return {
      success: true,
      displayName,
      email,
      emailSent: delivery.emailSent,
      smsSent: delivery.smsSent,
      message:
        "Account created. Confirm your email if asked, then sign in. We also tried to send your login details.",
    };
  }

  return {
    success: true,
    displayName,
    email,
    emailSent: delivery.emailSent,
    smsSent: delivery.smsSent,
  };
}
