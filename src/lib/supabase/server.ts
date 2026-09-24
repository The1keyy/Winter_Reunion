import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

interface CreateClientOptions {
  /**
   * Defaults to true (matches @supabase/ssr's own default: a ~400 day
   * cookie, so people stay signed in). Pass false only from the sign-in
   * action when the person unchecked "Remember me" - that strips the
   * expiry so the session cookie is deleted when the browser fully closes.
   */
  persistSession?: boolean;
}

/**
 * Server-side Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads the current request's cookies for the session.
 *
 * Writing cookies only succeeds from a Server Action or Route Handler; calls
 * from a Server Component are caught and ignored because the proxy
 * (src/proxy.ts) already refreshes and persists the session on every request.
 */
export async function createClient(options: CreateClientOptions = {}) {
  const { persistSession = true } = options;
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              const finalOptions = persistSession
                ? cookieOptions
                : { ...cookieOptions, maxAge: undefined, expires: undefined };
              cookieStore.set(name, value, finalOptions);
            });
          } catch {
            // Called from a Server Component - safe to ignore.
          }
        },
      },
    }
  );
}
