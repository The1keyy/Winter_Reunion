import { z } from "zod";

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const optionalText = z.string().transform(emptyToNull);

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
    error: "Enter a valid number.",
  })
  .transform((value) => (value === null ? null : Number(value)));

/** Anything goes — just need a name and/or a link. */
export const cabinCardSchema = z
  .object({
    name: z.string().transform((value) => value.trim()),
    url: optionalUrl,
    pricePerPerson: optionalAmount,
    priceTotal: optionalAmount,
    notes: optionalText,
    location: optionalText,
    bedrooms: optionalInteger,
    bathrooms: optionalAmount,
    maxOccupancy: optionalInteger,
  })
  .refine((data) => data.name.length > 0 || data.url != null, {
    error: "Add a name, a link, or both — whatever you’ve got.",
    path: ["name"],
  });

export const cabinSchema = cabinCardSchema;

export type CabinFormInput = z.infer<typeof cabinCardSchema>;
