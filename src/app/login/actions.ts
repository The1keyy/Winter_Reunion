"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profiles";
import { signInSchema } from "@/lib/validations/auth";

export interface SignInState {
  error?: string;
}

export async function signIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword(
    parsed.data
  );

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  await ensureProfile(supabase, data.user);

  redirect("/home");
}
