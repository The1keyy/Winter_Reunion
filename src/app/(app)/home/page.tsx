import Link from "next/link";

import { AnnouncementList } from "@/components/announcements/announcement-list";
import { NextMove, type NextMoveStep } from "@/components/guidance/next-move";
import { PhonePrompt } from "@/components/profile/phone-prompt";
import { AttendanceBoard } from "@/components/rsvp/attendance-board";
import { TripOverview } from "@/components/trip/trip-overview";
import { Avatar } from "@/components/ui/avatar";
import { HomeUpdates } from "@/components/updates/home-updates";
import { getActivities } from "@/lib/supabase/activities";
import { getAnnouncements } from "@/lib/supabase/announcements";
import { getCabins } from "@/lib/supabase/cabins";
import { getPolls } from "@/lib/supabase/polls";
import { getAllProfiles, getProfile } from "@/lib/supabase/profiles";
import { getAllRegistrations, getRegistration } from "@/lib/supabase/registrations";
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
    allRegistrations,
    announcements,
    polls,
    cabins,
    activities,
    talkPosts,
    profiles,
  ] = await Promise.all([
    user ? getProfile(supabase, user.id) : Promise.resolve(null),
    getTripSettings(supabase),
    user ? getRegistration(supabase, user.id) : Promise.resolve(null),
    getAllRegistrations(supabase),
    getAnnouncements(supabase, 5),
    getPolls(supabase),
    getCabins(supabase),
    getActivities(supabase),
    getTalkPosts(supabase, 3),
    getAllProfiles(supabase),
  ]);

  const nameById = new Map(profiles.map((p) => [p.id, p.name]));

  const canSetUpTrip = profile?.role === "admin" || profile?.role === "co-admin";
  const needsPhone = Boolean(user && profile && !profile.phone);

  const { personal, group } = buildHomeUpdates({
    registration,
    announcements,
    polls,
    cabins,
    activities,
    talkPosts,
  });

  const steps: NextMoveStep[] = [
    {
      id: "rsvp",
      label: registration
        ? registration.attending
          ? "RSVP: you're in"
          : "RSVP: not attending"
        : "RSVP — tell Key if you're going",
      detail: "One tap. Takes under a minute. Everyone plans around this.",
      href: "/rsvp",
      cta: registration ? "Update RSVP" : "RSVP now",
      done: Boolean(registration),
      priority: true,
    },
    {
      id: "phone",
      label: profile?.phone
        ? "Number on file"
        : "Add your number for urgent texts",
      detail: "So Key can reach you when a cabin or plan changes.",
      href: "/home#phone",
      cta: "Add number",
      done: Boolean(profile?.phone),
    },
  ];

  const exploreLinks = [
    { href: "/talk", label: "Talk" },
    { href: "/cabins", label: "Cabins" },
    { href: "/activities", label: "Activities" },
    { href: "/polls", label: "Polls" },
    { href: "/suggestions", label: "Ideas" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      <header className="wr-fade-up flex items-center gap-3.5">
        {profile ? <Avatar name={profile.name} size="lg" /> : null}
        <div className="flex flex-col gap-1">
          <span className="wr-section-label">Home base</span>
          <h1 className="font-heading text-2xl font-semibold text-off-white md:text-3xl">
            {profile ? `Hey ${profile.name.split(" ")[0]}.` : "Hey."}
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-off-white/70 md:text-[15px]">
            {trip
              ? "Finish your checklist, then jump into whatever needs you."
              : canSetUpTrip
                ? "Trip details aren't live yet — open Admin and set them."
                : "Trip details aren't set yet. RSVP anyway so Key knows your status."}
          </p>
        </div>
      </header>

      <NextMove steps={steps} name={profile?.name} />

      {needsPhone ? (
        <div id="phone" className="wr-fade-up-delay-1 scroll-mt-24">
          <PhonePrompt />
        </div>
      ) : null}

      {canSetUpTrip ? (
        <div className="wr-panel wr-fade-up-delay-1 flex flex-col gap-3">
          <span className="wr-section-label">Admin lane</span>
          <p className="text-sm text-off-white/70">
            Run posts, the payment ledger, and trip setup from one spot.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="wr-btn-primary">
              Open dashboard
            </Link>
            <Link href="/payments" className="wr-btn">
              Ledger
            </Link>
            <Link href="/admin/announcements" className="wr-btn">
              Quick post
            </Link>
            <Link href="/admin/members" className="wr-btn">
              Members
            </Link>
          </div>
        </div>
      ) : null}

      {trip ? (
        <div className="wr-fade-up-delay-2">
          <TripOverview trip={trip} />
        </div>
      ) : null}

      <AttendanceBoard
        profiles={profiles}
        registrations={allRegistrations}
        currentUserId={user?.id ?? null}
      />

      <section className="flex flex-col gap-3">
        <span className="wr-section-label">Explore</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {exploreLinks.map((link) => (
            <Link key={link.href} href={link.href} className="wr-btn justify-start">
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <HomeUpdates
        personal={personal}
        group={group}
        hasPhone={Boolean(profile?.phone)}
      />

      <section className="flex flex-col gap-3 border-t border-warm-gray/20 pt-5">
        <div className="flex items-center justify-between gap-4">
          <span className="wr-section-label">Announcements</span>
          {canSetUpTrip ? (
            <Link
              href="/admin/announcements"
              className="text-sm font-medium text-ice underline-offset-4 hover:text-off-white hover:underline"
            >
              Post / manage
            </Link>
          ) : null}
        </div>
        <AnnouncementList announcements={announcements} nameById={nameById} />
      </section>
    </div>
  );
}
