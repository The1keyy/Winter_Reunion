import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Service-role Supabase client. This bypasses Row Level Security entirely
 * and can perform privileged operations like setting a user's password
 * directly (supabase.auth.admin.*).
 *
 * SERVER-ONLY. Never import this module from a Client Component, and never
 * call it without first verifying the caller is an admin - it has no
 * built-in access control of its own.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (and your Vercel project's environment variables) from Supabase dashboard > Project Settings > API."
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
