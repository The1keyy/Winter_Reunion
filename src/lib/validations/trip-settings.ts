import { z } from "zod";

export const TRIP_STAGE_STATUSES = [
  "Not Started",
  "Planning",
  "Voting Open",
  "Waiting",
  "Finalized",
  "Booked",
  "Completed",
] as const;

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const optionalText = z.string().transform(emptyToNull);

const optionalDate = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || !Number.isNaN(Date.parse(value)), {
    error: "Enter a valid date.",
  });

const optionalInteger = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || Number.isInteger(Number(value)), {
    error: "Enter a whole number.",
  })
  .transform((value) => (value === null ? null : Number(value)));

const optionalAmount = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || !Number.isNaN(Number(value)), {
    error: "Enter a valid amount.",
  })
  .transform((value) => (value === null ? null : Number(value)));

const tripStageStatus = z.enum(TRIP_STAGE_STATUSES, {
  error: "Choose a valid status.",
});

export const tripSettingsSchema = z.object({
  tripName: z.string().trim().min(1, { error: "Enter a trip name." }),
  startDate: optionalDate,
  endDate: optionalDate,
  state: optionalText,
  cityOrArea: optionalText,
  guestLimit: optionalInteger,
  estimatedBudgetLow: optionalAmount,
  estimatedBudgetHigh: optionalAmount,
  skiingStatus: tripStageStatus,
  cabinSearchStatus: tripStageStatus,
  transportationStatus: tripStageStatus,
  paymentStatus: tripStageStatus,
  registrationStatus: tripStageStatus,
});

export type TripSettingsFormInput = z.infer<typeof tripSettingsSchema>;
