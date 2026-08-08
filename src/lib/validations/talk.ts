import { z } from "zod";

export const talkPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Give it a short title." })
    .max(120, { error: "Keep the title under 120 characters." }),
  body: z
    .string()
    .trim()
    .min(1, { error: "Write a bit so people know what you mean." })
    .max(4000, { error: "Keep it under 4000 characters." }),
});

export const talkReplySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { error: "Write a reply." })
    .max(2000, { error: "Keep replies under 2000 characters." }),
});

export type TalkPostFormInput = z.infer<typeof talkPostSchema>;
export type TalkReplyFormInput = z.infer<typeof talkReplySchema>;
