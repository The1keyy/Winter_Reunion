/**
 * Diagnostic: finds auth.users rows that have no matching public.profiles
 * row (e.g. someone signed up at /join but the profile insert failed
 * because they had no session yet). Read-only - makes no changes.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/find-orphaned-users.mjs
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
  admin.from("profiles").select("id, email, name, role"),
]);

if (profilesResult.error) {
  console.error("profiles query failed", profilesResult.error.message);
  process.exit(1);
}

const profileIds = new Set(profilesResult.data.map((p) => p.id));

console.log(`auth.users: ${authUsers.length}, profiles: ${profilesResult.data.length}`);
console.log("");

const orphans = authUsers.filter((u) => !profileIds.has(u.id));

if (orphans.length === 0) {
  console.log("No orphaned auth users found — every auth user has a profile row.");
} else {
  console.log(`Found ${orphans.length} auth user(s) with NO profile row:`);
  for (const u of orphans) {
    console.log(
      `- ${u.email} (id: ${u.id}) — created ${u.created_at}, confirmed: ${
        u.email_confirmed_at ? "yes" : "no"
      }, name metadata: ${u.user_metadata?.full_name ?? u.user_metadata?.name ?? "(none)"}`
    );
  }
}
