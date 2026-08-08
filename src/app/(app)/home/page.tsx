import Link from "next/link";

import { AnnouncementList } from "@/components/announcements/announcement-list";
import { PhonePrompt } from "@/components/profile/phone-prompt";
import { TripOverview } from "@/components/trip/trip-overview";
import { HomeUpdates } from "@/components/updates/home-updates";
import { getActivities } from "@/lib/supabase/activities";
import { getAnnouncements } from "@/lib/supabase/announcements";
import { getCabins } from "@/lib/supabase/cabins";
import { getPayments } from "@/lib/supabase/payments";
import { getPolls } from "@/lib/supabase/polls";
import { getProfile } from "@/lib/supabase/profiles";
import { getRegistration } from "@/lib/supabase/registrations";
import { createClient } from "@/lib/supabase/server";
import { getTalkPosts } from "@/lib/supabase/talk";
import { getTripSettings } from "@/lib/supabase/trip-settings";
import { buildHomeUpdates } from "@/lib/updates/build-home-updates";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    profile,
    trip,
    registration,
    announcements,
    payments,
    polls,
    cabins,
    activities,
    talkPosts,
  ] = await Promise.all([
    user ? getProfile(supabase, user.id) : Promise.resolve(null),
    getTripSettings(supabase),
    user ? getRegistration(supabase, user.id) : Promise.resolve(null),
    getAnnouncements(supabase, 5),
    user ? getPayments(supabase) : Promise.resolve([]),
    getPolls(supabase),
    getCabins(supabase),
    getActivities(supabase),
    getTalkPosts(supabase, 3),
  ]);

  const canSetUpTrip = profile?.role === "admin" || profile?.role === "co-admin";
  const needsPhone = Boolean(user && profile && !profile.phone);

  const { personal, group } = buildHomeUpdates({
    registration,
    payments,
    announcements,
    polls,
    cabins,
    activities,
    talkPosts,
  });

  const rsvpStatus = !registration
    ? "You haven't RSVP'd yet."
    : registration.attending
      ? "You're marked as attending."
      : "You're marked as not attending.";

  const quickLinks = [
    { href: "/rsvp", label: registration ? "Update RSVP" : "RSVP now" },
    { href: "/talk", label: "Talk" },
    { href: "/cabins", label: "Cabins" },
    { href: "/activities", label: "Activities" },
    { href: "/suggestions", label: "Suggestions" },
    { href: "/polls", label: "Polls" },
    { href: "/payments", label: "Payments" },
  ];

  const quickLinksRow = (
    <div className="flex flex-wrap gap-3">
      {quickLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="w-fit border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white transition-colors hover:border-off-white"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  const adminShortcuts = canSetUpTrip ? (
    <div className="flex flex-col gap-2 border border-warm-gray/20 p-4">
      <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
        Admin
      </span>
      <p className="text-sm font-normal text-off-white/60">
        Run payments, posts, and trip setup from one dashboard.
      </p>
      <div className="mt-1 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="w-fit border border-off-white bg-off-white px-4 py-2.5 text-sm font-normal text-charcoal"
        >
          Open dashboard
        </Link>
        <Link
          href="/admin/announcements"
          className="w-fit border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white hover:border-off-white"
        >
          Quick post
        </Link>
        <Link
          href="/payments"
          className="w-fit border border-warm-gray/40 px-4 py-2.5 text-sm font-normal text-off-white hover:border-off-white"
        >
          Payments
        </Link>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-light text-off-white md:text-2xl">
          Welcome{profile ? `, ${profile.name}` : ""}.
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          {trip
            ? "Check small notifications below, then jump into what needs you."
            : canSetUpTrip
              ? "Open the dashboard to set trip details and post your first update."
              : "Trip details aren't set yet. Finish your RSVP while you wait."}
        </p>
      </div>

      {needsPhone ? <PhonePrompt /> : null}
      {adminShortcuts}

      {trip ? <TripOverview trip={trip} /> : null}

      <div className="flex flex-col gap-3 border-t border-warm-gray/20 pt-4">
        <p className="text-sm font-normal text-off-white/70">{rsvpStatus}</p>
        {quickLinksRow}
      </div>

      <HomeUpdates
        personal={personal}
        group={group}
        hasPhone={Boolean(profile?.phone)}
      />

      <div className="flex flex-col gap-3 border-t border-warm-gray/20 pt-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
            Latest announcements
          </span>
          {canSetUpTrip ? (
            <Link
              href="/admin/announcements"
              className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
            >
              Post / manage
            </Link>
          ) : null}
        </div>
        <AnnouncementList announcements={announcements} />
      </div>
    </div>
  );
}
