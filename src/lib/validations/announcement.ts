import { z } from "zod";

const checkbox = z.preprocess(
  (value) => value === "on" || value === true,
  z.boolean()
);

export const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Enter a title." })
    .max(200, { error: "Keep the title under 200 characters." }),
  body: z.string().trim().min(1, { error: "Enter the announcement text." }),
  pinned: checkbox,
});

export type AnnouncementFormInput = z.infer<typeof announcementSchema>;
