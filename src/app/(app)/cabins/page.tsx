import { redirect } from "next/navigation";

import { CabinCard } from "@/components/cabins/cabin-card";
import { CabinForm } from "@/components/cabins/cabin-form";
import {
  getCabins,
  getCabinVotes,
  type CabinVoteResponse,
} from "@/lib/supabase/cabins";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

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

  const responsesByCabin = new Map<string, { yes: number; no: number }>();
  const myResponses = new Map<string, CabinVoteResponse>();

  for (const vote of votes) {
    const counts = responsesByCabin.get(vote.cabin_id) ?? { yes: 0, no: 0 };
    if (vote.response === "yes") counts.yes += 1;
    if (vote.response === "no") counts.no += 1;
    responsesByCabin.set(vote.cabin_id, counts);

    if (vote.profile_id === user.id) {
      myResponses.set(vote.cabin_id, vote.response);
    }
  }

  const openCards = cabins
    .filter((cabin) => cabin.status === "proposed" || cabin.status === "voting")
    .sort((a, b) => {
      const aMine = myResponses.has(a.id) ? 1 : 0;
      const bMine = myResponses.has(b.id) ? 1 : 0;
      if (aMine !== bMine) return aMine - bMine;
      const aYes = responsesByCabin.get(a.id)?.yes ?? 0;
      const bYes = responsesByCabin.get(b.id)?.yes ?? 0;
      return bYes - aYes;
    });
  const closedCards = cabins.filter(
    (cabin) => cabin.status === "selected" || cabin.status === "rejected"
  );
  const pendingForYou = openCards.filter((c) => !myResponses.has(c.id)).length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="wr-fade-up flex flex-col gap-1">
        <span className="wr-section-label">Where we stay</span>
        <h1 className="font-heading text-2xl font-semibold text-off-white md:text-3xl">
          Cabins
        </h1>
        <p className="text-sm text-off-white/70">
          {pendingForYou > 0
            ? `${pendingForYou} waiting on your vote. Tap I'm in or Out.`
            : openCards.length > 0
              ? "You're caught up. Browse stays or add a listing."
              : "Nothing up yet — post the first cabin."}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <span className="wr-section-label">Up for a vote</span>
          <span className="text-xs font-semibold text-ember tabular-nums">
            {openCards.length}
          </span>
        </div>

        {openCards.length === 0 ? (
          <p className="wr-hint">No open stays. Use + below to add one.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {openCards.map((cabin) => {
              const counts = responsesByCabin.get(cabin.id) ?? {
                yes: 0,
                no: 0,
              };
              return (
                <CabinCard
                  key={cabin.id}
                  cabin={cabin}
                  yesCount={counts.yes}
                  noCount={counts.no}
                  myResponse={myResponses.get(cabin.id)}
                  isAdmin={isAdmin}
                />
              );
            })}
          </div>
        )}
      </section>

      <CabinForm />

      {closedCards.length > 0 ? (
        <section className="flex flex-col gap-3 border-t border-warm-gray/20 pt-5">
          <span className="wr-section-label">Settled</span>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {closedCards.map((cabin) => {
              const counts = responsesByCabin.get(cabin.id) ?? {
                yes: 0,
                no: 0,
              };
              return (
                <CabinCard
                  key={cabin.id}
                  cabin={cabin}
                  yesCount={counts.yes}
                  noCount={counts.no}
                  myResponse={myResponses.get(cabin.id)}
                  isAdmin={isAdmin}
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
