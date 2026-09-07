/* ---------------------------------------------------------------------------
 * Matt Warnock sites — GA4 tagging, Consent Mode v2, and event instrumentation.
 *
 * SHARED FILE — an identical copy lives in both repos:
 *     matt-warnock-author/public/analytics.js
 *     jessie-barstow-site/analytics.js
 * If you change one, change the other. There is no build step tying them
 * together, so they drift silently if you forget.
 *
 * Both sites report into ONE GA4 property via ONE measurement ID. That is what
 * makes cross-domain journeys work: a visitor going author -> book stays one
 * user in one session instead of showing up as a fresh referral. Reports are
 * split apart afterwards using the built-in Hostname dimension.
 *
 * Configure by setting window.MW_ANALYTICS *before* loading this file:
 *     window.MW_ANALYTICS = { measurementId: "G-XXXXXXXXX", site: "author" };
 * ------------------------------------------------------------------------- */
(function () {
  "use strict";

  var CFG = window.MW_ANALYTICS || {};
  var SITE = CFG.site === "book" ? "book" : "author";
  var MEASUREMENT_ID = CFG.measurementId || "";
  var STORAGE_KEY = "mw-consent";

  // Keep in sync with "Configure your domains" in the GA4 data stream.
  var AUTHOR_HOSTS = ["mattwarnockauthor.com", "mattwarnockauthor.web.app"];
  var BOOK_HOSTS = ["jessiebarstowbook.com", "jessiebarstow.web.app"];

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  /* ---------------------------------------------------------------- consent */

  function readConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function writeConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode */ }
  }

  function applyConsent(granted) {
    gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied"
    });
  }

  /* ----------------------------------------------------------------- events */

  function hostOf(url) {
    try {
      return new URL(url, location.href).hostname.replace(/^www\./, "").toLowerCase();
    } catch (e) { return ""; }
  }

  function hostMatches(host, list) {
    for (var i = 0; i < list.length; i++) {
      if (host === list[i] || host.indexOf("." + list[i]) > -1) return true;
    }
    return false;
  }

  // Where on the page did the click happen? Derived from the enclosing section
  // so new buttons are labelled automatically instead of needing markup.
  function sectionOf(el) {
    if (!el.closest) return "page";
    var s = el.closest("[data-ga-section], section, header, footer, main");
    if (!s) return "page";
    if (s.hasAttribute("data-ga-section")) return s.getAttribute("data-ga-section");
    if (s.id) return s.id;
    // The author site labels its sections with classes rather than ids
    // ("section book", "hero"), so fall back to the most specific class name.
    // Keeps `location` meaningful without sprinkling ids through the markup;
    // add data-ga-section to override anywhere the guess reads badly.
    var classes = String(s.className || "").split(/\s+/).filter(function (c) {
      return c && c !== "section" && c !== "container";
    });
    if (classes.length) return classes[classes.length - 1];
    return s.tagName.toLowerCase();
  }

  var RETAILERS = {
    "books2read.com": "books2read",
    "barnesandnoble.com": "barnes_noble",
    "amazon.com": "amazon",
    "bookshop.org": "bookshop",
    "kobo.com": "kobo",
    "books.apple.com": "apple_books"
  };

  function retailerOf(host) {
    for (var domain in RETAILERS) {
      if (host === domain || host.indexOf("." + domain) > -1) return RETAILERS[domain];
    }
    return null;
  }

  // Public helper — used by the contact form, and available for anything else.
  function track(name, params) {
    params = params || {};
    params.site = SITE;
    if (window.gtag) window.gtag("event", name, params);
  }
  window.mwTrack = track;

  function onDocumentClick(e) {
    var target = e.target;
    if (!target || !target.closest) return;
    var a = target.closest("a[href]");
    if (!a) return;

    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#") return;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

    var host = hostOf(href);
    var where = sectionOf(a);
    var label = (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);

    // 1. Preorder / buy — any known retailer, so adding Amazon later needs no
    //    change here beyond the RETAILERS map above.
    var retailer = retailerOf(host);
    if (retailer) {
      track("preorder_click", { retailer: retailer, location: where, link_text: label });
      return;
    }

    // 2. Sample chapter PDF.
    if (/\.pdf(\?|$)/i.test(href)) {
      track("sample_download", {
        file_name: href.split("/").pop().split("?")[0],
        location: where
      });
      return;
    }

    // 3. Author site <-> book site. Reported separately from GA4's own
    //    attribution so the funnel is visible even if referral data is thin.
    var toBook = hostMatches(host, BOOK_HOSTS);
    var toAuthor = hostMatches(host, AUTHOR_HOSTS);
    if ((SITE === "author" && toBook) || (SITE === "book" && toAuthor)) {
      track("cross_site_click", {
        destination: toBook ? "book" : "author",
        location: where,
        link_text: label
      });
    }
  }

  /* ----------------------------------------------------------------- banner */

  var THEMES = {
    author: {
      bg: "var(--paper-card, #fbf8f1)",
      fg: "var(--ink-soft, #4d433a)",
      border: "var(--rule-strong, rgba(33,27,23,.28))",
      accent: "var(--burgundy, #7c2d3a)",
      accentFg: "var(--paper, #f7f2e8)",
      font: "var(--font-body, Georgia, 'Times New Roman', serif)",
      radius: "var(--radius, 2px)",
      shadow: "0 -2px 28px rgba(33,27,23,.13)"
    },
    book: {
      bg: "#0c1c2b",
      fg: "#c6d5e2",
      border: "rgba(84,201,209,.32)",
      accent: "var(--gold, #e9b949)",
      accentFg: "#0a1622",
      font: "'Nunito Sans', system-ui, -apple-system, sans-serif",
      radius: "8px",
      shadow: "0 -2px 28px rgba(0,0,0,.5)"
    }
  };

  function showBanner() {
    var t = THEMES[SITE];

    var style = document.createElement("style");
    style.textContent = [
      ".mw-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;",
      "background:" + t.bg + ";color:" + t.fg + ";font-family:" + t.font + ";",
      "border-top:1px solid " + t.border + ";box-shadow:" + t.shadow + ";",
      "padding:1rem 1.25rem;display:flex;gap:1rem;align-items:center;",
      "flex-wrap:wrap;justify-content:center;font-size:.94rem;line-height:1.5;",
      "transform:translateY(100%);transition:transform .35s ease}",
      ".mw-consent.is-in{transform:translateY(0)}",
      "@media (prefers-reduced-motion:reduce){.mw-consent{transition:none}}",
      ".mw-consent__text{margin:0;max-width:46rem;flex:1 1 22rem}",
      ".mw-consent__actions{display:flex;gap:.6rem;flex:0 0 auto}",
      ".mw-consent__btn{font:inherit;font-size:.9rem;cursor:pointer;",
      "padding:.5rem 1.1rem;border-radius:" + t.radius + ";border:1px solid " + t.border + ";",
      "background:transparent;color:inherit;transition:opacity .2s ease}",
      ".mw-consent__btn:hover{opacity:.75}",
      ".mw-consent__btn--accept{background:" + t.accent + ";color:" + t.accentFg + ";",
      "border-color:" + t.accent + ";font-weight:600}",
      ".mw-consent__btn:focus-visible{outline:2px solid " + t.accent + ";outline-offset:2px}"
    ].join("");
    document.head.appendChild(style);

    var bar = document.createElement("div");
    bar.className = "mw-consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie preferences");
    bar.innerHTML =
      '<p class="mw-consent__text">This site uses cookies to measure how many people ' +
      'visit and which pages they read. Nothing is shared with advertisers.</p>' +
      '<div class="mw-consent__actions">' +
      '<button type="button" class="mw-consent__btn mw-consent__btn--decline">Decline</button>' +
      '<button type="button" class="mw-consent__btn mw-consent__btn--accept">Accept</button>' +
      '</div>';

    function dismiss(granted) {
      writeConsent(granted ? "granted" : "denied");
      applyConsent(granted);
      bar.classList.remove("is-in");
      setTimeout(function () { bar.remove(); }, 400);
    }

    bar.querySelector(".mw-consent__btn--accept")
       .addEventListener("click", function () { dismiss(true); });
    bar.querySelector(".mw-consent__btn--decline")
       .addEventListener("click", function () { dismiss(false); });

    document.body.appendChild(bar);
    // rAF guarded: the slide-in needs one frame after insertion, but the banner
    // must still appear in any environment that lacks rAF rather than throwing.
    var raf = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
    raf(function () { bar.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------------- init */

  function init() {
    document.addEventListener("click", onDocumentClick, true);
    if (readConsent() === null) showBanner();
  }

  if (!MEASUREMENT_ID) {
    // No ID configured yet — do nothing rather than half-initialise.
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
