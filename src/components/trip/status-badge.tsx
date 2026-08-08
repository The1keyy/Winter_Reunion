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
        "inline-flex w-fit items-center border px-2 py-0.5 text-xs font-normal " +
        (isComplete
          ? "border-winter-green text-winter-green"
          : "border-warm-gray/50 text-off-white/70")
      }
    >
      {status}
    </span>
  );
}
