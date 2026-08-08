import { z } from "zod";

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const suggestionSchema = z.object({
  category: z.string().trim().min(1, { error: "Enter a category." }),
  title: z.string().trim().min(1, { error: "Enter a title." }),
  description: z.string().transform(emptyToNull),
});

export type SuggestionFormInput = z.infer<typeof suggestionSchema>;
