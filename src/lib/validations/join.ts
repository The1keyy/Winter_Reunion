import { z } from "zod";

export const joinSchema = z.object({
  name: z.string().trim().min(1, { error: "Enter your name." }),
  email: z.email({ error: "Enter a valid email address." }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters." }),
  passcode: z.string().min(1, { error: "Enter the trip passcode." }),
});

export type JoinInput = z.infer<typeof joinSchema>;
