import Link from "next/link";
import { redirect } from "next/navigation";

import { TestEmailButton } from "@/components/admin/test-email-button";
import { getPayments } from "@/lib/supabase/payments";
import { getAllProfiles, getProfile } from "@/lib/supabase/profiles";
import { getAllRegistrations } from "@/lib/supabase/registrations";
import { createClient } from "@/lib/supabase/server";
import { getTripSettings } from "@/lib/supabase/trip-settings";

interface DashLink {
  href: string;
  title: string;
  detail: string;
  primary?: boolean;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  const isStaff = profile?.role === "admin" || profile?.role === "co-admin";
  const isPrimaryAdmin = profile?.role === "admin";

  if (!isStaff) redirect("/home");

  const [trip, payments, profiles, registrations] = await Promise.all([
    getTripSettings(supabase),
    getPayments(supabase),
    getAllProfiles(supabase),
    getAllRegistrations(supabase),
  ]);

  const unpaid = payments.filter(
    (p) => p.status === "unpaid" || p.status === "pending"
  );
  const unpaidTotal = unpaid.reduce((sum, p) => sum + p.amount, 0);

  const rsvpCount = registrations.length;
  const attendingCount = registrations.filter((r) => r.attending).length;
  const phoneCount = profiles.filter((p) => p.phone).length;

  const links: DashLink[] = [
    {
      href: "/admin/announcements",
      title: "Post an update",
      detail: "Announce news + paste Airbnb / Venmo / doc links.",
      primary: true,
    },
    {
      href: "/payments",
      title: "Payments",
      detail: unpaid.length
        ? `${unpaid.length} open charges · $${unpaidTotal.toLocaleString()} outstanding`
        : "Assign charges and mark people paid.",
      primary: true,
    },
    {
      href: "/admin/trip-settings",
      title: "Trip details",
      detail: trip
        ? `${trip.trip_name}${trip.start_date ? ` · starts ${trip.start_date}` : ""}`
        : "Set name, dates, and location.",
    },
    {
      href: "/cabins",
      title: "Cabins",
      detail: "Propose options, open voting, pick the winner.",
    },
    {
      href: "/activities",
      title: "Activities",
      detail: "Propose outings and see yes / no / maybe.",
    },
    {
      href: "/polls",
      title: "Polls",
      detail: "Create a question, close it when decided.",
    },
    {
      href: "/suggestions",
      title: "Suggestions",
      detail: "Accept or reject ideas from the group.",
    },
    {
      href: "/talk",
      title: "Talk",
      detail: "See side conversations that need a look.",
    },
  ];

  if (isPrimaryAdmin) {
    links.push({
      href: "/admin/members",
      title: "Members & passwords",
      detail: `${profiles.length} people · ${phoneCount} numbers on file`,
    });
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          One place for admins and co-admins to run the trip — post updates,
          manage money, and keep the group moving.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Members" value={String(profiles.length)} />
        <Stat
          label="RSVPs"
          value={`${rsvpCount}/${profiles.length}`}
          hint={`${attendingCount} in`}
        />
        <Stat
          label="Open charges"
          value={String(unpaid.length)}
          hint={unpaid.length ? `$${unpaidTotal.toLocaleString()}` : "Clear"}
        />
        <Stat
          label="Numbers"
          value={`${phoneCount}/${profiles.length}`}
          hint="for reach-outs"
        />
      </div>

      <TestEmailButton />

      <div className="flex flex-col gap-3">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          Manage
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                "flex flex-col gap-1 border p-4 transition-colors " +
                (link.primary
                  ? "border-off-white/50 hover:border-off-white"
                  : "border-warm-gray/20 hover:border-off-white/50")
              }
            >
              <span className="text-sm font-normal text-off-white">
                {link.title}
              </span>
              <span className="text-sm font-normal text-off-white/60">
                {link.detail}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-warm-gray/20 p-3">
      <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
        {label}
      </span>
      <span className="text-xl font-light text-off-white">{value}</span>
      {hint ? (
        <span className="text-xs font-normal text-off-white/40">{hint}</span>
      ) : null}
    </div>
  );
}
