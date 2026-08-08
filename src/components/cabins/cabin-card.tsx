import {
  deleteCabin,
  rejectCabin,
  respondToCabin,
  retractCabinVote,
  selectCabin,
} from "@/app/(app)/cabins/actions";
import { LinkPreviewCard } from "@/components/activities/link-preview-card";
import { VoteButtons } from "@/components/guidance/vote-buttons";
import { Avatar } from "@/components/ui/avatar";
import type { CabinVoteResponse } from "@/lib/supabase/cabins";
import type { Cabin } from "@/types/database";

interface CabinCardProps {
  cabin: Cabin;
  yesCount: number;
  noCount: number;
  myResponse?: CabinVoteResponse;
  isAdmin: boolean;
  authorName?: string;
}

function priceLabel(cabin: Cabin) {
  if (cabin.price_per_person != null) {
    return { amount: Number(cabin.price_per_person), unit: "/ night" };
  }
  if (cabin.price_total != null) {
    return { amount: Number(cabin.price_total), unit: "total" };
  }
  return null;
}

export function CabinCard({
  cabin,
  yesCount,
  noCount,
  myResponse,
  isAdmin,
  authorName,
}: CabinCardProps) {
  const canVote = cabin.status === "proposed" || cabin.status === "voting";
  const votedYes = myResponse === "yes";
  const votedNo = myResponse === "no";
  const hasVote = votedYes || votedNo;
  const total = yesCount + noCount;
  const yesPct = total === 0 ? 0 : Math.round((yesCount / total) * 100);
  const needsYourVote = canVote && !hasVote;
  const price = priceLabel(cabin);

  return (
    <article
      className={
        "wr-panel flex flex-col gap-4 transition-[border-color,box-shadow,transform] duration-200 " +
        (cabin.status === "selected"
          ? "border-winter-green/65 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-winter-green)_25%,transparent)]"
          : votedYes
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
          {cabin.status === "selected" ? (
            <p className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-winter-green uppercase">
              Locked in
            </p>
          ) : needsYourVote ? (
            <p className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
              Your move
            </p>
          ) : votedYes ? (
            <p className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-winter-green uppercase">
              You&apos;re in
            </p>
          ) : null}
          <h2 className="font-heading text-xl font-semibold text-off-white">
            {cabin.name}
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
        {price ? (
          <p className="shrink-0 text-right font-heading text-2xl font-semibold text-ember tabular-nums">
            ${price.amount.toLocaleString()}
            <span className="mt-0.5 block text-[11px] font-medium tracking-wide text-warm-gray uppercase">
              {price.unit}
            </span>
          </p>
        ) : null}
      </div>

      {cabin.url ? (
        <LinkPreviewCard
          url={cabin.url}
          title={cabin.link_title}
          description={cabin.link_description}
          image={cabin.link_image}
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
          yesAction={respondToCabin.bind(null, cabin.id, "yes")}
          noAction={respondToCabin.bind(null, cabin.id, "no")}
          retractAction={retractCabinVote.bind(null, cabin.id)}
          votedYes={votedYes}
          votedNo={votedNo}
        />
      ) : cabin.status === "rejected" ? (
        <p className="text-sm text-warm-gray">Passed on</p>
      ) : null}

      {isAdmin && canVote ? (
        <div className="flex flex-wrap gap-3 border-t border-warm-gray/20 pt-3">
          <form action={selectCabin.bind(null, cabin.id)}>
            <button type="submit" className="text-xs font-medium text-ice hover:underline">
              Pick this one
            </button>
          </form>
          <form action={rejectCabin.bind(null, cabin.id)}>
            <button type="submit" className="text-xs font-medium text-warm-gray hover:underline">
              Pass
            </button>
          </form>
          <form action={deleteCabin.bind(null, cabin.id)}>
            <button type="submit" className="text-xs font-medium text-warm-gray hover:underline">
              Delete
            </button>
          </form>
        </div>
      ) : null}

      {isAdmin && !canVote ? (
        <div className="flex flex-wrap gap-3 border-t border-warm-gray/20 pt-3">
          <form action={deleteCabin.bind(null, cabin.id)}>
            <button type="submit" className="text-xs font-medium text-warm-gray hover:underline">
              Delete
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
