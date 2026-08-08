import { z } from "zod";

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const checkbox = z.preprocess(
  (value) => value === "on" || value === true,
  z.boolean()
);

const optionalUrl = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || /^https?:\/\//i.test(value), {
    error: "Paste a full link starting with https://",
  });

export const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Give it a short title people will notice." })
    .max(200, { error: "Keep the title under 200 characters." }),
  body: z
    .string()
    .trim()
    .min(1, { error: "Add a short message so people know what changed." }),
  linkUrl: optionalUrl,
  pinned: checkbox,
});

export type AnnouncementFormInput = z.infer<typeof announcementSchema>;
