"use server";

import { revalidatePath } from "next/cache";

import {
  createPayment,
  deletePaymentById,
  updatePaymentAmount,
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

/** Admin + co-admin (same as public.is_admin()). */
async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isStaff: false };
  }

  const profile = await getProfile(supabase, user.id);
  const isStaff = profile?.role === "admin" || profile?.role === "co-admin";

  return { supabase, user, isStaff };
}

function revalidateLedger() {
  revalidatePath("/payments");
  revalidatePath("/admin");
}

export async function addPayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const { supabase, isStaff } = await requireStaff();

  if (!isStaff) {
    return { error: "Only admins and co-admins can add charges." };
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

  revalidateLedger();

  return { success: true, postedAt: Date.now() };
}

export async function setPaymentStatus(
  id: string,
  status: PaymentStatus,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isStaff } = await requireStaff();
  if (!isStaff) return;

  await updatePaymentStatus(supabase, id, status);
  revalidateLedger();
}

export async function updateChargeAmount(
  id: string,
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const { supabase, isStaff } = await requireStaff();
  if (!isStaff) {
    return { error: "Only admins and co-admins can edit amounts." };
  }

  const raw = String(formData.get("amount") ?? "").trim();
  const amount = Number(raw);
  if (!raw || Number.isNaN(amount) || amount <= 0) {
    return { error: "Enter an amount greater than 0." };
  }

  const ok = await updatePaymentAmount(supabase, id, amount);
  if (!ok) {
    return { error: "Could not update amount. Try again." };
  }

  revalidateLedger();
  return { success: true, postedAt: Date.now() };
}

export async function deletePayment(
  id: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { supabase, isStaff } = await requireStaff();
  if (!isStaff) return;

  await deletePaymentById(supabase, id);
  revalidateLedger();
}
