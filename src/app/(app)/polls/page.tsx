import { redirect } from "next/navigation";

import {
  clearMyPollVote,
  closePoll,
  deletePoll,
  reopenPoll,
  voteInPoll,
} from "@/app/(app)/polls/actions";
import { PollForm } from "@/components/admin/poll-form";
import { getProfile } from "@/lib/supabase/profiles";
import { getPollOptions, getPolls, getPollVotes } from "@/lib/supabase/polls";
import { createClient } from "@/lib/supabase/server";

export default async function PollsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, polls, options, votes] = await Promise.all([
    getProfile(supabase, user.id),
    getPolls(supabase),
    getPollOptions(supabase),
    getPollVotes(supabase),
  ]);

  const isAdmin = profile?.role === "admin" || profile?.role === "co-admin";

  const optionsByPoll = new Map<string, typeof options>();
  for (const option of options) {
    const list = optionsByPoll.get(option.poll_id) ?? [];
    list.push(option);
    optionsByPoll.set(option.poll_id, list);
  }

  const voteCountsByOption = new Map<string, number>();
  const myVoteByPoll = new Map<string, string>();
  for (const vote of votes) {
    voteCountsByOption.set(
      vote.option_id,
      (voteCountsByOption.get(vote.option_id) ?? 0) + 1
    );
    if (vote.profile_id === user.id) {
      myVoteByPoll.set(vote.poll_id, vote.option_id);
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          Polls
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          {isAdmin
            ? "Create a poll and see how people vote."
            : "Cast your vote while a poll is open."}
        </p>
      </div>

      {isAdmin ? (
        <div className="flex flex-col gap-4 border-b border-warm-gray/20 pb-8">
          <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
            New poll
          </span>
          <PollForm />
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {polls.length === 0 ? (
          <p className="text-sm font-normal text-off-white/60">
            No polls yet.
          </p>
        ) : (
          polls.map((poll) => {
            const pollOptions = optionsByPoll.get(poll.id) ?? [];
            const totalVotes = pollOptions.reduce(
              (sum, option) => sum + (voteCountsByOption.get(option.id) ?? 0),
              0
            );
            const myVote = myVoteByPoll.get(poll.id);
            const canVote = poll.status === "open";

            return (
              <div
                key={poll.id}
                className="flex flex-col gap-3 border border-warm-gray/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-normal text-off-white">
                        {poll.question}
                      </h2>
                      <span
                        className={
                          "border px-1.5 py-0.5 text-xs " +
                          (poll.status === "open"
                            ? "border-winter-green text-winter-green"
                            : "border-warm-gray/50 text-off-white/40")
                        }
                      >
                        {poll.status}
                      </span>
                    </div>
                    {poll.description ? (
                      <p className="text-sm font-normal text-off-white/60">
                        {poll.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-sm font-normal text-off-white/60">
                    {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {pollOptions.map((option) => {
                    const count = voteCountsByOption.get(option.id) ?? 0;
                    const percent =
                      totalVotes > 0
                        ? Math.round((count / totalVotes) * 100)
                        : 0;
                    const isSelected = myVote === option.id;

                    return (
                      <form
                        key={option.id}
                        action={voteInPoll.bind(null, poll.id, option.id)}
                      >
                        <button
                          type="submit"
                          disabled={!canVote}
                          className={
                            "relative flex w-full items-center justify-between overflow-hidden border px-3 py-2 text-left text-sm font-normal transition-colors disabled:cursor-default " +
                            (isSelected
                              ? "border-off-white text-off-white"
                              : "border-warm-gray/40 text-off-white/80 hover:border-off-white/70")
                          }
                        >
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 bg-warm-gray/15"
                            style={{ width: `${percent}%` }}
                          />
                          <span className="relative">
                            {option.option_text}
                            {isSelected ? " \u2713" : ""}
                          </span>
                          <span className="relative text-off-white/60">
                            {count} &middot; {percent}%
                          </span>
                        </button>
                      </form>
                    );
                  })}
                </div>

                {myVote && canVote ? (
                  <form action={clearMyPollVote.bind(null, poll.id)}>
                    <button
                      type="submit"
                      className="w-fit text-sm font-normal text-off-white/50 hover:text-off-white"
                    >
                      Clear my vote
                    </button>
                  </form>
                ) : null}

                {isAdmin ? (
                  <div className="flex flex-wrap gap-4 border-t border-warm-gray/20 pt-3">
                    {poll.status === "open" ? (
                      <form action={closePoll.bind(null, poll.id)}>
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Close poll
                        </button>
                      </form>
                    ) : (
                      <form action={reopenPoll.bind(null, poll.id)}>
                        <button
                          type="submit"
                          className="text-sm font-normal text-off-white/70 underline underline-offset-4 hover:text-off-white"
                        >
                          Reopen poll
                        </button>
                      </form>
                    )}
                    <form action={deletePoll.bind(null, poll.id)}>
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
