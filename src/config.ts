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
  // The book site. Points at the Firebase host that actually resolves today;
  // switch to https://jessiebarstowbook.com once that custom domain is
  // connected in Firebase Hosting. (thetravelingjessiebarstow.com was an
  // unregistered placeholder and produced dead buttons on the live site.)
  siteUrl: "https://jessiebarstow.web.app",
  // Books2Read universal link — sends readers to their retailer of choice.
  buyUrl: "https://books2read.com/u/b6noEW",
  releaseDate: "2026-09-14",
  releaseDateLabel: "September 14, 2026",
  available: false, // set true on release day; flips "Preorder" copy to "Buy"
};

// Individual storefronts, shown as buttons alongside the universal link above.
// Add Amazon here as soon as its product page is live.
export const RETAILERS = [
  {
    name: "Barnes & Noble",
    url: "https://www.barnesandnoble.com/w/the-traveling-jessie-barstow-matt-warnock/1151256570?ean=2940197475831",
  },
];

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
