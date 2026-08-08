"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

export function NavBar() {
  const router = useRouter();
  const { profile, loading, isAdmin, isCoAdmin } = useUser();
  const isStaff = isAdmin || isCoAdmin;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-warm-gray/30 bg-charcoal px-4 py-3 md:px-8">
      <div className="flex items-center gap-4 md:gap-6">
        <Link
          href="/home"
          className="text-sm font-light text-off-white md:text-base"
        >
          Winter Reunion 2027
        </Link>
        <nav className="hidden items-center gap-3 sm:flex">
          <Link
            href="/home"
            className="text-xs font-normal text-off-white/60 hover:text-off-white"
          >
            Home
          </Link>
          <Link
            href="/talk"
            className="text-xs font-normal text-off-white/60 hover:text-off-white"
          >
            Talk
          </Link>
          {isStaff ? (
            <Link
              href="/admin"
              className="text-xs font-normal text-off-white/60 hover:text-off-white"
            >
              Dashboard
            </Link>
          ) : null}
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
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
