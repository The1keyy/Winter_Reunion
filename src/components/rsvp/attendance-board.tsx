import { Avatar } from "@/components/ui/avatar";
import type { Profile, Registration } from "@/types/database";

interface AttendanceBoardProps {
  profiles: Profile[];
  registrations: Registration[];
  currentUserId?: string | null;
}

interface AttendanceRow {
  profile: Profile;
  registration: Registration | null;
}

type Tone = "green" | "muted" | "ice";

const MAX_STACK = 8;

const TONE_TEXT: Record<Tone, string> = {
  green: "text-winter-green",
  muted: "text-warm-gray",
  ice: "text-ice",
};

const TONE_DOT: Record<Tone, string> = {
  green: "bg-winter-green",
  muted: "bg-warm-gray",
  ice: "bg-ice",
};

function byName(a: AttendanceRow, b: AttendanceRow) {
  return a.profile.name.localeCompare(b.profile.name);
}

function buildCaption(rows: AttendanceRow[], currentUserId?: string | null) {
  if (rows.length === 0) return "";

  const names = rows.map((r) =>
    r.profile.id === currentUserId ? "You" : r.profile.name
  );

  const youIndex = names.indexOf("You");
  if (youIndex > 0) {
    names.splice(youIndex, 1);
    names.unshift("You");
  }

  if (names.length === 1) return `${names[0]} confirmed.`;
  if (names.length === 2) return `${names[0]} and ${names[1]} confirmed.`;

  const shown = names.slice(0, 2).join(", ");
  const remaining = names.length - 2;
  return `${shown} and ${remaining} other${remaining === 1 ? "" : "s"} confirmed.`;
}

/**
 * Public "who's coming" dashboard on Home - social-proof front and center
 * (stacked avatars, a live percentage, an expandable full roster). Relies on
 * the "registrations_select_all" RLS policy so everyone sees everyone's
 * status, not just their own.
 */
export function AttendanceBoard({
  profiles,
  registrations,
  currentUserId,
}: AttendanceBoardProps) {
  const registrationByProfileId = new Map(
    registrations.map((r) => [r.profile_id, r])
  );

  const rows: AttendanceRow[] = profiles.map((profile) => ({
    profile,
    registration: registrationByProfileId.get(profile.id) ?? null,
  }));

  const going = rows
    .filter((r) => r.registration?.attending === true)
    .sort(byName);
  const notGoing = rows
    .filter((r) => r.registration && r.registration.attending === false)
    .sort(byName);
  const awaiting = rows.filter((r) => !r.registration).sort(byName);

  const totalGuests = going.reduce(
    (sum, r) => sum + (r.registration?.guests_count ?? 0),
    0
  );
  const headcount = going.length + totalGuests;
  const totalMembers = profiles.length;
  const percentIn =
    totalMembers === 0 ? 0 : Math.round((going.length / totalMembers) * 100);

  const stackRows = going.slice(0, MAX_STACK);
  const overflow = going.length - stackRows.length;

  return (
    <section className="wr-panel wr-fade-up flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="wr-section-label">Who&apos;s coming</span>
          <h2 className="font-heading text-lg font-semibold text-off-white md:text-xl">
            {going.length} of {totalMembers} confirmed
          </h2>
          <p className="wr-hint">
            {totalGuests > 0
              ? `${headcount} people total — including ${totalGuests} guest${
                  totalGuests === 1 ? "" : "s"
                }.`
              : totalMembers === 0
                ? "No members yet."
                : "RSVP to show up on the list below."}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-2xl font-semibold text-winter-green tabular-nums">
            {percentIn}%
          </p>
          <p className="text-[11px] tracking-wide text-warm-gray uppercase">
            in
          </p>
        </div>
      </div>

      <div className="wr-progress" aria-hidden>
        <span
          style={{
            width: `${percentIn}%`,
            backgroundColor: "var(--color-winter-green)",
          }}
        />
      </div>

      {going.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex -space-x-3">
            {stackRows.map(({ profile }) => (
              <Avatar key={profile.id} name={profile.name} size="sm" />
            ))}
            {overflow > 0 ? (
              <span className="wr-avatar size-8 bg-surface-raised text-xs text-off-white/80">
                +{overflow}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-off-white/70">
            {buildCaption(going, currentUserId)}
          </p>
        </div>
      ) : (
        <p className="wr-hint">No one has RSVP&apos;d yet — be the first.</p>
      )}

      <div className="grid grid-cols-3 gap-2 border-t border-warm-gray/20 pt-4 text-center">
        <StatBlock label="Going" value={going.length} tone="green" />
        <StatBlock label="Not going" value={notGoing.length} tone="muted" />
        <StatBlock label="Awaiting" value={awaiting.length} tone="ice" />
      </div>

      <details className="group -mx-1">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 px-1 text-sm font-medium text-ice transition-colors hover:text-off-white [&::-webkit-details-marker]:hidden">
          <span>See everyone&apos;s status</span>
          <span
            className="text-xs transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </summary>
        <div className="mt-3 flex flex-col gap-4 px-1">
          <RosterGroup
            title="Going"
            tone="green"
            rows={going}
            currentUserId={currentUserId}
          />
          <RosterGroup
            title="Not going"
            tone="muted"
            rows={notGoing}
            currentUserId={currentUserId}
          />
          <RosterGroup
            title="Awaiting response"
            tone="ice"
            rows={awaiting}
            currentUserId={currentUserId}
          />
        </div>
      </details>
    </section>
  );
}

function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`font-heading text-xl font-semibold tabular-nums ${TONE_TEXT[tone]}`}
      >
        {value}
      </span>
      <span className="text-[11px] tracking-wide text-warm-gray uppercase">
        {label}
      </span>
    </div>
  );
}

function RosterGroup({
  title,
  tone,
  rows,
  currentUserId,
}: {
  title: string;
  tone: Tone;
  rows: AttendanceRow[];
  currentUserId?: string | null;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${TONE_DOT[tone]}`} aria-hidden />
        <span className="text-xs font-semibold tracking-wide text-warm-gray uppercase">
          {title} · {rows.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {rows.map(({ profile, registration }) => (
          <li key={profile.id} className="flex items-center gap-3">
            <Avatar name={profile.name} size="xs" />
            <span className="flex-1 truncate text-sm text-off-white">
              {profile.name}
              {profile.id === currentUserId ? (
                <span className="ml-1.5 text-xs text-warm-gray">(you)</span>
              ) : null}
            </span>
            {registration?.attending && registration.guests_count > 0 ? (
              <span className="text-xs text-warm-gray">
                +{registration.guests_count}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
