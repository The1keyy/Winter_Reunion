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

export const paymentSchema = z.object({
  profileId: z.string().trim().min(1, { error: "Choose a member." }),
  description: z.string().trim().min(1, { error: "Enter a description." }),
  category: optionalText,
  amount: z
    .string()
    .trim()
    .refine(
      (value) =>
        value !== "" && !Number.isNaN(Number(value)) && Number(value) > 0,
      { error: "Enter an amount greater than 0." }
    )
    .transform((value) => Number(value)),
  dueDate: optionalDate,
  notes: optionalText,
});

export type PaymentFormInput = z.infer<typeof paymentSchema>;
