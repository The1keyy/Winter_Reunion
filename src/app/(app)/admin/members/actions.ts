"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile, getProfile, updateProfilePhone } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import {
  createMemberSchema,
  memberRoleSchema,
  resetPasswordSchema,
} from "@/lib/validations/member";
import type { UserRole } from "@/types/database";

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

export interface MemberRoleState {
  error?: string;
  success?: boolean;
}

export interface CreateMemberState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

async function requirePrimaryAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, supabase, user: null };
  }

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "admin") {
    return { ok: false as const, supabase, user };
  }

  return { ok: true as const, supabase, user };
}

export async function resetMemberPassword(
  profileId: string,
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const { ok } = await requirePrimaryAdmin();

  if (!ok) {
    return { error: "Only the trip admin can reset passwords." };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a password with at least 6 characters." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(profileId, {
    password: parsed.data.password,
  });

  if (error) {
    console.error("resetMemberPassword failed", error);
    return { error: "Could not update the password. Please try again." };
  }

  revalidatePath("/admin/members");
  return { success: true, postedAt: Date.now() };
}

export async function createMemberAccount(
  _prevState: CreateMemberState,
  formData: FormData
): Promise<CreateMemberState> {
  const { ok, supabase } = await requirePrimaryAdmin();

  if (!ok) {
    return { error: "Only the trip admin can add members." };
  }

  const parsed = createMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form and try again.",
    };
  }

  const { name, email, phone, password } = parsed.data;

  const adminClient = createAdminClient();

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      return { error: "That email already has an account." };
    }
    return {
      error: error?.message ?? "Could not create the account. Please try again.",
    };
  }

  // Belt-and-suspenders: the auth.users trigger (handle_new_user) also
  // creates this row, but ensureProfile is a safe no-op if it already ran.
  await ensureProfile(supabase, data.user);
  if (phone) {
    await updateProfilePhone(supabase, data.user.id, phone);
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin");
  revalidatePath("/home");
  return { success: true, postedAt: Date.now() };
}

export async function updateMemberRole(
  profileId: string,
  _prevState: MemberRoleState,
  formData: FormData
): Promise<MemberRoleState> {
  const { ok, user, supabase } = await requirePrimaryAdmin();

  if (!ok || !user) {
    return { error: "Only the trip admin can change roles." };
  }

  const parsed = memberRoleSchema.safeParse({
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Pick a valid role." };
  }

  const nextRole = parsed.data.role as UserRole;

  if (profileId === user.id && nextRole !== "admin") {
    return { error: "You can't remove admin from your own account." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: nextRole })
    .eq("id", profileId);

  if (error) {
    console.error("updateMemberRole failed", error);
    return { error: "Could not update the role. Please try again." };
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin");
  revalidatePath("/home");
  return { success: true };
}

export async function deleteMember(
  profileId: string,
  _formData: FormData
): Promise<void> {
  void _formData;
  const { ok, user } = await requirePrimaryAdmin();
  if (!ok || !user) return;

  if (profileId === user.id) {
    return;
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(profileId);

  if (error) {
    console.error("deleteMember failed", error);
    return;
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin");
  revalidatePath("/home");
}
