import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const blog = defineCollection({ loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }), schema: z.object({
  title: z.string(), description: z.string(), pubDate: z.coerce.date(),
  interactive: z.object({ path: z.string().regex(/^explore\/[a-z0-9-]+\/$/), label: z.string() }).optional()
}) });
export const collections = { blog };
