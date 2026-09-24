/**
 * Name of the small marker cookie that records whether the person checked
 * "Remember me" at sign-in. It's session-only when they didn't (so it - and
 * the choice - disappears when the browser fully closes), and long-lived
 * when they did. src/lib/supabase/middleware.ts reads it on every request
 * to decide whether to keep re-extending the actual Supabase session cookie.
 */
export const REMEMBER_COOKIE = "wr_remember";

/** ~400 days - matches @supabase/ssr's own default cookie lifetime. */
export const REMEMBER_MAX_AGE = 400 * 24 * 60 * 60;
