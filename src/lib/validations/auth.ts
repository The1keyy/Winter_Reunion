import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters." }),
});

export type SignInInput = z.infer<typeof signInSchema>;
