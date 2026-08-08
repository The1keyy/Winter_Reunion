import { redirect } from "next/navigation";

import {
  deleteSuggestion,
  removeVoteForSuggestion,
  setSuggestionStatus,
  voteForSuggestion,
} from "@/app/(app)/suggestions/actions";
import { SuggestionForm } from "@/components/suggestions/suggestion-form";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import {
  getSuggestions,
  getSuggestionVotes,
} from "@/lib/supabase/suggestions";

export default async function SuggestionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, suggestions, votes] = await Promise.all([
    getProfile(supabase, user.id),
    getSuggestions(supabase),
    getSuggestionVotes(supabase),
  ]);

  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";

  const voteCountsBySuggestion = new Map<string, number>();
  const votedSuggestionIds = new Set<string>();
  for (const vote of votes) {
    voteCountsBySuggestion.set(
      vote.suggestion_id,
      (voteCountsBySuggestion.get(vote.suggestion_id) ?? 0) + 1
    );
    if (vote.profile_id === user.id) votedSuggestionIds.add(vote.suggestion_id);
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Suggestions
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          Propose ideas for the trip and upvote the ones you like.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-b border-warm-gray/20 pb-8">
        <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
          New suggestion
        </span>
        <SuggestionForm />
      </div>

      <div className="flex flex-col gap-4">
        {suggestions.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            No suggestions yet.
          </p>
        ) : (
          suggestions.map((suggestion) => {
            const voteCount = voteCountsBySuggestion.get(suggestion.id) ?? 0;
            const hasVoted = votedSuggestionIds.has(suggestion.id);
            const canManage = isAdmin || suggestion.created_by === user.id;

            return (
              <div
                key={suggestion.id}
                className="flex flex-col gap-3 border border-warm-gray/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-normal text-off-white">
                        {suggestion.title}
                      </h2>
                      <span className="border border-warm-gray/50 px-1.5 py-0.5 text-xs text-off-white/70">
                        {suggestion.category}
                      </span>
                      <span
                        className={
                          "border px-1.5 py-0.5 text-xs " +
                          (suggestion.status === "accepted"
                            ? "border-winter-green text-winter-green"
                            : suggestion.status === "rejected"
                              ? "border-warm-gray/50 text-off-white/40"
                              : "border-warm-gray/50 text-off-white/70")
                        }
                      >
                        {suggestion.status}
                      </span>
                    </div>
                    {suggestion.description ? (
                      <p className="text-sm font-normal whitespace-pre-wrap text-off-white/70">
                        {suggestion.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-normal text-off-white/80">
                      {voteCount} {voteCount === 1 ? "vote" : "votes"}
                    </span>
                    <form
                      action={
                        hasVoted
                          ? removeVoteForSuggestion.bind(null, suggestion.id)
                          : voteForSuggestion.bind(null, suggestion.id)
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
                  </div>
                </div>

                {canManage ? (
                  <div className="flex flex-wrap gap-4 border-t border-warm-gray/20 pt-3">
                    {isAdmin && suggestion.status !== "accepted" ? (
                      <form
                        action={setSuggestionStatus.bind(
                          null,
                          suggestion.id,
                          "accepted"
                        )}
                      >
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Accept
                        </button>
                      </form>
                    ) : null}
                    {isAdmin && suggestion.status !== "rejected" ? (
                      <form
                        action={setSuggestionStatus.bind(
                          null,
                          suggestion.id,
                          "rejected"
                        )}
                      >
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Reject
                        </button>
                      </form>
                    ) : null}
                    {isAdmin && suggestion.status !== "open" ? (
                      <form
                        action={setSuggestionStatus.bind(
                          null,
                          suggestion.id,
                          "open"
                        )}
                      >
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Reopen
                        </button>
                      </form>
                    ) : null}
                    <form action={deleteSuggestion.bind(null, suggestion.id)}>
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
