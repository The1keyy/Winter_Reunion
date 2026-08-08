"use client";

import { useFormStatus } from "react-dom";

function VoteSubmit({
  label,
  selected,
  tone,
}: {
  label: string;
  selected: boolean;
  tone: "yes" | "no";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        "w-full min-h-12 border text-sm font-semibold transition-[background-color,border-color,transform,opacity] duration-150 active:scale-[0.97] disabled:opacity-60 " +
        (tone === "yes"
          ? selected
            ? "border-winter-green bg-winter-green text-off-white shadow-[0_0_24px_color-mix(in_oklab,var(--color-winter-green)_35%,transparent)]"
            : "border-warm-gray/45 text-off-white hover:border-winter-green hover:bg-winter-green/15"
          : selected
            ? "border-warm-gray bg-surface-raised text-off-white"
            : "border-warm-gray/45 text-off-white hover:border-off-white/55 hover:bg-surface-raised/80")
      }
    >
      {pending ? "..." : label}
    </button>
  );
}

interface VoteButtonsProps {
  yesAction: (formData: FormData) => void | Promise<void>;
  noAction: (formData: FormData) => void | Promise<void>;
  retractAction?: (formData: FormData) => void | Promise<void>;
  votedYes: boolean;
  votedNo: boolean;
}

export function VoteButtons({
  yesAction,
  noAction,
  retractAction,
  votedYes,
  votedNo,
}: VoteButtonsProps) {
  const hasVote = votedYes || votedNo;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <form action={yesAction}>
          <VoteSubmit label="I'm in" selected={votedYes} tone="yes" />
        </form>
        <form action={noAction}>
          <VoteSubmit label="Out" selected={votedNo} tone="no" />
        </form>
      </div>
      {hasVote && retractAction ? (
        <form action={retractAction}>
          <RetractButton />
        </form>
      ) : (
        <p className="text-center text-[11px] text-warm-gray">
          Tap one — change it anytime
        </p>
      )}
    </div>
  );
}

function RetractButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full text-center text-xs font-medium text-warm-gray underline-offset-4 transition-colors hover:text-off-white hover:underline disabled:opacity-60"
    >
      {pending ? "Updating..." : "Change my mind"}
    </button>
  );
}
