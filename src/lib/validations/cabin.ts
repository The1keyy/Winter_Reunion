import { z } from "zod";

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const optionalText = z.string().transform(emptyToNull);

const optionalUrl = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || /^https?:\/\//i.test(value), {
    error: "Enter a URL starting with http:// or https://.",
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
    error: "Enter a valid number.",
  })
  .transform((value) => (value === null ? null : Number(value)));

export const cabinSchema = z.object({
  name: z.string().trim().min(1, { error: "Enter a cabin name." }),
  url: optionalUrl,
  location: optionalText,
  priceTotal: optionalAmount,
  pricePerPerson: optionalAmount,
  bedrooms: optionalInteger,
  bathrooms: optionalAmount,
  maxOccupancy: optionalInteger,
  notes: optionalText,
});

export type CabinFormInput = z.infer<typeof cabinSchema>;
