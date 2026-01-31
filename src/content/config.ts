import { defineCollection, z } from "astro:content";

const techSeriesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  "every-bit-of-ai": techSeriesCollection,
  engineering: techSeriesCollection,
};
