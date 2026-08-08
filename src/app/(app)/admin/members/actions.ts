"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validations/member";

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
  postedAt?: number;
}

/**
 * This is deliberately stricter than the usual admin-or-co-admin check
 * used elsewhere (announcements, trip settings, etc). Setting someone
 * else's password is powerful enough that it's limited to the "admin"
 * role only, not "co-admin".
 */
async function requirePrimaryAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const profile = await getProfile(supabase, user.id);
  return profile?.role === "admin";
}

export async function resetMemberPassword(
  profileId: string,
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const isPrimaryAdmin = await requirePrimaryAdmin();

  if (!isPrimaryAdmin) {
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

  return { success: true, postedAt: Date.now() };
}
