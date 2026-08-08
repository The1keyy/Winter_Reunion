import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Payment, PaymentStatus } from "@/types/database";

/**
 * Fetches payments visible to the current user. The
 * "payments_select_own_or_admin" RLS policy transparently filters this to
 * just the caller's own charges unless they're an admin, so this same
 * query works for both the admin and member views.
 */
export async function getPayments(
  supabase: SupabaseClient<Database>
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPayments failed", error);
    return [];
  }

  return data ?? [];
}

export interface PaymentInput {
  profile_id: string;
  description: string;
  category: string | null;
  amount: number;
  due_date: string | null;
  notes: string | null;
}

/**
 * Creates a charge for a member. Relies on the "payments_insert_admin_only"
 * RLS policy - callers should also gate this in the UI.
 */
export async function createPayment(
  supabase: SupabaseClient<Database>,
  input: PaymentInput
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from("payments")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    console.error("createPayment failed", error);
    return null;
  }

  return data;
}

/**
 * Updates a payment's status, stamping paid_at when marked paid. Relies on
 * the "payments_update_admin_only" RLS policy — admin and co-admin via
 * public.is_admin().
 */
export async function updatePaymentStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: PaymentStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("payments")
    .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
    .eq("id", id);

  if (error) {
    console.error("updatePaymentStatus failed", error);
    return false;
  }

  return true;
}

/** Update the dollar amount on a charge (staff ledger). */
export async function updatePaymentAmount(
  supabase: SupabaseClient<Database>,
  id: string,
  amount: number
): Promise<boolean> {
  const { error } = await supabase
    .from("payments")
    .update({ amount })
    .eq("id", id);

  if (error) {
    console.error("updatePaymentAmount failed", error);
    return false;
  }

  return true;
}

/**
 * Deletes a payment. Relies on the "payments_delete_admin_only" RLS
 * policy.
 */
export async function deletePaymentById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) {
    console.error("deletePaymentById failed", error);
    return false;
  }

  return true;
}
