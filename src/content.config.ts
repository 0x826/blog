import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(["前端", "工程", "设计", "产品", "随笔", "区块链"]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    series: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
