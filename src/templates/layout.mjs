import {
  site,
  nav,
  footerColumns,
  cities,
  counties,
  citySites,
  areaHref,
  areaIsExternal,
} from "../data/site.mjs";

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230a0a0a'/%3E%3Cpath d='M7 23h18M9 13h14M11 8l3 4v14h-3V8Zm8 0 3 4v14h-3V8Z' fill='none' stroke='%23d4a853' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E";

const OG_IMAGE = `${site.domain}/assets/gallery/job2.jpg`;

export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isNavItemActive(currentPath, itemHref, children = []) {
  if (currentPath === itemHref) return true;
  if (
    children.some(
      (child) =>
        currentPath === child.href ||
        (child.href !== "/" && currentPath.startsWith(child.href))
    )
  ) {
    return true;
  }
  return itemHref !== "/" && currentPath.startsWith(itemHref);
}

function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["HomeAndConstructionBusiness", "FenceContractor"],
    "@id": `${site.domain}/#business`,
    name: site.name,
    legalName: site.legalName,
    url: `${site.domain}/`,
    telephone: site.phoneTel,
    priceRange: site.priceRange,
    image: OG_IMAGE,
    description: `Licensed fence contractor based in Nevada County (Grass Valley, CA), providing installation, repair, gates, and commercial fencing across the Sacramento Valley and Sierra foothills. California license #${site.license}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Nevada County" },
      { "@type": "AdministrativeArea", name: "Sacramento County" },
      { "@type": "AdministrativeArea", name: "Placer County" },
      ...cities.slice(0, 12).map((city) => ({
        "@type": "City",
        name: city.name,
      })),
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: 38.255235,
      longitude: -121.0614744,
    },
    sameAs: [site.mapsUrl, site.googleReviewsUrl],
  };
}

export function renderNav(currentPath) {
  return nav
    .map((item) => {
      const children = item.children ?? [];
      if (children.length) {
        const active = isNavItemActive(currentPath, item.href, children);
        const links = children
          .map((child) => {
            const childActive = currentPath === child.href;
            return `<a href="${child.href}" role="menuitem"${
              childActive ? ' aria-current="page"' : ""
            }>${escapeHtml(child.label)}</a>`;
          })
          .join("");
        return `<div class="nav-dropdown nav-mega"${
          active ? ' data-active="true"' : ""
        }>
  <a href="${item.href}" class="nav-dropdown-trigger" aria-haspopup="true" aria-expanded="false">${escapeHtml(item.label)}</a>
  <div class="nav-dropdown-panel" role="menu">${links}</div>
</div>`;
      }
      const active = isNavItemActive(currentPath, item.href);
      return `<a href="${item.href}"${
        active ? ' aria-current="page"' : ""
      }>${escapeHtml(item.label)}</a>`;
    })
    .join("\n");
}

export function renderFooter() {
  const cols = footerColumns
    .map(
      (col) => `
    <div class="footer-col">
      <h3>${escapeHtml(col.title)}</h3>
      <ul>${col.links
        .map(
          (link) =>
            `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`
        )
        .join("")}</ul>
    </div>`
    )
    .join("");

  const cityCol = `
    <div class="footer-col">
      <h3>City Sites</h3>
      <ul>${citySites
        .map(
          (entry) =>
            `<li><a href="${entry.href}" rel="noopener">${escapeHtml(entry.label)}</a></li>`
        )
        .join("")}</ul>
    </div>`;

  return `
<footer class="site-footer">
  <div class="footer-grid">${cols}${cityCol}</div>
  <div class="footer-bottom">
    <p class="footer-meta">${escapeHtml(site.legalName)} · License #${site.license} · ${escapeHtml(site.address.locality)}, ${site.address.region} · <a href="tel:${site.phoneTel}">${site.phoneDisplay}</a></p>
    <p class="footer-legal"><a href="/terms.html">Terms</a> · <a href="/privacy.html">Privacy</a></p>
  </div>
</footer>`;
}

function renderCityServe() {
  const areaLinks = [
    ...cities.map((city) => ({
      label: city.name,
      href: areaHref(city.slug),
      external: areaIsExternal(city.slug),
    })),
    ...counties.map((county) => ({
      label: county.name,
      href: `/fencing/${county.slug}/`,
      external: false,
    })),
  ]
    .map((area) => {
      const ext = area.external
        ? ' target="_blank" rel="noopener"'
        : "";
      return `<a class="city-serve-link" href="${area.href}"${ext}>${escapeHtml(area.label)}</a>`;
    })
    .join("");

  return `
<section class="city-serve" aria-labelledby="city-serve-title">
  <div class="city-serve-inner">
    <p class="city-serve-eyebrow">Areas We Serve All Around Sacramento, CA</p>
    <h2 id="city-serve-title" class="city-serve-title">Fence Company Areas We Serve</h2>
    <div class="city-serve-cloud">${areaLinks}</div>
  </div>
</section>`;
}

function renderBookDrawer() {
  return `
<aside class="book-panel" aria-label="Call Twin Rivers Fence">
  <a class="book-panel-trigger" href="tel:${site.phoneTel}">Call ${escapeHtml(site.phoneDisplay)}</a>
</aside>`;
}

export function renderLayout({
  title,
  description,
  path,
  canonical,
  body,
  schemas = [],
  pageClass = "",
  extraHead = "",
  hideCities = false,
  hideBookPanel = false,
  preview = false,
  ogType = "website",
}) {
  const url = canonical || `${site.domain}${path}`;
  const bodyClass = pageClass ? ` class="${escapeHtml(pageClass)}"` : "";
  const allSchemas = [localBusinessSchema(), ...schemas.filter(Boolean)];
  const schemaTags = allSchemas
    .map(
      (schema) =>
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${url}">
<meta name="description" content="${escapeHtml(description)}">
<meta name="theme-color" content="#0a1216">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${escapeHtml(site.name)}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:alt" content="${escapeHtml(site.name)} — ${escapeHtml(site.address.locality)} fence contractors">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/ff-theme.css">
${schemaTags}
${extraHead}
</head>
<body${bodyClass}>
<a class="skip-link" href="#main">Skip to content</a>
<div class="util-bar">
  <div class="util-bar-inner">
    <a class="util-bar-phone" href="tel:${site.phoneTel}">${site.phoneDisplay}</a>
    <span class="util-bar-meta">Licensed #${site.license} · Based in Nevada County · ${escapeHtml(site.address.locality)}, ${site.address.region}</span>
  </div>
</div>
<header class="site-header">
  <div class="site-header-inner">
    <a class="site-brand" href="/">${escapeHtml(site.name)}</a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
      <span class="sr-only">Menu</span>
      <span class="nav-toggle-bar" aria-hidden="true"></span>
      <span class="nav-toggle-bar" aria-hidden="true"></span>
      <span class="nav-toggle-bar" aria-hidden="true"></span>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Main">${renderNav(path)}</nav>
    <div class="site-header-actions">
      <a class="btn btn-book" href="/contact/">Book Now</a>
      <a class="btn btn-call" href="tel:${site.phoneTel}">Call</a>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
${hideCities ? "" : renderCityServe()}
${renderFooter()}
<div class="sticky-call" aria-label="Quick contact">
  <a class="sticky-call-btn sticky-call-btn--call" href="tel:${site.phoneTel}">Call</a>
  <a class="sticky-call-btn sticky-call-btn--book" href="/contact/">Book</a>
</div>
${hideBookPanel ? "" : renderBookDrawer()}
<script src="/assets/js/site.js" defer></script>
<script src="/assets/js/google-reviews.js" defer></script>
</body>
</html>`;
}
