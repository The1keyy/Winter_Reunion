import { z } from "zod";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters." }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
