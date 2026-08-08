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
  password?: string;
  phone?: string;
  loginUrl?: string;
  emailSent?: boolean;
  smsSent?: boolean;
  needsEmailConfirm?: boolean;
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://winter-reunion.vercel.app"
  );
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
  const loginUrl = `${siteUrl()}/login`;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName },
      // So Supabase "Confirm your email" lands on our app, not a dead page.
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/home`,
    },
  });

  if (error || !data.user) {
    return { error: "Could not create your account. Please try again." };
  }

  await ensureProfile(supabase, data.user);
  await updateProfilePhone(supabase, data.user.id, phone);

  const delivery = await sendLoginDetails({
    displayName,
    email,
    password,
    phone,
  });

  const base = {
    success: true as const,
    displayName,
    email,
    password,
    phone,
    loginUrl,
    emailSent: delivery.emailSent,
    smsSent: delivery.smsSent,
  };

  if (!data.session) {
    return {
      ...base,
      needsEmailConfirm: true,
      message:
        "If you get a Confirm email from Supabase, tap it — it should open this site. Then sign in with the email + password below (screenshot them).",
    };
  }

  return base;
}
