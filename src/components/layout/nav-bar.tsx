"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const desktopLinks = [
  { href: "/home", label: "Home" },
  { href: "/talk", label: "Talk" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/cabins", label: "Cabins" },
  { href: "/activities", label: "Activities" },
  { href: "/polls", label: "Polls" },
  { href: "/suggestions", label: "Ideas" },
] as const;

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading, isAdmin, isCoAdmin } = useUser();
  const isStaff = isAdmin || isCoAdmin;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-warm-gray/25 bg-charcoal/90 px-4 py-3 backdrop-blur-md md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <Link href="/home" className="group flex min-w-0 flex-col">
            <span className="font-heading text-[11px] font-semibold tracking-[0.18em] text-ice uppercase">
              Crew trip
            </span>
            <span className="truncate font-heading text-base font-semibold text-off-white transition-colors group-hover:text-ember md:text-lg">
              Winter Reunion 2027
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {desktopLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    "px-2.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors " +
                    (active
                      ? "text-ember"
                      : "text-warm-gray hover:text-off-white")
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            {isStaff ? (
              <>
                <Link
                  href="/payments"
                  className={
                    "px-2.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors " +
                    (pathname.startsWith("/payments")
                      ? "text-ember"
                      : "text-warm-gray hover:text-off-white")
                  }
                >
                  Ledger
                </Link>
                <Link
                  href="/admin"
                  className={
                    "px-2.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors " +
                    (pathname.startsWith("/admin")
                      ? "text-ember"
                      : "text-warm-gray hover:text-off-white")
                  }
                >
                  Admin
                </Link>
              </>
            ) : null}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {!loading && profile ? (
            <Link
              href="/home"
              className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
            >
              <span className="hidden text-sm font-medium text-off-white/80 sm:inline">
                {profile.name}
              </span>
              <Avatar name={profile.name} size="sm" />
            </Link>
          ) : null}
          <button type="button" onClick={handleSignOut} className="wr-btn !min-h-9 !px-3 !py-1.5 text-xs">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
