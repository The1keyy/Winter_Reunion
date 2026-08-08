import { z } from "zod";

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

const optionalTime = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || /^\d{2}:\d{2}(:\d{2})?$/.test(value), {
    error: "Enter a valid time.",
  });

const optionalAmount = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || !Number.isNaN(Number(value)), {
    error: "Enter a valid amount.",
  })
  .transform((value) => (value === null ? null : Number(value)));

export const activitySchema = z.object({
  name: z.string().trim().min(1, { error: "Enter an activity name." }),
  description: optionalText,
  category: optionalText,
  activityDate: optionalDate,
  startTime: optionalTime,
  endTime: optionalTime,
  location: optionalText,
  costPerPerson: optionalAmount,
});

export type ActivityFormInput = z.infer<typeof activitySchema>;
