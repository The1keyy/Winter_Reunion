"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/home", label: "Home" },
  { href: "/talk", label: "Talk" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/activities", label: "Vote" },
  { href: "/cabins", label: "Cabins" },
] as const;

/**
 * Thumb-zone nav (Fitts's law): big targets, always visible on phones.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-warm-gray/25 bg-charcoal/95 px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold tracking-wide uppercase transition-colors " +
                  (active
                    ? "text-ember"
                    : "text-warm-gray hover:text-off-white")
                }
              >
                <span
                  className={
                    "mb-0.5 h-0.5 w-5 rounded-full transition-colors " +
                    (active ? "bg-ember" : "bg-transparent")
                  }
                  aria-hidden
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
