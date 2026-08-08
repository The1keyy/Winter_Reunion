import { z } from "zod";

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Soft phone validation: allow common formats (digits, spaces, dashes,
 * parentheses, leading +) and require enough digits to be useful later for
 * text updates. Empty is allowed only when the field is intentionally cleared.
 */
export const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, { error: "Enter a mobile number so we can reach you." })
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, { error: "Enter a valid mobile number (at least 10 digits)." }),
});

export const optionalPhoneSchema = z.object({
  phone: z
    .string()
    .transform(emptyToNull)
    .refine(
      (value) => {
        if (value === null) return true;
        const digits = value.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      { error: "Enter a valid mobile number (at least 10 digits)." }
    ),
});

export type PhoneFormInput = z.infer<typeof phoneSchema>;
