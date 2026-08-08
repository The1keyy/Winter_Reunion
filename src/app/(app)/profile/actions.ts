"use server";

import { revalidatePath } from "next/cache";

import { updateProfilePhone } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { phoneSchema } from "@/lib/validations/profile";

export interface PhoneState {
  error?: string;
  success?: boolean;
}

export async function savePhone(
  _prevState: PhoneState,
  formData: FormData
): Promise<PhoneState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const parsed = phoneSchema.safeParse({
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid mobile number (at least 10 digits)." };
  }

  const result = await updateProfilePhone(supabase, user.id, parsed.data.phone);

  if (!result) {
    return { error: "Could not save your number. Please try again." };
  }

  revalidatePath("/home");

  return { success: true };
}
