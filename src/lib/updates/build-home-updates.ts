import type {
  Activity,
  Announcement,
  Cabin,
  Payment,
  Poll,
  Registration,
} from "@/types/database";

export interface HomeUpdateItem {
  id: string;
  scope: "personal" | "group";
  headline: string;
  detail: string;
  /** Internal path, external URL, or null when the card is informational only. */
  href: string | null;
  cta: string;
}

interface BuildHomeUpdatesInput {
  registration: Registration | null;
  payments: Payment[];
  announcements: Announcement[];
  polls: Poll[];
  cabins: Cabin[];
  activities: Activity[];
}

/**
 * Builds a short, scannable "what's new" list split into personal (only this
 * member) vs group (everyone). Keeps copy action-oriented so people know the
 * next click without reading a long feed.
 */
export function buildHomeUpdates({
  registration,
  payments,
  announcements,
  polls,
  cabins,
  activities,
}: BuildHomeUpdatesInput): {
  personal: HomeUpdateItem[];
  group: HomeUpdateItem[];
} {
  const personal: HomeUpdateItem[] = [];
  const group: HomeUpdateItem[] = [];

  if (!registration) {
    personal.push({
      id: "rsvp-missing",
      scope: "personal",
      headline: "Your RSVP is still open",
      detail: "Takes under a minute. Yes or no is enough to get started.",
      href: "/rsvp",
      cta: "RSVP now",
    });
  }

  const outstanding = payments.filter(
    (payment) => payment.status === "unpaid" || payment.status === "pending"
  );
  const outstandingTotal = outstanding.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  if (outstanding.length > 0) {
    personal.push({
      id: "payments-outstanding",
      scope: "personal",
      headline:
        outstanding.length === 1
          ? `You owe $${outstandingTotal.toLocaleString()}`
          : `You have ${outstanding.length} open charges ($${outstandingTotal.toLocaleString()})`,
      detail:
        outstanding.length === 1
          ? outstanding[0].description
          : "Only you see your balance. Open Payments for the breakdown.",
      href: "/payments",
      cta: "View my payments",
    });
  }

  for (const announcement of announcements.slice(0, 3)) {
    group.push({
      id: `announcement-${announcement.id}`,
      scope: "group",
      headline: announcement.title,
      detail: announcement.link_url
        ? `${trimDetail(announcement.body)} · Includes a link`
        : trimDetail(announcement.body),
      href: announcement.link_url,
      cta: announcement.link_url ? "Open link" : "Posted for the group",
    });
  }

  const openPolls = polls.filter((poll) => poll.status === "open");
  if (openPolls.length > 0) {
    group.push({
      id: "polls-open",
      scope: "group",
      headline:
        openPolls.length === 1
          ? `Poll open: ${openPolls[0].question}`
          : `${openPolls.length} polls need a vote`,
      detail: "Group decision — your vote counts once.",
      href: "/polls",
      cta: "Vote",
    });
  }

  const votingCabins = cabins.filter((cabin) => cabin.status === "voting");
  if (votingCabins.length > 0) {
    group.push({
      id: "cabins-voting",
      scope: "group",
      headline:
        votingCabins.length === 1
          ? `Cabin vote open: ${votingCabins[0].name}`
          : `${votingCabins.length} cabins are up for a vote`,
      detail: "Everyone helps pick where we stay.",
      href: "/cabins",
      cta: "Vote on cabins",
    });
  }

  const liveActivities = activities.filter(
    (activity) =>
      activity.status === "proposed" || activity.status === "confirmed"
  );
  if (liveActivities.length > 0) {
    group.push({
      id: "activities-live",
      scope: "group",
      headline:
        liveActivities.length === 1
          ? `Activity: ${liveActivities[0].name}`
          : `${liveActivities.length} activities to respond to`,
      detail: "Say yes / no / maybe so the group can plan.",
      href: "/activities",
      cta: "Respond",
    });
  }

  return { personal, group };
}

function trimDetail(text: string, max = 110) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}
