"use server";

import { revalidatePath } from "next/cache";

import {
  createPayment,
  deletePaymentById,
  updatePaymentStatus,
} from "@/lib/supabase/payments";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { paymentSchema } from "@/lib/validations/payment";
import type { PaymentStatus } from "@/types/database";

export interface PaymentFormState {
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

export async function addPayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const { supabase, isAdmin } = await requireAdmin();

  if (!isAdmin) {
    return { error: "Only trip admins can add charges." };
  }

  const parsed = paymentSchema.safeParse({
    profileId: formData.get("profileId"),
    description: formData.get("description"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Check that all fields are filled in correctly." };
  }

  const result = await createPayment(supabase, {
    profile_id: parsed.data.profileId,
    description: parsed.data.description,
    category: parsed.data.category,
    amount: parsed.data.amount,
    due_date: parsed.data.dueDate,
    notes: parsed.data.notes,
  });

  if (!result) {
    return { error: "Could not add the charge. Please try again." };
  }

  revalidatePath("/payments");

  return { success: true, postedAt: Date.now() };
}

export async function setPaymentStatus(
  id: string,
  status: PaymentStatus,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await updatePaymentStatus(supabase, id, status);
  revalidatePath("/payments");
}

export async function deletePayment(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  await deletePaymentById(supabase, id);
  revalidatePath("/payments");
}
