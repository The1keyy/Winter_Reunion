import { format } from "date-fns";
import { redirect } from "next/navigation";

import {
  cancelActivity,
  confirmActivity,
  deleteActivity,
  reopenActivity,
  respondToActivity,
} from "@/app/(app)/activities/actions";
import { ActivityForm } from "@/components/admin/activity-form";
import {
  getActivities,
  getActivityResponses,
} from "@/lib/supabase/activities";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import type { ActivityResponseValue } from "@/types/database";

const RESPONSE_OPTIONS: { value: ActivityResponseValue; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
];

function formatDate(value: string | null) {
  if (!value) return null;
  try {
    return format(new Date(`${value}T00:00:00`), "EEE, MMM d");
  } catch {
    return value;
  }
}

function formatTime(value: string | null) {
  if (!value) return null;
  try {
    return format(new Date(`2000-01-01T${value}`), "h:mm a");
  } catch {
    return value;
  }
}

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, activities, responses] = await Promise.all([
    getProfile(supabase, user.id),
    getActivities(supabase),
    getActivityResponses(supabase),
  ]);

  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";

  const responsesByActivity = new Map<
    string,
    { yes: number; maybe: number; no: number }
  >();
  const myResponses = new Map<string, ActivityResponseValue>();
  for (const response of responses) {
    const counts = responsesByActivity.get(response.activity_id) ?? {
      yes: 0,
      maybe: 0,
      no: 0,
    };
    if (response.response === "yes") counts.yes += 1;
    if (response.response === "maybe") counts.maybe += 1;
    if (response.response === "no") counts.no += 1;
    responsesByActivity.set(response.activity_id, counts);

    if (response.profile_id === user.id) {
      myResponses.set(response.activity_id, response.response);
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Activities
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          {isAdmin
            ? "Propose activities and track who's in."
            : "Let us know if you're in for each activity."}
        </p>
      </div>

      {isAdmin ? (
        <div className="flex flex-col gap-4 border-b border-warm-gray/20 pb-8">
          <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
            Propose an activity
          </span>
          <ActivityForm />
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {activities.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            No activities proposed yet.
          </p>
        ) : (
          activities.map((activity) => {
            const counts = responsesByActivity.get(activity.id) ?? {
              yes: 0,
              maybe: 0,
              no: 0,
            };
            const myResponse = myResponses.get(activity.id);
            const dateLabel = formatDate(activity.activity_date);
            const startLabel = formatTime(activity.start_time);
            const endLabel = formatTime(activity.end_time);
            const canRespond = activity.status !== "cancelled";

            return (
              <div
                key={activity.id}
                className="flex flex-col gap-3 border border-warm-gray/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-normal text-off-white">
                        {activity.name}
                      </h2>
                      {activity.category ? (
                        <span className="border border-warm-gray/50 px-1.5 py-0.5 text-xs text-off-white/70">
                          {activity.category}
                        </span>
                      ) : null}
                      <span
                        className={
                          "border px-1.5 py-0.5 text-xs " +
                          (activity.status === "confirmed"
                            ? "border-winter-green text-winter-green"
                            : activity.status === "cancelled"
                              ? "border-warm-gray/50 text-off-white/40"
                              : "border-warm-gray/50 text-off-white/70")
                        }
                      >
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-sm font-normal text-off-white/60">
                      {[
                        dateLabel,
                        startLabel && endLabel
                          ? `${startLabel} - ${endLabel}`
                          : startLabel,
                        activity.location,
                      ]
                        .filter(Boolean)
                        .join(" \u00b7 ") || "Details coming soon."}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-sm font-normal text-off-white/80">
                    <span>
                      {counts.yes} in &middot; {counts.maybe} maybe &middot;{" "}
                      {counts.no} out
                    </span>
                    {activity.cost_per_person != null ? (
                      <span>${activity.cost_per_person} / person</span>
                    ) : null}
                  </div>
                </div>

                {activity.description ? (
                  <p className="text-sm font-normal whitespace-pre-wrap text-off-white/70">
                    {activity.description}
                  </p>
                ) : null}

                {canRespond ? (
                  <div className="flex flex-wrap gap-2">
                    {RESPONSE_OPTIONS.map((option) => {
                      const isSelected = myResponse === option.value;
                      return (
                        <form
                          key={option.value}
                          action={respondToActivity.bind(
                            null,
                            activity.id,
                            option.value
                          )}
                        >
                          <button
                            type="submit"
                            className={
                              "border px-3 py-1.5 text-sm font-normal transition-colors " +
                              (isSelected
                                ? "border-off-white bg-off-white text-charcoal"
                                : "border-warm-gray/40 text-off-white hover:border-off-white")
                            }
                          >
                            {option.label}
                          </button>
                        </form>
                      );
                    })}
                  </div>
                ) : null}

                {isAdmin ? (
                  <div className="flex flex-wrap gap-4 border-t border-warm-gray/20 pt-3">
                    {activity.status !== "confirmed" ? (
                      <form action={confirmActivity.bind(null, activity.id)}>
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Confirm
                        </button>
                      </form>
                    ) : null}
                    {activity.status !== "cancelled" ? (
                      <form action={cancelActivity.bind(null, activity.id)}>
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <form action={reopenActivity.bind(null, activity.id)}>
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Reopen
                        </button>
                      </form>
                    )}
                    <form action={deleteActivity.bind(null, activity.id)}>
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
