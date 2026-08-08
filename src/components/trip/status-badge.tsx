import type { TripStageStatus } from "@/types/database";

const COMPLETE_STATUSES: TripStageStatus[] = [
  "Finalized",
  "Booked",
  "Completed",
];

interface StatusBadgeProps {
  status: TripStageStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isComplete = COMPLETE_STATUSES.includes(status);

  return (
    <span
      className={
        "inline-flex w-fit items-center border px-2.5 py-1 text-xs font-semibold tracking-wide " +
        (isComplete
          ? "border-winter-green/70 bg-winter-green/10 text-winter-green"
          : "border-warm-gray/40 bg-surface text-off-white/75")
      }
    >
      {status}
    </span>
  );
}
