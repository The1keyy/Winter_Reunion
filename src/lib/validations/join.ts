import { z } from "zod";

export const joinSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: "Enter your first name." })
    .max(40, { error: "Keep your first name under 40 characters." }),
  lastInitial: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Za-z]$/, {
      error: "Enter just your last-name initial (one letter).",
    }),
  email: z.email({ error: "Enter a valid email address." }),
  password: z
    .string()
    .min(6, { error: "Pick a password with at least 6 characters." }),
  passcode: z.string().min(1, { error: "Enter the trip passcode." }),
});

export type JoinInput = z.infer<typeof joinSchema>;

/** Display name stored on the profile, e.g. "Keyshawn J." */
export function formatJoinDisplayName(
  firstName: string,
  lastInitial: string
): string {
  return `${firstName.trim()} ${lastInitial.trim().toUpperCase()}.`;
}
