import { format } from "date-fns";

import { StatusBadge } from "@/components/trip/status-badge";
import type { TripSettings } from "@/types/database";

interface TripOverviewProps {
  trip: TripSettings;
}

function formatDate(value: string | null) {
  if (!value) return null;
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

export function TripOverview({ trip }: TripOverviewProps) {
  const dateRange = [formatDate(trip.start_date), formatDate(trip.end_date)]
    .filter(Boolean)
    .join(" \u2013 ");

  const location = [trip.city_or_area, trip.state].filter(Boolean).join(", ");

  const statuses: { label: string; value: TripSettings["skiing_status"] }[] = [
    { label: "Skiing", value: trip.skiing_status },
    { label: "Cabin search", value: trip.cabin_search_status },
    { label: "Transportation", value: trip.transportation_status },
    { label: "Payment", value: trip.payment_status },
    { label: "Registration", value: trip.registration_status },
  ];

  const hasBudgetInfo =
    trip.guest_limit != null ||
    trip.estimated_budget_low != null ||
    trip.estimated_budget_high != null;

  const budgetLabel =
    trip.estimated_budget_low != null || trip.estimated_budget_high != null
      ? `Estimated budget: $${trip.estimated_budget_low ?? "?"}\u2013$${
          trip.estimated_budget_high ?? "?"
        }`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          {trip.trip_name || "Winter Reunion 2027"}
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          {[dateRange, location].filter(Boolean).join(" \u00b7 ") ||
            "Details coming soon."}
        </p>
      </div>

      {hasBudgetInfo ? (
        <div className="flex flex-col gap-1 border-t border-warm-gray/20 pt-4 text-sm text-off-white/80 md:flex-row md:gap-8">
          {trip.guest_limit != null ? (
            <span>Guest limit: {trip.guest_limit}</span>
          ) : null}
          {budgetLabel ? <span>{budgetLabel}</span> : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 border-t border-warm-gray/20 pt-4 sm:grid-cols-2 md:grid-cols-3">
        {statuses.map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <span className="text-xs font-normal tracking-wide text-off-white/50 uppercase">
              {item.label}
            </span>
            <StatusBadge status={item.value} />
          </div>
        ))}
      </div>
    </div>
  );
}
