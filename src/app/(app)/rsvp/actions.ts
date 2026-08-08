"use server";

import { revalidatePath } from "next/cache";

import { upsertRegistration } from "@/lib/supabase/registrations";
import { createClient } from "@/lib/supabase/server";
import { registrationSchema } from "@/lib/validations/registration";

export interface RsvpState {
  error?: string;
  success?: boolean;
}

export async function submitRsvp(
  _prevState: RsvpState,
  formData: FormData
): Promise<RsvpState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const parsed = registrationSchema.safeParse({
    attending: formData.get("attending"),
    guestsCount: formData.get("guestsCount"),
    dietaryRestrictions: formData.get("dietaryRestrictions"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Check that all fields are filled in correctly." };
  }

  const result = await upsertRegistration(supabase, user.id, {
    attending: parsed.data.attending === "yes",
    guests_count: parsed.data.guestsCount,
    dietary_restrictions: parsed.data.dietaryRestrictions,
    notes: parsed.data.notes,
  });

  if (!result) {
    return { error: "Could not save your RSVP. Please try again." };
  }

  revalidatePath("/rsvp");
  revalidatePath("/home");

  return { success: true };
}
