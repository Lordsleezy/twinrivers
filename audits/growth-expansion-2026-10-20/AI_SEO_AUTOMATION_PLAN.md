# AI SEO Automation Plan

**Date:** 2026-10-20  
**Status:** Plan only. No new platform and no new paid subscriptions.

## What already exists

- Google Search Console MCP (`user-gscServer`) is authenticated and covers all seven domains plus `twinriversllc.org`
- City sites already build sitemaps and robots.txt in `build.mjs`
- Netlify production deploys can now ping IndexNow
- Prior CTR baseline lives in the Cursor canvas from the title-experiment work
- Hub already ingest leads from city sites (`lead-ingest`)

Missing integrations in this Cursor environment:

- Google Business Profile API / MCP
- Google Analytics MCP
- Bing Webmaster / Places MCP
- Netlify MCP
- Sentinel Prospects MCP

Do not buy replacements for those. Use the owner dashboards that already exist.

## Recommended weekly loop (human + existing GSC)

One 30-minute Friday pass, no new software:

1. GSC `compare_search_periods` for each `sc-domain:*` (last 7 days vs prior 7).
2. Pull query+page rows for the six homepage money terms. The title experiment is the thing being measured. Do not retitle yet.
3. Flag any URL that lost coverage (`inspect_url_enhanced` / `check_indexing_issues`).
4. Scan the 26-row `backlink-prospects.json` for the next claim/membership.
5. Check GBP reviews and reply (owner account already works).
6. Write a short note: clicks, calls/leads, pages to touch next week.

Money-keyword rule: a query is a candidate when impressions ≥ 20, position ≤ 12, and CTR is below the page-one city-name competitor. That is how the current title tests were chosen. Do not chase Folsom generic “fence company” at position 70+.

## Lightweight automation that fits the stack

### Already implemented

- `deploy-succeeded.cjs` notifies IndexNow of updated URLs after production deploys.

### Next, only if useful (do not build now)

1. **GitHub Action, weekly, optional.** A scheduled workflow that comments on a tracking issue: “pull GSC in Cursor and paste the 7-day totals.” GSC MCP does not run inside GitHub Actions without a separate Google service account. A service account is extra setup; skip it until the Friday loop feels painful.
2. **Broken-link check in `build.mjs`.** The generators already fail on duplicate paths. A simple internal-href scan of `dist/**/*.html` can be added later. Not added this pass because the templates already emit hrefs from the same data files.
3. **Image gap list.** Keep `GOOGLE_IMAGES_OPTIMIZATION.md` as the asset request. Automation cannot invent authentic photos.
4. **Sentinel Prospects.** No MCP was available. If the existing Sentinel Prospects product can filter fencing / outdoor contractors in Placer, Sacramento, and Nevada counties, use it for **B2B supplier and commercial-property leads**, not as a second consumer website. Confirm access in Sentinel Prime before writing any integration.

## What not to build

- A new SEO SaaS
- A city-site link graph
- Automatic title rewriting (would overwrite the live experiment)
- Automatic GBP or Bing edits
- Automatic directory submissions
- Extra analytics subscriptions while GSC is already connected

## Success metrics (same baseline as the title program)

- City-network organic clicks (66 in the last 28 days)
- Hub clicks (39)
- Homepage CTR on `{city} fence company` queries
- Calls and estimate-form leads, not impressions
- GBP review count (17 today)
- IndexNow / Bing coverage after the first production deploy
