"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { joinSchema } from "@/lib/validations/join";

export interface JoinState {
  error?: string;
  message?: string;
}

export async function join(
  _prevState: JoinState,
  formData: FormData
): Promise<JoinState> {
  const parsed = joinSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passcode: formData.get("passcode"),
  });

  if (!parsed.success) {
    return { error: "Check that all fields are filled in correctly." };
  }

  const { name, email, password, passcode } = parsed.data;

  if (passcode !== process.env.TRIP_JOIN_PASSCODE) {
    return { error: "Invalid passcode." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (error || !data.user) {
    return { error: "Could not create your account. Please try again." };
  }

  if (!data.session) {
    return {
      message: "Check your email to confirm your account before signing in.",
    };
  }

  redirect("/home");
}
