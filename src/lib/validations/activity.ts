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

const optionalUrl = z
  .string()
  .transform(emptyToNull)
  .refine(
    (value) => {
      if (value === null) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { error: "Use a full link like https://..." }
  );

/** Anything goes — just need a name and/or a link. */
export const activityCardSchema = z
  .object({
    name: z.string().transform((value) => value.trim()),
    linkUrl: optionalUrl,
    costPerPerson: optionalAmount,
    description: optionalText,
    category: optionalText,
  })
  .refine((data) => data.name.length > 0 || data.linkUrl != null, {
    error: "Add a name, a link, or both — whatever you’ve got.",
    path: ["name"],
  });

export const activitySchema = z.object({
  name: z.string().trim().min(1, { error: "Enter an activity name." }),
  description: optionalText,
  category: optionalText,
  activityDate: optionalDate,
  startTime: optionalTime,
  endTime: optionalTime,
  location: optionalText,
  costPerPerson: optionalAmount,
  linkUrl: optionalUrl,
});

export type ActivityCardInput = z.infer<typeof activityCardSchema>;
export type ActivityFormInput = z.infer<typeof activitySchema>;
