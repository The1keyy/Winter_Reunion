import { z } from "zod";

import type { UserRole } from "@/types/database";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters." }),
});

export const createMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Enter a name." })
    .max(60, { error: "Keep the name under 60 characters." }),
  email: z.email({ error: "Enter a valid email address." }),
  phone: z.string().trim().optional(),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters." }),
});

export const memberRoleSchema = z.object({
  role: z.enum(["admin", "co-admin", "member"], {
    error: "Pick a valid role.",
  }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type MemberRoleInput = z.infer<typeof memberRoleSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;

export const MEMBER_ROLES: UserRole[] = ["admin", "co-admin", "member"];
