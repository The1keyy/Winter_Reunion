"use server";

import { revalidatePath } from "next/cache";

import { fetchLinkPreview } from "@/lib/link-preview";
import {
  createCabin,
  deleteCabinById,
  removeCabinVote,
  setCabinVote,
  updateCabinStatus,
  type CabinVoteResponse,
} from "@/lib/supabase/cabins";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { setSelectedCabin } from "@/lib/supabase/trip-settings";
import { cabinCardSchema } from "@/lib/validations/cabin";

export interface CabinFormState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

async function requireUser() {
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
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: "Sign in to add a cabin card." };
  }

  const parsed = cabinCardSchema.safeParse({
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
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Check that all fields are filled in correctly.",
    };
  }

  let linkTitle: string | null = null;
  let linkDescription: string | null = null;
  let linkImage: string | null = null;
  let hostname: string | null = null;

  if (parsed.data.url) {
    const preview = await fetchLinkPreview(parsed.data.url);
    if (preview) {
      linkTitle = preview.title;
      linkDescription = preview.description;
      linkImage = preview.image;
      hostname = preview.hostname;
    }
  }

  const name =
    parsed.data.name ||
    linkTitle ||
    hostname ||
    "Untitled cabin";

  const result = await createCabin(supabase, user.id, {
    name,
    url: parsed.data.url,
    location: parsed.data.location,
    price_total: parsed.data.priceTotal,
    price_per_person: parsed.data.pricePerPerson,
    bedrooms: parsed.data.bedrooms,
    bathrooms: parsed.data.bathrooms,
    max_occupancy: parsed.data.maxOccupancy,
    notes: parsed.data.notes,
    link_title: linkTitle,
    link_description: linkDescription,
    link_image: linkImage,
    status: "voting",
  });

  if (!result) {
    return {
      error:
        "Could not add the cabin. If this keeps failing, ask Key to run the latest database update.",
    };
  }

  revalidatePath("/cabins");
  revalidatePath("/home");

  return { success: true, postedAt: Date.now() };
}

export async function openCabinVoting(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireUser();
  if (!isAdmin) return;

  await updateCabinStatus(supabase, id, "voting");
  revalidatePath("/cabins");
}

export async function selectCabin(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireUser();
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
  const { supabase, isAdmin } = await requireUser();
  if (!isAdmin) return;

  await updateCabinStatus(supabase, id, "rejected");
  revalidatePath("/cabins");
}

export async function deleteCabin(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireUser();
  if (!isAdmin) return;

  await deleteCabinById(supabase, id);
  revalidatePath("/cabins");
  revalidatePath("/home");
}

export async function respondToCabin(
  cabinId: string,
  response: CabinVoteResponse,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, user } = await requireUser();
  if (!user) return;

  await setCabinVote(supabase, cabinId, user.id, response);
  revalidatePath("/cabins");
  revalidatePath("/home");
}

export async function retractCabinVote(
  cabinId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, user } = await requireUser();
  if (!user) return;

  await removeCabinVote(supabase, cabinId, user.id);
  revalidatePath("/cabins");
  revalidatePath("/home");
}
