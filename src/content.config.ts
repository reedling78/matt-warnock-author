import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog / "Journal" posts. Each post is a Markdown file in src/content/blog/.
// To add a post, drop in a new .md file with the frontmatter fields below.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    // Optional per-post social card, e.g. "/og/journal.jpg". Falls back to the
    // shared Journal card when omitted. Must be 1200x630 and live in /public.
    ogImage: z.string().optional(),
    ogImageAlt: z.string().optional(),
  }),
});

export const collections = { blog };
