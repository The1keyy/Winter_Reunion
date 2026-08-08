import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Handles Supabase email-confirm / magic-link redirects so "Confirm" lands
 * on a real page (home or login) instead of a blank/dead URL.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextPath = searchParams.get("next") ?? "/home";
  const next = nextPath.startsWith("/") ? nextPath : "/home";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (
    tokenHash &&
    (type === "signup" ||
      type === "email" ||
      type === "magiclink" ||
      type === "invite" ||
      type === "recovery")
  ) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?confirmed=1`);
}
