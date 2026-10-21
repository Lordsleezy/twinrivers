# Service Page Improvements

**Date:** 2026-10-20  
**Status:** Implemented in all six city repositories. Homepage title experiments were not changed.

## Why these pages

Google Search Console (last 28 days, prior research) shows city homepages already collect most impressions. The next money pages with measurable demand were:

| Site | Page | Evidence |
| --- | --- | --- |
| Roseville | /fence-repair/ | 59 impressions; last inspected 2026-09-30, indexed |
| Roseville | /gates/ | 73 impressions |
| Folsom | /fence-repair/ | 69 impressions; last inspected 2026-10-09, indexed |
| Folsom | /gates/ related | 66 impressions on gate-repair |
| All cities | /wood-fencing/ | Core commercial service; already in nav and sitemap |

No new URLs were created. Doorway-page risk stays where it already was: city sites share a template but each page keeps city-specific soil, HOA, and terrain copy.

## What was implemented

On every city site, three existing pages gained a new original section:

1. **/fence-repair/** — “What we inspect on a [city] repair visit”
2. **/gates/** — “What to expect from a [city] gate estimate”
3. **/wood-fencing/** — “How a [city] wood fence estimate works”

Each section is city-specific (Roseville clay/tract HOAs, Folsom Ranch/Empire Ranch, Rocklin side-yard gates, Elk Grove Laguna/Franklin/Sheldon clay, Granite Bay slopes/oak roots, Grass Valley freeze/deer/slope). Copy tells the customer what to photograph and to call (916) 906-2254. No prices, warranties, fake testimonials, or invented capabilities were added.

Source files:

- `scripts/pages-data/services.mjs`
- `scripts/pages-data/gates.mjs`
- `scripts/pages-data/fence-types.mjs`
- regenerated `src/data/pages.js`

`node scripts/generate-pages.mjs` and `node build.mjs` succeeded on all six sites.

## Pages reviewed but not rewritten

Already city-tuned and not thin enough to justify a risky rewrite:

- Fence replacement
- Emergency repair
- Vinyl, chain-link, privacy, redwood
- Commercial fencing
- Gate repair (already specific; the gates hub now feeds it)
- Hub twinriversfence.com service templates — left alone this pass to avoid doorway overlap with city pages

## Remaining content questions

Do not publish invented answers. Confirm later if you want these pages deepened:

- Official stain / maintenance interval you will stand behind (sites currently say 2–4 or 3–5 years as climate guidance, not a warranty)
- Whether agricultural / horse fence is offered outside Grass Valley and Granite Bay
- Whether deck and patio pages should stay in the city nav if they are not a regular sold service

## What was not done

- Homepage titles, H1s, and meta descriptions from the CTR experiment were left unchanged
- No new service URLs
- No city-to-city service-page cross-linking beyond the existing Twin Rivers hub footer
- No pricing tables
