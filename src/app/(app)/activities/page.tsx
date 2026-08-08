import { redirect } from "next/navigation";

import { ActivityCard } from "@/components/activities/activity-card";
import { ActivityForm } from "@/components/activities/activity-form";
import {
  getActivities,
  getActivityResponses,
} from "@/lib/supabase/activities";
import { getAllProfiles, getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import type { ActivityResponseValue } from "@/types/database";

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, activities, responses, profiles] = await Promise.all([
    getProfile(supabase, user.id),
    getActivities(supabase),
    getActivityResponses(supabase),
    getAllProfiles(supabase),
  ]);

  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";
  const nameById = new Map(profiles.map((p) => [p.id, p.name]));

  const responsesByActivity = new Map<string, { yes: number; no: number }>();
  const myResponses = new Map<string, ActivityResponseValue>();
  for (const response of responses) {
    if (response.response !== "yes" && response.response !== "no") continue;

    const counts = responsesByActivity.get(response.activity_id) ?? {
      yes: 0,
      no: 0,
    };
    if (response.response === "yes") counts.yes += 1;
    if (response.response === "no") counts.no += 1;
    responsesByActivity.set(response.activity_id, counts);

    if (response.profile_id === user.id) {
      myResponses.set(response.activity_id, response.response);
    }
  }

  const openCards = activities
    .filter((a) => a.status !== "cancelled")
    .sort((a, b) => {
      const aMine = myResponses.has(a.id) ? 1 : 0;
      const bMine = myResponses.has(b.id) ? 1 : 0;
      if (aMine !== bMine) return aMine - bMine;
      const aYes = responsesByActivity.get(a.id)?.yes ?? 0;
      const bYes = responsesByActivity.get(b.id)?.yes ?? 0;
      return bYes - aYes;
    });
  const closedCards = activities.filter((a) => a.status === "cancelled");
  const pendingForYou = openCards.filter((a) => !myResponses.has(a.id)).length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="wr-fade-up flex flex-col gap-1">
        <span className="wr-section-label">Crew picks</span>
        <h1 className="font-heading text-2xl font-semibold text-off-white md:text-3xl">
          Activities
        </h1>
        <p className="text-sm text-off-white/70">
          {pendingForYou > 0
            ? `${pendingForYou} waiting on your vote. Tap I'm in or Out.`
            : openCards.length > 0
              ? "You're caught up. Browse the board or add a pick."
              : "Nothing up yet — be the first to post one."}
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
          <p className="wr-hint">No open picks. Use + below to add one.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {openCards.map((activity) => {
              const counts = responsesByActivity.get(activity.id) ?? {
                yes: 0,
                no: 0,
              };
              return (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  yesCount={counts.yes}
                  noCount={counts.no}
                  myResponse={myResponses.get(activity.id)}
                  isAdmin={isAdmin}
                  authorName={
                    activity.created_by
                      ? nameById.get(activity.created_by)
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      <ActivityForm />

      {closedCards.length > 0 ? (
        <section className="flex flex-col gap-3 border-t border-warm-gray/20 pt-5">
          <span className="wr-section-label">Closed</span>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {closedCards.map((activity) => {
              const counts = responsesByActivity.get(activity.id) ?? {
                yes: 0,
                no: 0,
              };
              return (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  yesCount={counts.yes}
                  noCount={counts.no}
                  myResponse={myResponses.get(activity.id)}
                  isAdmin={isAdmin}
                  authorName={
                    activity.created_by
                      ? nameById.get(activity.created_by)
                      : undefined
                  }
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
