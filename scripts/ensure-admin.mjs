/**
 * One-time / repeatable local bootstrap: create or update the primary admin
 * auth user + set profiles.role = 'admin'.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/ensure-admin.mjs
 *
 * Reads ADMIN_EMAIL + ADMIN_PASSWORD from env (never commit those).
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Keyshawn J.";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!email || !password || password.length < 6) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 6 chars) in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target) {
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const hit = data.users.find(
      (u) => u.email?.toLowerCase() === target
    );
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

const existing = await findUserByEmail(email);

let userId;
if (existing) {
  const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) {
    console.error("updateUser failed", error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log("Updated existing auth user:", email);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) {
    console.error("createUser failed", error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log("Created auth user:", email);
}

const { error: profileError } = await admin.from("profiles").upsert(
  {
    id: userId,
    name,
    email,
    role: "admin",
  },
  { onConflict: "id" }
);

if (profileError) {
  console.error("profile upsert failed", profileError.message);
  process.exit(1);
}

console.log("Profile set to role=admin. Sign in at /login with ADMIN_EMAIL.");
