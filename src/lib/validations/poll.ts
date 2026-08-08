import { z } from "zod";

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const pollSchema = z.object({
  question: z.string().trim().min(1, { error: "Enter a question." }),
  description: z.string().transform(emptyToNull),
  option1: z.string().trim().min(1, { error: "Enter at least two options." }),
  option2: z.string().trim().min(1, { error: "Enter at least two options." }),
  option3: z.string().transform(emptyToNull),
  option4: z.string().transform(emptyToNull),
});

export type PollFormInput = z.infer<typeof pollSchema>;
