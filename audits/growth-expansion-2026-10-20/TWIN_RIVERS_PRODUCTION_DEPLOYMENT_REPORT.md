# Twin Rivers Production Deployment Report

**Deployment window:** 2026-10-20 9:02–9:05 PM PDT (2026-10-21 04:02–04:05 UTC)  
**Operator:** Cursor local agent  
**Authorization:** Owner-approved production push after checks. GBP and Bing Places account edits were not authorized.

## Deployment table

| Website | Repository | Branch | Commit SHA | Build result | Push result | Netlify status | Live verification | IndexNow | Deployed (UTC) | Rollback SHA |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rosevillefencingca.com | Lordsleezy/roseville-site | main | `ccbab1f` | local `node build.mjs` 84 routes OK | `c43876f..ccbab1f` | ready / production | 200; title experiment live; hours; 3 service pages | key 200 | 2026-10-21T04:03:04Z | `c43876f` |
| rocklinfencing.com | Lordsleezy/rocklin-site | main | `d1d708d` | local 63 routes OK | `c582722..d1d708d` | ready / production | 200; title experiment live; hours; 3 service pages | key 200 | 2026-10-21T04:03:06Z | `c582722` |
| folsomfencing.com | Lordsleezy/folsom-site | main | `83a35cc` | local 73 routes OK | `0ca5b02..83a35cc` | ready / production | 200; title experiment live; hours; 3 service pages | key 200 | 2026-10-21T04:03:09Z | `0ca5b02` |
| elkgrovefencing.com | Lordsleezy/elkgrove-site | main | `de2a96e` | local 78 routes OK | `c7830f2..de2a96e` | ready / production | 200; title experiment live; hours; 3 service pages | key 200 | 2026-10-21T04:03:23Z | `c7830f2` |
| granitebayfencing.com | Lordsleezy/granitebay-site | master | `08f1772` | local 88 routes OK | `1960bd5..08f1772` | ready / production | 200; title experiment live; hours; 3 service pages | key 200 | 2026-10-21T04:03:26Z | `1960bd5` |
| grassvalleyfencing.com | Lordsleezy/grassvalley-site | main | `5d4eab2` | local 102 routes OK | `08eb11f..5d4eab2` | ready / production | 200; title experiment live; hours; 3 service pages | key 200 | 2026-10-21T04:03:29Z | `08eb11f` |
| twinriversfence.com | Lordsleezy/twinrivers | main | `308682e` | static publish `.` | `8d64960..308682e` | ready / production | 200; hours in footer/schema; deck-patio live | key 200 | 2026-10-21T04:04:56Z | `8d64960` |

All seven published commits match the intended Git SHAs. No force-push. No unrelated repos were deployed. Untracked hub redesign files (`preview/`, `src/templates/*`, `.ff-research/`) were left uncommitted.

## Predeployment checks

Ran on all six city generators:

- `node build.mjs` succeeded
- No `package-lock.json` / no npm dependencies to install
- No TypeScript, lint, or test scripts exist in city `package.json` files — those checks were **not claimed**
- IndexNow key files generated into `dist/`
- IndexNow function is production-only, skips `*.netlify.app`, uses a 4-URL allowlist
- No private credentials added (IndexNow key is public by design)
- Homepage titles / H1s from the CTR experiment were unchanged
- Decks and patios remain in nav
- Phone links remain `tel:+19169062254`

Hours update (owner-confirmed **Monday–Friday 8:00 AM–5:00 PM**, days taken from the existing weekday schedule, not invented weekends):

- City footers and LocalBusiness `openingHoursSpecification`
- Hub homepage JSON-LD, homepage footer, and live service-page footers

## Live verification (production HTTP)

All 18 city service pages returned 200 and contained the new estimate/inspect sections:

- `/fence-repair/` — “What we inspect…”
- `/gates/` — “What to expect from a … gate estimate”
- `/wood-fencing/` — “… wood fence estimate works”

Homepage titles live:

- Roseville Fence Company \| Twin Rivers \| Install & Repair
- Rocklin Fence Company \| Twin Rivers \| Wood, Vinyl & Gates
- Folsom Fence Company \| Twin Rivers \| Redwood & HOA Fences
- Elk Grove Fence Company \| Twin Rivers \| Install & Repair
- Granite Bay Fence Company \| Twin Rivers \| Estate & Ranch
- Grass Valley Fence Company \| Twin Rivers \| Nevada County

IndexNow keys:

`https://{domain}/8f3a2c91e8b04d6a9c1f5e2d8a4b6c0e.txt` → `8f3a2c91e8b04d6a9c1f5e2d8a4b6c0e` on all seven domains.

Estimate forms were not submitted. Production HTML still includes the existing Netlify `contact-lead` form and `tel:+19169062254` call buttons. No fake customer inquiries were sent.

## 28-day title experiment baseline

**Deploy date:** 2026-10-20 (Pacific)  
**Measurement starts:** 2026-10-21 (first full day after deploy)  
**Measurement ends:** 2026-11-17  
**Compare against:** 2026-09-22 to 2026-10-20 GSC window

Homepage + money-query snapshot from GSC (page-scoped where available, 2026-09-22–2026-10-20):

| Site | Query | Clicks | Impr | CTR | Position |
| --- | --- | --- | --- | --- | --- |
| rosevillefencingca.com | roseville fence company | 1 | 223 | 0.45% | 7.8 |
| rocklinfencing.com | rocklin fence company | use site-wide query report (homepage-only row set did not return this exact query in top 8) | | | |
| folsomfencing.com | folsom fence company | same — keep prior SERP/GSC query report, not this homepage-only slice | | | |
| elkgrovefencing.com | elk grove fence company | 1 | 45 | 2.22% | 10.2 |
| granitebayfencing.com | granite bay fence companies / fence company in granite bay | 0 | 30 | 0% | 8.0 |
| grassvalleyfencing.com | fencing grass valley | keep prior query-level baseline (homepage-only top 8 did not include it) | | | |

Do not use site-wide average position as the homepage rank. Do not treat IndexNow as a Google submission.

Repeatable check: GSC `get_search_by_page_query` on each homepage URL, plus a query filter for the six money terms, comparing 2026-10-21–2026-11-17 vs 2026-09-22–2026-10-20.

## Bing readiness (untouched)

- Existing Bing Places panel was **not** edited
- It still needs a claim and a Volcanoville → Grass Valley / service-area correction
- After this deploy, import all seven domains from Google Search Console at https://www.bing.com/webmasters
- Sitemaps: `https://{domain}/sitemap.xml`
- IndexNow keys are live and production deploys notify `api.indexnow.org`

## GBP readiness (untouched)

Hours are now confirmed **Monday–Friday 8:00 AM–5:00 PM**. Proposed description, categories, services, photo plan, and review workflow remain in `GBP_OPTIMIZATION_REPORT.md`. Do not publish until the owner approves that change set.

## Incomplete / not claimed

- TypeScript, ESLint, and automated test suites do not exist on these repos
- Lighthouse was not run
- Production lead forms were inspected, not submitted
- IndexNow HTTP status from `api.indexnow.org` was not read from Netlify function logs
- Bing Places and GBP live settings were not changed
- Hub untracked redesign work was not deployed

## Rollback

For a city site, republish the Rollback SHA in Netlify (previous production commit) or `git revert` the three new commits and push. Do not force-push.
