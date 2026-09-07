// ----------------------------------------------------------------------------
// Site-wide settings. Edit these values as real details become available.
// ----------------------------------------------------------------------------

export const SITE = {
  authorName: "Matt Warnock",
  // Keep in sync with `site` in astro.config.mjs.
  // Switch to https://mattwarnockauthor.com once the custom domain is connected.
  domain: "https://mattwarnockauthor.web.app",
};

export const BOOK = {
  title: "The Traveling Jessie Barstow",
  // Replace with the live book site once it exists.
  siteUrl: "https://thetravelingjessiebarstow.com",
  // Books2Read universal link — sends readers to their retailer of choice.
  buyUrl: "https://books2read.com/u/b6noEW",
  releaseDate: "2026-09-14",
  releaseDateLabel: "September 14, 2026",
  available: false, // set true on release day; flips "Preorder" copy to "Buy"
};

// Short stories & other publications. Add entries as they're published.
export const PUBLICATIONS = [
  {
    title: "The Art of Dyeing",
    venue: "Ossuary 13, Issue 2",
    year: "Winter 2026",
    type: "Short story",
    url: "https://ossuary13.com/",
  },
  {
    title: "Scarecrows",
    venue: "Ossuary 13, Issue 1",
    year: "Fall 2026",
    type: "Short story",
    url: "https://ossuary13.com/",
  },
];
