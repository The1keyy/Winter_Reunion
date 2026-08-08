"use server";

import { revalidatePath } from "next/cache";

import {
  addCabinVote,
  createCabin,
  deleteCabinById,
  removeCabinVote,
  updateCabinStatus,
} from "@/lib/supabase/cabins";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { setSelectedCabin } from "@/lib/supabase/trip-settings";
import { cabinSchema } from "@/lib/validations/cabin";

export interface CabinFormState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isAdmin: false };
  }

  const profile = await getProfile(supabase, user.id);
  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";

  return { supabase, user, isAdmin };
}

export async function proposeCabin(
  _prevState: CabinFormState,
  formData: FormData
): Promise<CabinFormState> {
  const { supabase, user, isAdmin } = await requireAdmin();

  if (!user || !isAdmin) {
    return { error: "Only trip admins can propose cabins." };
  }

  const parsed = cabinSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    location: formData.get("location"),
    priceTotal: formData.get("priceTotal"),
    pricePerPerson: formData.get("pricePerPerson"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    maxOccupancy: formData.get("maxOccupancy"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Check that all fields are filled in correctly." };
  }

  const result = await createCabin(supabase, user.id, {
    name: parsed.data.name,
    url: parsed.data.url,
    location: parsed.data.location,
    price_total: parsed.data.priceTotal,
    price_per_person: parsed.data.pricePerPerson,
    bedrooms: parsed.data.bedrooms,
    bathrooms: parsed.data.bathrooms,
    max_occupancy: parsed.data.maxOccupancy,
    notes: parsed.data.notes,
  });

  if (!result) {
    return { error: "Could not add the cabin. Please try again." };
  }

  revalidatePath("/cabins");

  return { success: true, postedAt: Date.now() };
}

export async function openCabinVoting(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updateCabinStatus(supabase, id, "voting");
  revalidatePath("/cabins");
}

export async function selectCabin(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updateCabinStatus(supabase, id, "selected");
  await setSelectedCabin(supabase, id);
  revalidatePath("/cabins");
  revalidatePath("/home");
}

export async function rejectCabin(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updateCabinStatus(supabase, id, "rejected");
  revalidatePath("/cabins");
}

export async function deleteCabin(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await deleteCabinById(supabase, id);
  revalidatePath("/cabins");
}

export async function voteForCabin(
  cabinId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await addCabinVote(supabase, cabinId, user.id);
  revalidatePath("/cabins");
}

export async function removeVoteForCabin(
  cabinId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await removeCabinVote(supabase, cabinId, user.id);
  revalidatePath("/cabins");
}
