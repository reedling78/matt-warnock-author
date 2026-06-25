# Blog CMS — Google Doc → Astro posts

Matt writes blog posts in a single Google Doc; a scheduled job reads it, converts
new/changed posts into Astro markdown files, and publishes them. This keeps Matt in
a tool he knows (Google Docs) while the site stays a fast, SEO-friendly static build.

## The source doc

- **Title:** "Matt Warnock — Blog Posts (Live)"
- **ID:** `1MwotWM2dcY0169Kizi9aKM3wpe26kF4rHCqiezF1Hqg`
- **URL:** https://docs.google.com/document/d/1MwotWM2dcY0169Kizi9aKM3wpe26kF4rHCqiezF1Hqg/edit

The doc contains an instructions header, then a "YOUR POSTS" area, then a template.
Only the posts area matters for publishing.

## Post format (what Matt types)

Each post is separated by a literal marker line and three labeled lines, then the body:

```
--- NEW POST ---
Title: Welcome to the Journal
Date: June 14, 2026
Description: One sentence summary for previews + SEO.

Body paragraphs here. Blank line = new paragraph.
> Line starting with > becomes a pull-quote.
*single asterisks* = italics. [text](/path) = link.
```

Optional: a line reading `Draft: yes` skips the post until removed.

## Mapping to Astro frontmatter

The blog collection (`src/content.config.ts`) expects markdown in `src/content/blog/`
with this frontmatter:

| Doc field      | Frontmatter      | Notes                                                        |
|----------------|------------------|-------------------------------------------------------------|
| `Title:`       | `title`          | Quoted string.                                              |
| `Date:`        | `pubDate`        | Parsed to `YYYY-MM-DD`.                                     |
| `Description:` | `description`    | Quoted string. Used for previews + meta description.        |
| `Draft: yes`   | `draft: true`    | Defaults to `false` when absent; drafts are skipped.        |
| body           | (markdown body)  | See conversion notes below.                                 |

**Slug / filename:** derived from the title — lowercased, non-alphanumerics to
hyphens, collapsed (e.g. "Welcome to the Journal" → `welcome-to-the-journal.md`).
The slug is stable, so editing a post's body updates the same file rather than
creating a duplicate. Changing the title creates a new file (and orphans the old
slug — rename intentionally).

## Conversion notes (important)

The Drive connector returns a markdown-ish text representation that **backslash-escapes**
special characters: `\*`, `\>`, `\[`, `\]`, `\-`, `\~`, `1\.`. Before writing the
markdown body, strip these escapes so Matt's intended formatting is recovered:

- `\*word\*` → `*word*` (italic)
- `\> quote` → `> quote` (blockquote)
- `\[text\]\(/path\)` → `[text](/path)` (link)
- empty paragraphs come through as lines of two spaces — normalize to blank lines.

Because this needs light judgment (unescaping, paragraph cleanup, trimming the
instructions/template sections), conversion is done by the scheduled assistant run
rather than a rigid parser.

## Publish flow (daily)

1. Read the doc via the Drive connector.
2. Split on `--- NEW POST ---`; ignore the instructions header and the template block.
3. For each non-draft post: build frontmatter + cleaned markdown body → `src/content/blog/<slug>.md`.
4. Skip posts whose `.md` already exists with identical content (idempotent).
5. Commit changed/new files to the site repo; the deploy then rebuilds the static site.

Drafts and the template are never written. Removing `Draft: yes` publishes on the next run.
