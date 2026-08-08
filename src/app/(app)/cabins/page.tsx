import { redirect } from "next/navigation";

import {
  deleteCabin,
  openCabinVoting,
  rejectCabin,
  removeVoteForCabin,
  selectCabin,
  voteForCabin,
} from "@/app/(app)/cabins/actions";
import { CabinForm } from "@/components/admin/cabin-form";
import { getCabins, getCabinVotes } from "@/lib/supabase/cabins";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(value: number | null) {
  if (value == null) return null;
  return `$${value.toLocaleString()}`;
}

export default async function CabinsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, cabins, votes] = await Promise.all([
    getProfile(supabase, user.id),
    getCabins(supabase),
    getCabinVotes(supabase),
  ]);

  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";

  const voteCountsByCabin = new Map<string, number>();
  const votedCabinIds = new Set<string>();
  for (const vote of votes) {
    voteCountsByCabin.set(
      vote.cabin_id,
      (voteCountsByCabin.get(vote.cabin_id) ?? 0) + 1
    );
    if (vote.profile_id === user.id) votedCabinIds.add(vote.cabin_id);
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Cabins
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          {isAdmin
            ? "Propose cabins, open voting, and mark one as selected."
            : "Vote for the cabins you'd like to stay in."}
        </p>
      </div>

      {isAdmin ? (
        <div className="flex flex-col gap-4 border-b border-warm-gray/20 pb-8">
          <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
            Propose a cabin
          </span>
          <CabinForm />
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {cabins.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            No cabins proposed yet.
          </p>
        ) : (
          cabins.map((cabin) => {
            const voteCount = voteCountsByCabin.get(cabin.id) ?? 0;
            const hasVoted = votedCabinIds.has(cabin.id);
            const canVote = cabin.status === "voting";

            return (
              <div
                key={cabin.id}
                className="flex flex-col gap-3 border border-warm-gray/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-normal text-off-white">
                        {cabin.url ? (
                          <a
                            href={cabin.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-4 hover:text-off-white/80"
                          >
                            {cabin.name}
                          </a>
                        ) : (
                          cabin.name
                        )}
                      </h2>
                      <span
                        className={
                          "border px-1.5 py-0.5 text-xs " +
                          (cabin.status === "selected"
                            ? "border-winter-green text-winter-green"
                            : "border-warm-gray/50 text-off-white/70")
                        }
                      >
                        {cabin.status}
                      </span>
                    </div>
                    {cabin.location ? (
                      <p className="text-sm font-normal text-off-white/60">
                        {cabin.location}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-normal text-off-white/80">
                      {voteCount} {voteCount === 1 ? "vote" : "votes"}
                    </span>
                    {canVote ? (
                      <form
                        action={
                          hasVoted
                            ? removeVoteForCabin.bind(null, cabin.id)
                            : voteForCabin.bind(null, cabin.id)
                        }
                      >
                        <button
                          type="submit"
                          className={
                            "border px-3 py-1.5 text-sm font-normal transition-colors " +
                            (hasVoted
                              ? "border-off-white bg-off-white text-charcoal"
                              : "border-warm-gray/40 text-off-white hover:border-off-white")
                          }
                        >
                          {hasVoted ? "Voted" : "Vote"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-normal text-off-white/70">
                  {cabin.price_total != null ? (
                    <span>Total: {formatCurrency(cabin.price_total)}</span>
                  ) : null}
                  {cabin.price_per_person != null ? (
                    <span>
                      Per person: {formatCurrency(cabin.price_per_person)}
                    </span>
                  ) : null}
                  {cabin.bedrooms != null ? (
                    <span>{cabin.bedrooms} bed</span>
                  ) : null}
                  {cabin.bathrooms != null ? (
                    <span>{cabin.bathrooms} bath</span>
                  ) : null}
                  {cabin.max_occupancy != null ? (
                    <span>Sleeps {cabin.max_occupancy}</span>
                  ) : null}
                </div>

                {cabin.notes ? (
                  <p className="text-sm font-normal whitespace-pre-wrap text-off-white/70">
                    {cabin.notes}
                  </p>
                ) : null}

                {isAdmin ? (
                  <div className="flex flex-wrap gap-4 border-t border-warm-gray/20 pt-3">
                    {cabin.status === "proposed" ? (
                      <form action={openCabinVoting.bind(null, cabin.id)}>
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Open voting
                        </button>
                      </form>
                    ) : null}
                    {cabin.status !== "selected" ? (
                      <form action={selectCabin.bind(null, cabin.id)}>
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Mark selected
                        </button>
                      </form>
                    ) : null}
                    {cabin.status !== "rejected" &&
                    cabin.status !== "selected" ? (
                      <form action={rejectCabin.bind(null, cabin.id)}>
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Reject
                        </button>
                      </form>
                    ) : null}
                    <form action={deleteCabin.bind(null, cabin.id)}>
                      <button
                        type="submit"
                        className="text-sm font-normal text-off-white/50 hover:text-off-white"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
