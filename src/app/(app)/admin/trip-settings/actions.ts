"use server";

import { revalidatePath } from "next/cache";

import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { upsertTripSettings } from "@/lib/supabase/trip-settings";
import { tripSettingsSchema } from "@/lib/validations/trip-settings";

export interface TripSettingsState {
  error?: string;
  success?: boolean;
}

export async function updateTripSettings(
  _prevState: TripSettingsState,
  formData: FormData
): Promise<TripSettingsState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "admin" && profile?.role !== "co-admin") {
    return { error: "Only trip admins can edit these details." };
  }

  const parsed = tripSettingsSchema.safeParse({
    tripName: formData.get("tripName"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    state: formData.get("state"),
    cityOrArea: formData.get("cityOrArea"),
    guestLimit: formData.get("guestLimit"),
    estimatedBudgetLow: formData.get("estimatedBudgetLow"),
    estimatedBudgetHigh: formData.get("estimatedBudgetHigh"),
    skiingStatus: formData.get("skiingStatus"),
    cabinSearchStatus: formData.get("cabinSearchStatus"),
    transportationStatus: formData.get("transportationStatus"),
    paymentStatus: formData.get("paymentStatus"),
    registrationStatus: formData.get("registrationStatus"),
  });

  if (!parsed.success) {
    return { error: "Check that all fields are filled in correctly." };
  }

  const result = await upsertTripSettings(supabase, {
    trip_name: parsed.data.tripName,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    state: parsed.data.state,
    city_or_area: parsed.data.cityOrArea,
    guest_limit: parsed.data.guestLimit,
    estimated_budget_low: parsed.data.estimatedBudgetLow,
    estimated_budget_high: parsed.data.estimatedBudgetHigh,
    skiing_status: parsed.data.skiingStatus,
    cabin_search_status: parsed.data.cabinSearchStatus,
    transportation_status: parsed.data.transportationStatus,
    payment_status: parsed.data.paymentStatus,
    registration_status: parsed.data.registrationStatus,
  });

  if (!result) {
    return { error: "Could not save trip details. Please try again." };
  }

  revalidatePath("/home");
  revalidatePath("/admin/trip-settings");

  return { success: true };
}
