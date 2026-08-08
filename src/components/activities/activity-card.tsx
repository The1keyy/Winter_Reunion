import {
  cancelActivity,
  confirmActivity,
  deleteActivity,
  reopenActivity,
  respondToActivity,
  retractActivityVote,
} from "@/app/(app)/activities/actions";
import { LinkPreviewCard } from "@/components/activities/link-preview-card";
import { VoteButtons } from "@/components/guidance/vote-buttons";
import { Avatar } from "@/components/ui/avatar";
import type { Activity, ActivityResponseValue } from "@/types/database";

interface ActivityCardProps {
  activity: Activity;
  yesCount: number;
  noCount: number;
  myResponse?: ActivityResponseValue;
  isAdmin: boolean;
  authorName?: string;
}

export function ActivityCard({
  activity,
  yesCount,
  noCount,
  myResponse,
  isAdmin,
  authorName,
}: ActivityCardProps) {
  const canVote = activity.status !== "cancelled";
  const votedYes = myResponse === "yes";
  const votedNo = myResponse === "no";
  const hasVote = votedYes || votedNo;
  const total = yesCount + noCount;
  const yesPct = total === 0 ? 0 : Math.round((yesCount / total) * 100);
  const needsYourVote = canVote && !hasVote;

  return (
    <article
      className={
        "wr-panel flex flex-col gap-4 transition-[border-color,box-shadow,transform] duration-200 " +
        (votedYes
          ? "border-winter-green/60 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-winter-green)_20%,transparent)]"
          : needsYourVote
            ? "border-ember/45 shadow-[0_8px_28px_color-mix(in_oklab,var(--color-ember)_12%,transparent)]"
            : votedNo
              ? "border-warm-gray/35 opacity-80"
              : "hover:-translate-y-0.5 hover:border-ice/45")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {needsYourVote ? (
            <p className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
              Your move
            </p>
          ) : votedYes ? (
            <p className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-winter-green uppercase">
              You&apos;re in
            </p>
          ) : null}
          <h2 className="font-heading text-xl font-semibold text-off-white">
            {activity.name}
          </h2>
          {authorName ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <Avatar name={authorName} size="xs" />
              <span className="text-xs text-warm-gray">
                added by <span className="text-off-white/70">{authorName}</span>
              </span>
            </div>
          ) : null}
        </div>
        {activity.cost_per_person != null ? (
          <p className="shrink-0 text-right font-heading text-2xl font-semibold text-ember tabular-nums">
            ${Number(activity.cost_per_person).toLocaleString()}
            <span className="mt-0.5 block text-[11px] font-medium tracking-wide text-warm-gray uppercase">
              / person
            </span>
          </p>
        ) : null}
      </div>

      {activity.link_url ? (
        <LinkPreviewCard
          url={activity.link_url}
          title={activity.link_title}
          description={activity.link_description}
          image={activity.link_image}
        />
      ) : null}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-off-white/85 tabular-nums">
            {yesCount} in · {noCount} out
          </span>
          <span className="text-warm-gray tabular-nums">
            {total === 0 ? "Open it up" : `${yesPct}% yes`}
          </span>
        </div>
        <div className="wr-progress" aria-hidden>
          <span style={{ width: `${total === 0 ? 8 : yesPct}%` }} />
        </div>
      </div>

      {canVote ? (
        <VoteButtons
          yesAction={respondToActivity.bind(null, activity.id, "yes")}
          noAction={respondToActivity.bind(null, activity.id, "no")}
          retractAction={retractActivityVote.bind(null, activity.id)}
          votedYes={votedYes}
          votedNo={votedNo}
        />
      ) : (
        <p className="text-sm text-warm-gray">Closed</p>
      )}

      {isAdmin ? (
        <div className="flex flex-wrap gap-3 border-t border-warm-gray/20 pt-3">
          {activity.status !== "confirmed" && activity.status !== "cancelled" ? (
            <form action={confirmActivity.bind(null, activity.id)}>
              <button type="submit" className="text-xs font-medium text-ice hover:underline">
                Confirm
              </button>
            </form>
          ) : null}
          {activity.status !== "cancelled" ? (
            <form action={cancelActivity.bind(null, activity.id)}>
              <button type="submit" className="text-xs font-medium text-warm-gray hover:underline">
                Close
              </button>
            </form>
          ) : (
            <form action={reopenActivity.bind(null, activity.id)}>
              <button type="submit" className="text-xs font-medium text-ice hover:underline">
                Reopen
              </button>
            </form>
          )}
          <form action={deleteActivity.bind(null, activity.id)}>
            <button type="submit" className="text-xs font-medium text-warm-gray hover:underline">
              Delete
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
