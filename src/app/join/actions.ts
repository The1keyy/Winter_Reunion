"use server";

import { sendLoginDetails } from "@/lib/notifications/send-login-details";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // Create the account already confirmed via the admin API instead of the
  // public signUp() flow. signUp() only creates a session (and only lets
  // the profile insert pass RLS) once the email is confirmed - anyone who
  // didn't click that link ended up with a login but no profile row and no
  // way to show up anywhere in the app. Creating (and confirming) the user
  // directly skips that trap entirely.
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      return {
        error: "That email already has an account. Try signing in instead.",
      };
    }
    return { error: "Could not create your account. Please try again." };
  }

  // The auth.users trigger (handle_new_user) also creates this row, but an
  // explicit upsert here - with the service role, so it can't be blocked by
  // RLS - guarantees it even if that trigger is ever missing or fails. This
  // is exactly the gap that left earlier joiners stuck with a login and no
  // profile.
  await adminClient
    .from("profiles")
    .upsert(
      { id: data.user.id, name: displayName, email, phone, role: "member" },
      { onConflict: "id" }
    );

  // Sign them in right away so they land in the app instead of bouncing to
  // a separate /login step.
  const supabase = await createClient();
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

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

  if (!signInData.session) {
    return {
      ...base,
      needsEmailConfirm: true,
      message: "Your account is ready - sign in with the email + password below (screenshot them).",
    };
  }

  return base;
}
