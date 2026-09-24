"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { REMEMBER_COOKIE, REMEMBER_MAX_AGE } from "@/lib/supabase/remember";
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

  // Checkbox defaults to checked in the form; unchecked checkboxes are
  // simply absent from FormData, so absence here means "off".
  const remember = formData.get("remember") === "on";

  const supabase = await createClient({ persistSession: remember });

  const { data, error } = await supabase.auth.signInWithPassword(
    parsed.data
  );

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  await ensureProfile(supabase, data.user);

  // Marks the choice for src/lib/supabase/middleware.ts so it keeps honoring
  // "don't remember me" on every later request too, not just this one. This
  // cookie itself is session-only when remember is off, so it (and the
  // choice) disappears the moment the browser fully closes.
  const cookieStore = await cookies();
  cookieStore.set(REMEMBER_COOKIE, remember ? "1" : "0", {
    path: "/",
    sameSite: "lax",
    ...(remember ? { maxAge: REMEMBER_MAX_AGE } : {}),
  });

  redirect("/home");
}
