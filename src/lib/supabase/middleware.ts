import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { REMEMBER_COOKIE } from "@/lib/supabase/remember";
import type { Database } from "@/types/database";

const PUBLIC_PATHS = ["/login", "/join", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Refreshes the Supabase session cookie on every request and enforces the
 * "signed in except on /login or /join" rule. Called from src/proxy.ts.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Absent means "remember" (matches the default before this cookie
  // existed, and the checkbox's own default) - only an explicit "0" from
  // someone unchecking "Remember me" turns off the long-lived cookie.
  const remember = request.cookies.get(REMEMBER_COOKIE)?.value !== "0";

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            const finalOptions = remember
              ? options
              : { ...options, maxAge: undefined, expires: undefined };
            supabaseResponse.cookies.set(name, value, finalOptions);
          });
        },
      },
    }
  );

  // Always use getUser() here, never getSession() - it revalidates the
  // token against Supabase Auth instead of trusting a possibly stale cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isPublic) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return supabaseResponse;
}
