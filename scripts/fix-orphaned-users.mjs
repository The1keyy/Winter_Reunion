/**
 * Repair tool: for every auth.users row with no matching public.profiles
 * row, creates the missing profile (role "member") and marks their email
 * confirmed so they can sign in immediately with the password they already
 * chose - no confirmation email needed. Safe to re-run anytime; it's a
 * no-op if everyone already has a profile.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/fix-orphaned-users.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listAllAuthUsers() {
  const users = [];
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 200) break;
    page += 1;
  }
  return users;
}

const [authUsers, profilesResult] = await Promise.all([
  listAllAuthUsers(),
  admin.from("profiles").select("id"),
]);

if (profilesResult.error) {
  console.error("profiles query failed", profilesResult.error.message);
  process.exit(1);
}

const profileIds = new Set(profilesResult.data.map((p) => p.id));
const orphans = authUsers.filter((u) => !profileIds.has(u.id));

if (orphans.length === 0) {
  console.log("No orphaned auth users found — nothing to fix.");
  process.exit(0);
}

for (const u of orphans) {
  const name =
    u.user_metadata?.full_name ??
    u.user_metadata?.name ??
    u.email?.split("@")[0] ??
    "New Member";

  const { error: profileError } = await admin.from("profiles").insert({
    id: u.id,
    name,
    email: u.email ?? "",
    role: "member",
  });

  if (profileError) {
    console.error(`✗ ${u.email}: profile insert failed —`, profileError.message);
    continue;
  }

  if (!u.email_confirmed_at) {
    const { error: confirmError } = await admin.auth.admin.updateUserById(u.id, {
      email_confirm: true,
    });
    if (confirmError) {
      console.error(`  (profile created, but confirm failed —`, confirmError.message, ")");
      continue;
    }
  }

  console.log(`✓ ${u.email}: profile created, email confirmed. Can sign in now.`);
}
