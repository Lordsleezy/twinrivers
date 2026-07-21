# Twin Rivers Fence — SEO Final Report

**Date:** 2026-07-20  
**Repo:** `C:\Users\pgg12\twinrivers`  
**Preferred canonical host:** `https://twinriversfence.com` (non-www)

---

## Summary

Verification pass completed on 2026-07-20. The city-page generator was run successfully (`node scripts/generate-unique-city-pages.mjs`), producing **96 city×service pages**, **16 fencing city pages**, and **`sitemap.xml` with 131 URLs**. Sitemap `<loc>` entries contain **0** references to `twinriversllc.org` and **0** to `www.twinriversfence.com`.

FAQ structured data on `services/wood-fence-installation-sacramento/` was checked: each question has a distinct answer aligned to the topic (not a single repeated “valley clay” paragraph for unrelated questions). Local static serving on port **8765** returned **200** for `/fence-installation/` and `/services/wood-fence-installation-sacramento/`, and **404** for a fake URL without serving homepage marketing copy (“Fencing built to last” absent on 404).

**Search indexing will not improve until this build is deployed to production and Google Search Console is updated.**

Note: `python` is not installed on this machine (Windows Store stub only). HTTP checks used an equivalent static file server on `127.0.0.1:8765` serving the repo root, matching the intended URL tests.

---

## Pages modified (categories + counts)

| Category | Count | Notes |
|----------|------:|-------|
| City × service pages | **96** | Regenerated under `services/{service}-{city}/` via `generate-unique-city-pages.mjs` |
| Fencing city hubs | **16** | Regenerated under `fencing/{city}/` |
| Sitemap | **131 URLs** | Rewritten by the same generator; non-www `twinriversfence.com` only |
| Service pillars (prior work) | 7 | e.g. `/fence-installation/`, `/fence-repair/`, gates, staining, retaining wall, deck/patio |
| Supporting technical assets | — | `404.html`, `robots.txt`, `netlify.toml`, generator scripts in `scripts/` |

**Generator run output (this session):** `Wrote 96 city×service pages`, `Wrote 16 fencing city pages`, `Wrote sitemap.xml with 131 URLs`.

---

## Remaining duplicate-content risks

| Risk | Severity | Notes |
|------|----------|-------|
| Shared layout/CSS/nav across city pages | Low | Expected sitewide chrome; Google weighs main body copy |
| Same service type across cities shares structural templates | Medium | Intros, neighborhoods, permits, FAQs, and section order differ; some boilerplate may remain |
| Cost and permit template routes (`/cost/*`, `/permits/*`) | Medium | Not regenerated in this generator pass |
| Stock photography reused across pages | Low–Medium | Alt text varies; real project photos would reduce similarity |
| Cross-city FAQ phrasing similarity | Low–Medium | Pairing bug fixed in generator; monitor Rich Results after deploy |

---

## Remaining indexing risks

| Risk | Severity | Notes |
|------|----------|------------|
| Changes not deployed to Netlify/production | Critical (until publish) | Live crawl still serves prior behavior until deploy |
| Historical GSC “Crawled – not indexed” | Expected short-term | Resubmit sitemap and request indexing on key pillars after deploy |
| Alternate domain `twinriversllc.org` if still crawlable elsewhere | High | Consolidate with 301s and single GSC property where possible |
| URLs outside regen scope (cost, permits, gallery) | Low–Medium | May remain thinner or more templated |
| Client-heavy homepage (GSAP) | Medium (ranking/CWV) | Unlikely to block indexing; affects performance signals |

---

## Manual recommendations (deploy, GSC)

1. **Deploy** this repository to Netlify (or current host) and confirm build uses updated `sitemap.xml` and `404.html`.
2. **Live smoke tests** after deploy:
   - `/fence-installation/` → 200, unique pillar content, self-referencing canonical
   - `/services/wood-fence-installation-sacramento/` → 200
   - `/this-page-does-not-exist-xyz/` (or similar) → **404**, not homepage body
   - `/sitemap.xml` → 131 URLs, all `https://twinriversfence.com/...`, no legacy hosts
3. **Google Search Console:** submit `https://twinriversfence.com/sitemap.xml`; use URL Inspection → **Request indexing** on the seven service pillars and high-priority city pages.
4. **Rich Results Test** on Sacramento wood fence FAQ JSON-LD after deploy.
5. Replace stock images with Twin Rivers job photos when available; optionally deepen `/cost/*` and `/permits/*` in a follow-up pass.

---

## Estimated SEO impact

| Change | Indexing impact | Ranking impact |
|--------|-----------------|----------------|
| Remove SPA soft-404 + real pillar pages | High | High (unblocks crawl) |
| 96 unique city×service pages | High | High for “[service] [city]” queries |
| 16 fencing city hubs | Medium–High | Medium–High (local fencing) |
| Sitemap host cleanup (131 URLs, non-www) | High | Medium |
| FAQ Q→A alignment in schema | Medium | Medium (rich result eligibility) |
| Internal linking from home/services/city pages | High | Medium–High |
| Property-improvement 301 consolidation (prior) | Medium | Medium |
| Deploy + GSC resubmit (pending) | **Required** | **Required** |
| Real photography + cost/permit rewrites (pending) | Low–Medium | Medium |

---

*Regenerate city pages anytime:*  
`C:\Users\pgg12\twinrivers\.tools\node\extract\node-v22.17.0-win-x64\node.exe scripts/generate-unique-city-pages.mjs`
