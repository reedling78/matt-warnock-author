/**
 * Regenerates the social-share cards in public/og/ (1200x630 JPEG).
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node scripts/build-og-cards.mjs
 *
 * The cards are rendered in Chromium using the site's real fonts (Fraunces +
 * Newsreader from Google Fonts) and palette, at 2x, then downsampled with
 * sharp so the serif edges stay clean. Source art comes from public/.
 *
 * Cards produced:
 *   default.jpg  — Matt's portrait. Home, About, Contact, 404.
 *   book.jpg     — the cover. Publications.
 *   journal.jpg  — portrait + Journal masthead. Blog index and every post
 *                  (override per post with `ogImage:` in its frontmatter).
 */
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");
const OUT = path.join(PUB, "og");

const dataUri = (f) =>
  "data:image/jpeg;base64," + readFileSync(path.join(PUB, f)).toString("base64");

const portrait = dataUri("matt-portrait.jpg");
const cover = dataUri("cover-web.jpg");

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700" +
  "&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..500&display=swap";

// Palette mirrors :root in src/styles/global.css — keep the two in sync.
const BASE = `
<link rel="stylesheet" href="${FONTS}">
<style>
  :root {
    --paper:#f7f2e8; --ink:#211b17; --ink-soft:#4d433a; --ink-faint:#7a6f63;
    --burgundy:#7c2d3a; --gold:#a8843f;
    --rule:rgba(33,27,23,0.14); --rule-strong:rgba(33,27,23,0.28);
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  body {
    width:1200px; height:630px; background:var(--paper);
    font-family:"Newsreader",Georgia,serif; color:var(--ink);
    -webkit-font-smoothing:antialiased;
  }
  .card {
    position:relative; width:1200px; height:630px; overflow:hidden;
    background:
      radial-gradient(120% 100% at 12% 0%, #fbf8f1 0%, rgba(251,248,241,0) 62%),
      var(--paper);
  }
  .frame { position:absolute; inset:28px; border:1px solid var(--rule); }
  .frame::after {
    content:""; position:absolute; inset:7px;
    border:1px solid rgba(124,45,58,0.14);
  }
  .inner {
    position:absolute; inset:28px; padding:52px 62px;
    display:flex; align-items:center; gap:56px;
  }
  .eyebrow {
    font-weight:600; font-size:22px; letter-spacing:.34em;
    text-transform:uppercase; color:var(--burgundy);
  }
  h1 {
    font-family:"Fraunces",Georgia,serif; font-weight:600;
    font-size:82px; line-height:1.02; letter-spacing:-0.012em;
    margin-top:16px;
  }
  h1.tight { font-size:64px; line-height:1.06; }
  .rule { height:1px; background:var(--rule-strong); margin:30px 0 26px; max-width:520px; }
  .rule.gold {
    height:2px;
    background:linear-gradient(90deg,var(--gold),rgba(168,132,63,0));
  }
  .sub { font-size:31px; line-height:1.36; color:var(--ink-soft); }
  .sub .big {
    display:block; font-size:35px; font-style:italic; margin-top:4px;
    color:var(--ink);
  }
  .byline { margin-top:26px; font-size:26px; letter-spacing:.06em; color:var(--ink-faint); }
  .medallion img {
    display:block; border-radius:50%; object-fit:cover;
    box-shadow:0 0 0 6px var(--paper), 0 0 0 8px var(--burgundy),
               0 18px 40px rgba(33,27,23,0.18);
  }
  .medallion.lg img { width:352px; height:352px; }
  .medallion.sm img { width:236px; height:236px; }
  .cover img {
    display:block; width:310px; height:429px; object-fit:cover;
    box-shadow:0 22px 46px rgba(33,27,23,0.30), 0 0 0 1px rgba(33,27,23,0.16);
  }
  .medallion, .cover { flex:0 0 auto; }
  .body { min-width:0; }
</style>`;

const CARDS = {
  "default.jpg": `${BASE}
<div class="card"><div class="frame"></div><div class="inner">
  <div class="medallion lg"><img src="${portrait}"></div>
  <div class="body">
    <div class="eyebrow">Author</div>
    <h1>Matt Warnock</h1>
    <div class="rule"></div>
    <div class="sub">Fantasy &amp; adventure fiction
      <span class="big">The Traveling Jessie Barstow</span>
    </div>
  </div>
</div></div>`,

  "book.jpg": `${BASE}
<div class="card"><div class="frame"></div><div class="inner">
  <div class="cover"><img src="${cover}"></div>
  <div class="body">
    <div class="eyebrow">The Novel</div>
    <h1 class="tight">The Traveling<br>Jessie Barstow</h1>
    <div class="rule gold"></div>
    <div class="sub">One ordinary girl.<br>Infinite worlds.<br>One door she never should have opened.</div>
    <div class="byline">Matt Warnock</div>
  </div>
</div></div>`,

  "journal.jpg": `${BASE}
<div class="card"><div class="frame"></div><div class="inner">
  <div class="medallion sm"><img src="${portrait}"></div>
  <div class="body">
    <div class="eyebrow">The Journal</div>
    <h1 class="tight">Notes from<br>the writing desk</h1>
    <div class="rule"></div>
    <div class="sub">On writing, worldbuilding, and the road to publishing</div>
    <div class="byline">Matt Warnock</div>
  </div>
</div></div>`,
};

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});

for (const [name, html] of Object.entries(CARDS)) {
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const png = await page.screenshot({ type: "png" });
  await sharp(png)
    .resize(1200, 630, { kernel: "lanczos3" })
    .jpeg({ quality: 90, progressive: true, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(path.join(OUT, name));
  console.log("wrote public/og/" + name);
}

await browser.close();
