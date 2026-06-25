# mattwarnockauthor.com

Author website for **Matt Warnock**, promoting his debut novel *The Traveling Jessie
Barstow* and his short fiction. Built with [Astro](https://astro.build) (static output),
deployed to **Firebase Hosting**, with a contact form backed by a **Firebase Cloud
Function**.

## Stack & goals

- **Astro 5**, static output — fast, ships almost no JS, strong SEO out of the box.
- **Hand-written design** (`src/styles/global.css`) — classic literary look, deliberately
  not a generic template. Serif type (Fraunces + Newsreader), warm paper palette.
- **Fully responsive**, accessible (skip link, focus states, semantic landmarks).
- **SEO**: per-page titles/descriptions, canonical URLs, Open Graph + Twitter cards,
  JSON-LD (`Person`, `Book`, `BlogPosting`), auto-generated `sitemap.xml`, `robots.txt`.

## Prerequisites

- Node 20+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project on the **Blaze** plan (Cloud Functions require it)

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Project structure

```
src/
  config.ts              # ← edit book details, links, publications list here
  content.config.ts      # blog collection schema
  content/blog/*.md      # ← blog posts (one .md file per post)
  layouts/BaseLayout.astro  # <head>, SEO meta, JSON-LD, header/footer
  components/            # Header, Footer, BookCover
  pages/                 # index, about, publications, contact, blog/, 404
  styles/global.css      # design system
public/                  # favicon, robots.txt, og/ images
functions/               # contact-form Cloud Function
firebase.json            # hosting + function rewrite config
```

## Editing content

Most text lives directly in the `.astro` page files. Shared/structured data lives in
**`src/config.ts`** — the book title, the book-site URL, the buy link, and the list of
short-story publications. Placeholder copy is marked in the page files (and a
`[bracketed]` note on the About page) — swap in Matt's real bio, book blurb, and links.

### Adding a blog ("Journal") post

Create a new file in `src/content/blog/`, e.g. `my-post.md`:

```markdown
---
title: "Post title"
description: "One-sentence summary used for SEO and the listing."
pubDate: 2026-07-01
draft: false      # set true to hide it
---

Write the post here in Markdown.
```

The URL becomes `/blog/my-post`. The home page shows the two most recent posts
automatically. No CMS needed.

### Social share image

Drop a `1200×630` image at `public/og/default.jpg` (referenced by the layout). Per-page
images can be passed via the `image` prop to `BaseLayout`.

## Contact form

The contact page POSTs JSON to `/api/contact`, which `firebase.json` rewrites to the
`contact` Cloud Function (`functions/index.js`). The function validates input, drops
bots (honeypot field), and emails Matt over SMTP.

**One-time setup:**

```bash
cd functions && npm install && cd ..

# secrets (Gmail App Password, or Mailgun/SendGrid/Postmark/Resend creds)
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS

# non-secret config: copy and edit
cp functions/.env.example functions/.env   # set SMTP_HOST, SMTP_PORT, CONTACT_TO, CONTACT_FROM
```

> Note: `firebase.json` declares the functions runtime as **nodejs20**, matching
> `functions/package.json`'s engine.

## Deploy

```bash
npm run build
firebase deploy                 # hosting + functions
# or selectively:
firebase deploy --only hosting
firebase deploy --only functions
```

Set the real project id in `.firebaserc` first (currently `mattwarnockauthor`).

## Custom domain (MattWarnockAuthor.com)

In the Firebase console → Hosting → **Add custom domain**, enter `mattwarnockauthor.com`,
and follow the DNS instructions (A records / TXT verification). Firebase provisions the
SSL certificate automatically. After the domain is live, confirm `site:` in
`astro.config.mjs` matches it (it's set to `https://mattwarnockauthor.com`).

## To-do before launch

- [ ] Replace placeholder copy (book blurb, About bio) with Matt's real text
- [ ] Set real book-site URL and buy link in `src/config.ts`
- [ ] Replace the CSS placeholder cover (`BookCover.astro`) with the real jacket image
- [ ] Update the publications list in `src/config.ts`
- [ ] Add `public/og/default.jpg` social image
- [ ] Configure the contact-form SMTP secrets
- [ ] Point the custom domain and verify DNS
```
