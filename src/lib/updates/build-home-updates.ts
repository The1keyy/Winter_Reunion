import type {
  Activity,
  Announcement,
  Cabin,
  Payment,
  Poll,
  Registration,
  TalkPost,
} from "@/types/database";

export interface HomeUpdateItem {
  id: string;
  scope: "personal" | "group";
  headline: string;
  detail: string;
  /** Internal path, external URL, or null when informational only. */
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
  talkPosts: TalkPost[];
}

/**
 * Builds compact notification chips: personal (this member only) vs group.
 */
export function buildHomeUpdates({
  registration,
  payments,
  announcements,
  polls,
  cabins,
  activities,
  talkPosts,
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
      headline: "RSVP still open",
      detail: "Takes under a minute.",
      href: "/rsvp",
      cta: "Go",
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
          : `${outstanding.length} charges · $${outstandingTotal.toLocaleString()}`,
      detail:
        outstanding.length === 1
          ? outstanding[0].description
          : "Only you see your balance.",
      href: "/payments",
      cta: "Pay",
    });
  }

  for (const announcement of announcements.slice(0, 3)) {
    group.push({
      id: `announcement-${announcement.id}`,
      scope: "group",
      headline: announcement.title,
      detail: trimDetail(announcement.body),
      href: announcement.link_url,
      cta: announcement.link_url ? "Link" : "",
    });
  }

  const openPolls = polls.filter((poll) => poll.status === "open");
  if (openPolls.length > 0) {
    group.push({
      id: "polls-open",
      scope: "group",
      headline:
        openPolls.length === 1
          ? `Poll: ${openPolls[0].question}`
          : `${openPolls.length} open polls`,
      detail: "Your vote counts once.",
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
          ? `Cabin vote: ${votingCabins[0].name}`
          : `${votingCabins.length} cabin votes`,
      detail: "Help pick where we stay.",
      href: "/cabins",
      cta: "Vote",
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
          : `${liveActivities.length} activities`,
      detail: "Yes / no / maybe.",
      href: "/activities",
      cta: "Go",
    });
  }

  if (talkPosts.length > 0) {
    group.push({
      id: "talk-recent",
      scope: "group",
      headline:
        talkPosts.length === 1
          ? `Talk: ${talkPosts[0].title}`
          : `${talkPosts.length} new Talk threads`,
      detail: "Important stuff outside the usual forms.",
      href: "/talk",
      cta: "Open",
    });
  }

  return { personal, group };
}

function trimDetail(text: string, max = 90) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}
