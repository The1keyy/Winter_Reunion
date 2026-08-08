import { z } from "zod";

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const registrationSchema = z.object({
  attending: z.enum(["yes", "no"], {
    error: "Choose whether you're attending.",
  }),
  guestsCount: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0),
      { error: "Enter a whole number of 0 or more." }
    )
    .transform((value) => (value === "" ? 0 : Number(value))),
  dietaryRestrictions: z.string().transform(emptyToNull),
  notes: z.string().transform(emptyToNull),
});

export type RegistrationFormInput = z.infer<typeof registrationSchema>;
