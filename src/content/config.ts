import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    locale: z.enum(['cs', 'en']),
    entrySlug: z.string(),
    title: z.string(),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
    }),
  }),
});

export const collections = {
  services,
};
