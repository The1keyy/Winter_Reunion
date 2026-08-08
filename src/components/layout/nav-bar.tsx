"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

export function NavBar() {
  const router = useRouter();
  const { profile, loading } = useUser();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-warm-gray/30 bg-charcoal px-4 py-3 md:px-8">
      <span className="text-sm font-light text-off-white md:text-base">
        Winter Reunion 2027
      </span>

      <div className="flex items-center gap-4">
        {!loading && profile ? (
          <span className="text-sm font-normal text-off-white/80">
            {profile.name}
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleSignOut}
          className="border border-warm-gray/40 px-3 py-1.5 text-sm font-normal text-off-white transition-colors hover:border-off-white"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
