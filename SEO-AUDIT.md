# Twin Rivers Fence — SEO Audit & Indexing Fix Report

**Site:** https://twinriversfence.com  
**Audit date:** 2026-07-20  
**Focus:** Google Search Console status **“Crawled – currently not indexed”** on high-value service pages  

---

## 1. Executive Summary

Google was correctly refusing to index the named service URLs because **they were not real pages**. Live fetch evidence showed `/fence-installation/`, `/fence-repair/`, `/gate-installation/`, `/custom-fence-design/`, `/fence-staining/`, `/retaining-wall/`, `/deck-patio/`, and even a nonsense URL `/asdf-not-a-real-page-xyz/` all returned **identical homepage HTML** (114,962 bytes), with:

| Signal | Evidence |
|--------|----------|
| HTTP status | `200` (soft 404 pattern) |
| `<title>` | `Twin Rivers Fence \| Sacramento Valley` (homepage) |
| Canonical | `https://twinriversfence.com/` (homepage) |
| H1 | `Fencing built to last decades, not seasons.` (homepage) |
| Content fingerprint | Identical across all tested paths |

**Root cause in code:** `netlify.toml` contained a SPA catch-all:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

That rewrite made every missing path look like a successful homepage clone. Google crawls those URLs, sees duplicates of `/` with a homepage canonical, and reports **Crawled – currently not indexed**.

**Secondary causes** also blocking broader indexation of the real service architecture:

1. **Broken sitemap** pointing many URLs at `twinriversllc.org` instead of `twinriversfence.com`
2. **Orphan / unlinked service cards** on the homepage (H3 labels with **zero** `<a href>` to service URLs)
3. **Thin service hubs** (`/services/fence-repair/` ≈ **206 words** live before fix; wrong meta descriptions)
4. **Near-duplicate city pages** (Sacramento vs Roseville wood-fence pages measured at **100%** template similarity after city-name normalization)
5. **No LocalBusiness / Organization schema** on the homepage (0 JSON-LD scripts live)
6. **Cannibalizing URLs** under `/property-improvement/` overlapping fence repair, gates, and decks

**What we fixed in this repo (ready to deploy):** removed the SPA rewrite, created 7 unique service landings, rebuilt sitemap/robots/404, linked homepage + footer, added schema, expanded hubs, and 301’d duplicate property-improvement URLs.

---

## 2. Root Causes Preventing Indexing

### Cause A — Soft 404 SPA rewrite (PRIMARY) — Impact: **High**

| Test URL | Status | Bytes | Canonical | Is homepage clone? |
|----------|--------|-------|-----------|--------------------|
| `/` | 200 | 114962 | `https://twinriversfence.com/` | Yes (source) |
| `/fence-installation/` | 200 | 114962 | `https://twinriversfence.com/` | **Yes** |
| `/fence-repair/` | 200 | 114962 | `https://twinriversfence.com/` | **Yes** |
| `/gate-installation/` | 200 | 114962 | `https://twinriversfence.com/` | **Yes** |
| `/custom-fence-design/` | 200 | 114962 | `https://twinriversfence.com/` | **Yes** |
| `/fence-staining/` | 200 | 114962 | `https://twinriversfence.com/` | **Yes** |
| `/retaining-wall/` | 200 | 114962 | `https://twinriversfence.com/` | **Yes** |
| `/deck-patio/` | 200 | 114962 | `https://twinriversfence.com/` | **Yes** |
| `/asdf-not-a-real-page-xyz/` | 200 | 114962 | `https://twinriversfence.com/` | **Yes** |

Google’s documented behavior for soft 404 / duplicate-with-canonical-elsewhere matches this outcome exactly.

### Cause B — Sitemap domain contamination — Impact: **High**

Previous `sitemap.xml` mixed hosts, e.g.:

- `https://twinriversllc.org/`
- `https://twinriversllc.org/fencing/sacramento/`
- `https://twinriversllc.org/services/wood-fence-installation-sacramento/`
- plus some `https://twinriversfence.com/projects/...` entries

No `lastmod` values. Service landings like `/fence-installation/` were **absent**.

### Cause C — No internal links to “phantom” service URLs — Impact: **High**

Homepage “What we do” cards (Fence Installation, Fence Repair, Gate Installation, etc.) were `<article>` elements **without links**.

Live homepage internal link inventory (pre-fix) unique paths:

- `/projects/`, `/reviews/`, `/commercial-projects/`, `/fence-learning-center/`, `/privacy`, `/terms`, `#contact`

**Internal links pointing to `/fence-installation/` (pre-fix): 0**  
**Internal links pointing to `/fence-repair/` (pre-fix): 0**  
(same for the other five phantom URLs)

Discovery likely came from historical URLs, external mentions, or GSC inspections—not from a healthy crawl path.

### Cause D — Thin / wrong hub pages — Impact: **Medium–High**

Live `/services/fence-repair/` before expansion:

- Word count: **206**
- Meta description still said “wood fence installation”
- No canonical
- No schema
- Essentially a city-link directory

### Cause E — City-page near-duplicates — Impact: **Medium** (crawl budget + quality)

`/services/wood-fence-installation-sacramento/` vs `/services/wood-fence-installation-roseville/`:

- Word count each: **724**
- After replacing city names with `CITY`: **100% character similarity**
- No canonical tags
- 0 images on page
- Template body reused across the grid

### Cause F — Host consistency — Impact: **Low–Medium**

- Preferred live host: **non-www** (`https://www.twinriversfence.com/` redirects to `https://twinriversfence.com/`)
- Canonicals on homepage already used non-www
- New assets were corrected to non-www to match

---

## 3. Page-by-Page Analysis

### 3.1 Affected URLs (GSC list) — Pre-fix vs Post-fix

| Page | Pre word count | Pre unique? | Pre schema | Pre FAQ | Pre internal links TO page | Post word count | Post schema |
|------|----------------|-------------|------------|---------|----------------------------|-----------------|-------------|
| Fence Installation `/fence-installation/` | 5902* (*homepage clone*) | 0% unique | None | No | **0** | **721** | Service + FAQ + Breadcrumb |
| Fence Repair `/fence-repair/` | 5902* | 0% | None | No | **0** | **684** | Service + FAQ + Breadcrumb |
| Gate Installation `/gate-installation/` | 5902* | 0% | None | No | **0** | **667** | Service + FAQ + Breadcrumb |
| Custom Fence Design `/custom-fence-design/` | 5902* | 0% | None | No | **0** | **661** | Service + FAQ + Breadcrumb |
| Fence Staining `/fence-staining/` | 5902* | 0% | None | No | **0** | **661** | Service + FAQ + Breadcrumb |
| Retaining Wall `/retaining-wall/` | 5902* | 0% | None | No | **0** | **673** | Service + FAQ + Breadcrumb |
| Deck & Patio `/deck-patio/` | 5902* | 0% | None | No | **0** | **658** | Service + FAQ + Breadcrumb |

\*Word count reflected full homepage text served at the wrong URL—not unique service content.

### 3.2 Content checklist (post-fix, each of 7)

| Signal | Status |
|--------|--------|
| Unique H1 | Yes |
| Self-referencing canonical | Yes (`https://twinriversfence.com/{slug}/`) |
| Meta robots `index, follow` | Yes |
| Images | Decorative/layout only (no Unsplash hero yet) — **remaining gap** |
| Internal links (nav + related + footer) | Yes |
| External links | Minimal (phone / optional Google) |
| Heading hierarchy | H1 → H2 sections → FAQ |
| FAQ present | Yes (4 each) + FAQPage schema |
| Testimonials / EEAT | License #1089233, 40+ years, Google reviews CTA |
| Project examples | Local scenario sections added |
| City-specific references | Sacramento Valley / foothill cities named |
| CTAs | Call + `/#contact` + `/reviews/` |

### 3.3 Related hubs (also indexation-sensitive)

| URL | Pre words | Post words | Notes |
|-----|-----------|------------|-------|
| `/services/fence-repair/` | 206 | **~1052** | Canonical + Service/FAQ schema + unique copy |
| `/services/gate-installation/` | 206 | **~817** | Same treatment |
| `/services/wood-fence-installation/` | 209 | **~825** | Meta no longer wrongly generic |
| `/services/vinyl-fence-installation/` | thin | **~811** | Expanded |
| `/services/chain-link-fence-installation/` | thin | **~816** | Expanded |
| `/services/privacy-fence-installation/` | thin | **~811** | Expanded |
| `/services/` hub | 408 | unchanged this pass | Hub links to services |
| `/property-improvement/fence-repair/` | 288 | → **301 → `/fence-repair/`** | Cannibalization fix |
| `/property-improvement/gate-installation/` | 288 | → **301 → `/gate-installation/`** | Cannibalization fix |
| `/property-improvement/deck-installation/` | 288 | → **301 → `/deck-patio/`** | Cannibalization fix |

### 3.4 Exact canonicals (post-fix)

```html
<link rel="canonical" href="https://twinriversfence.com/fence-installation/">
<link rel="canonical" href="https://twinriversfence.com/fence-repair/">
<link rel="canonical" href="https://twinriversfence.com/gate-installation/">
<link rel="canonical" href="https://twinriversfence.com/custom-fence-design/">
<link rel="canonical" href="https://twinriversfence.com/fence-staining/">
<link rel="canonical" href="https://twinriversfence.com/retaining-wall/">
<link rel="canonical" href="https://twinriversfence.com/deck-patio/">
```

Homepage remains:

```html
<link rel="canonical" href="https://twinriversfence.com/">
```

---

## 4. Technical Issues Found

| Check | Finding | Severity |
|-------|---------|----------|
| robots.txt | Cloudflare managed allow-all for Googlebot; repo lacked a first-party file (SPA risk). Live body also showed HTML appended in one fetch (CDN/edge quirk). | Medium |
| sitemap.xml | Cross-domain `twinriversllc.org` URLs; missing service landings; no lastmod | High |
| XML coverage | Affected service URLs **not listed** | High |
| Canonicals | Phantom pages canonicalized to `/` | High |
| Meta robots | None on homepage (OK); phantoms inherited homepage | — |
| X-Robots-Tag | Not present on sampled GETs | OK |
| Duplicate URLs | Soft 404 duplicates of `/` | High |
| Trailing slash | Mixed on older hubs (`/fencing/sacramento` vs `/fencing/sacramento/`) | Medium |
| www / non-www | www → non-www | OK after aligning assets |
| HTTP → HTTPS | HTTPS live | OK |
| Orphan pages | Service cards unlinked; phantoms orphaned | High |
| Crawl depth | Services not in primary nav/footer | High |
| Soft 404s | Confirmed via nonsense URL test | High |
| Hidden noindex | Not found on sampled pages | OK |
| JS rendering | Homepage is SSR HTML (good); heavy GSAP may affect CWV | Medium |
| Redirect chains | SPA 200 rewrite (worst form of “chain”) | High |
| Sitemap lastmod | Missing → added `2026-07-21` | Fixed |

---

## 5. Content Issues Found

1. **No unique service landings** at the URLs Google associated with services.  
2. **Homepage service section was unlinked marketing copy.**  
3. **City landing templates are near-duplicates (100% after city swap)** — harms quality scoring and wastes crawl budget.  
4. **Hub pages reused wood-fence meta descriptions** for repair/gates.  
5. **Stock Unsplash imagery** on homepage; city/service templates often **0 images**.  
6. **Weak EEAT on secondary templates** (generic Inter-font pages vs branded homepage).  
7. **Property-improvement pages duplicated** fence repair / gates / decks with thin copy (~288 words).

---

## 6. Internal Linking Analysis

### Pre-fix: links TO affected pages

| Target | Links from `/` | Links from `/services/` | Links from footer | Total found in primary crawl sample |
|--------|----------------|-------------------------|-------------------|-------------------------------------|
| `/fence-installation/` | 0 | 0 | 0 | **0** |
| `/fence-repair/` | 0 | 0 | 0 | **0** |
| `/gate-installation/` | 0 | 0 | 0 | **0** |
| `/custom-fence-design/` | 0 | 0 | 0 | **0** |
| `/fence-staining/` | 0 | 0 | 0 | **0** |
| `/retaining-wall/` | 0 | 0 | 0 | **0** |
| `/deck-patio/` | 0 | 0 | 0 | **0** |

### Post-fix: links TO `/fence-installation/` (representative)

| Source | Anchor / placement |
|--------|--------------------|
| `index.html` “What we do” card | “Fence Installation” |
| `index.html` footer | “Installation” |
| `index.html` JSON-LD OfferCatalog | Service URL |
| Each sibling service page nav | “Installation” |
| Each sibling footer | “Fence Installation” |
| Hub pages related lists | “New fence installation” etc. |
| `sitemap.xml` | Priority 0.95 |

Same pattern applied for the other six landings (nav + footer + related + sitemap).

### Homepage city tags

Converted to crawlable links where city pages exist, e.g.:

- `/fencing/sacramento/`, `/fencing/roseville/`, `/fencing/rocklin/`, `/fencing/folsom/`, `/fencing/elk-grove/`, `/fencing/auburn/`, `/fencing/grass-valley/`, `/fencing/nevada-city/`, `/fencing/lincoln/`, `/fencing/alta-sierra/`, `/fencing/citrus-heights/`

---

## 7. Duplicate Content Analysis

| Pair / set | Similarity evidence | Risk |
|------------|---------------------|------|
| Any phantom service URL vs `/` | **Identical HTML** (114962 bytes) | Critical (fixed by real pages + removing SPA) |
| Wood fence Sacramento vs Roseville | **100%** after city-name normalization | High (remaining) |
| Full city × service matrix | Same template engine | High (remaining) |
| `/services/fence-repair/` vs `/property-improvement/fence-repair/` | Overlapping intent, thin PI page | High (301 consolidation) |
| `/services/gate-installation/` vs `/property-improvement/gate-installation/` | Same | High (301) |
| `/deck-patio/` vs `/property-improvement/deck-installation/` | Same | High (301) |

---

## 8. Cannibalization Analysis

| Keyword / intent | Competing URLs | Resolution |
|------------------|---------------|------------|
| Fence installation (generic) | Soft `/fence-installation/` + `/services/wood-fence-installation/` + `/fencing/{city}/` | New `/fence-installation/` is pillar; city pages should support locally |
| Fence repair | Soft `/fence-repair/` + `/services/fence-repair/` + `/property-improvement/fence-repair/` + city repair URLs | Pillar `/fence-repair/`; hub for cities; PI → 301 |
| Gate installation | Soft `/gate-installation/` + `/services/gate-installation/` + PI gate | Same pattern |
| Deck / patio | Soft `/deck-patio/` + PI deck | Pillar `/deck-patio/`; PI → 301 |

**Remaining risk:** dozens of city service URLs still compete with nearly identical copy. They should either be uniquely rewritten or consolidated/noindexed selectively after traffic review.

---

## 9. Schema Analysis

### Pre-fix

| Page | Schema |
|------|--------|
| Homepage | **None** |
| Phantom service URLs | None (homepage HTML) |
| City service pages | Minimal `FenceContractor` JSON-LD (present) |
| Property-improvement pages | **None** |

### Post-fix

| Page | Types added |
|------|-------------|
| Homepage | `FenceContractor` (LocalBusiness-class) + `Organization` + OfferCatalog of services |
| Each of 7 pillars | `Service` + `FAQPage` + `BreadcrumbList` |
| Service hubs | `Service` + `FAQPage` |

**Still missing / optional:** `Review` aggregate rating markup (only if review count/rating are accurate and policy-compliant), `ImageObject` for real project photos, `WebSite` + `SearchAction` (low priority for this lead-gen site).

---

## 10. Every Fix Implemented

| # | Fix | Impact |
|---|-----|--------|
| 1 | Removed Netlify `/* → /index.html` **200** SPA rewrite | **High** |
| 2 | Added `404.html` with `noindex` for true missing URLs | **High** |
| 3 | Created unique pages for all 7 affected service URLs (650–721 words, FAQs, EEAT, local examples) | **High** |
| 4 | Self-referencing canonicals + `index,follow` on those pages | **High** |
| 5 | Rebuilt `sitemap.xml` on `twinriversfence.com` only, with `lastmod`, including pillars + hubs + city URLs (134 entries) | **High** |
| 6 | Added first-party `robots.txt` with Sitemap directive | **Medium** |
| 7 | Linked homepage service cards + staining/retaining/services | **High** |
| 8 | Expanded homepage footer with service links | **High** |
| 9 | Added homepage LocalBusiness/Organization JSON-LD | **Medium** |
| 10 | Converted major city tags to internal links | **Medium** |
| 11 | Fixed empty `photo-bg` alt attributes on homepage | **Low–Medium** |
| 12 | Expanded 6 `/services/*` hubs (~800–1050 words), fixed metas, added canonical + schema | **High** |
| 13 | 301 `/property-improvement/{fence-repair,gate-installation,deck-installation}/` → pillars | **High** |
| 14 | Aligned all new assets to **non-www** host | **Medium** |
| 15 | Generator script `scripts/seo-fix-service-pages.mjs` for reproducibility | Low (ops) |

---

## 11. Remaining Manual Recommendations

| Priority | Action | Why | Impact |
|----------|--------|-----|--------|
| P0 | **Deploy** these changes to Netlify production | Fixes are local until published | **High** |
| P0 | In GSC: **resubmit sitemap** `https://twinriversfence.com/sitemap.xml` | Replaces contaminated map | **High** |
| P0 | In GSC: **URL Inspection → Request indexing** for each of the 7 pillars | Speeds recrawl after soft-404 history | **High** |
| P0 | Confirm live: nonsense URL returns **404**, `/fence-installation/` returns unique H1 | Validates SPA removal | **High** |
| P1 | Rewrite city pages with unique local proof (permits, soil, HOA notes, real photos) or consolidate low-value cities | 100% template dupes still exist | **High** |
| P1 | Replace Unsplash/homepage stock with **real Twin Rivers project photos** on pillars | Competitors (e.g. S&S Fence) lead with owned photography | **Medium** |
| P1 | Add NAP block (street if public) consistently in footer sitewide | Local pack / EEAT | **Medium** |
| P2 | Audit `twinriversllc.org` — 301 to fence domain or separate GSC property cleanly | Cross-domain sitemap confusion | **High** if both crawlable |
| P2 | Trailing-slash normalization redirects for `/fencing/{city}` without slash | Crawl consistency | **Low–Medium** |
| P2 | PageSpeed: defer/split GSAP, compress hero canvas work | CWV can suppress competitive rankings even when indexed | **Medium** |
| P2 | Validate JSON-LD in Google Rich Results Test after deploy | Catch syntax/policy issues | **Medium** |
| P3 | Consider FAQ + process videos on pillars | Media richness vs competitors | **Low** |

---

## 12. Estimated Impact of Each Fix

| Fix | Est. impact on indexing | Est. impact on rankings |
|-----|-------------------------|-------------------------|
| Remove SPA soft 404 | **High** | Enables any ranking |
| Real unique service pages | **High** | **High** for head terms |
| Internal links from homepage/footer | **High** | **Medium–High** |
| Sitemap host + coverage fix | **High** | **Medium** |
| Hub expansion + correct metas | **Medium–High** | **Medium** |
| Schema (LocalBusiness/Service/FAQ) | **Medium** | **Medium** (rich results / understanding) |
| Property-improvement 301s | **Medium** | **Medium** (authority consolidation) |
| Image alts / city tag links | **Low–Medium** | **Low–Medium** |
| City-page unique rewrites (pending) | **High** (quality) | **High** for local modifiers |

---

## Competitor Snapshot (Sacramento fencing)

Compared against **S&S Fence** (`ssfence.com` / sacramento-fence positioning):

| Competitor includes | Twin Rivers before | Twin Rivers after |
|---------------------|--------------------|-------------------|
| Clear service messaging | Soft 404s | Real pillars |
| Real project photography | Mostly stock | Still mostly stock (**manual**) |
| Longevity / license trust | Present on home | Extended to pillars |
| Photo-based estimate UX | Strong on S&S | Calculator on home; not on pillars yet |
| Specialty commercial niches listed | Partial | Commercial section + commercial projects |
| Deep unique local pages | Twin Rivers had many URLs but **duplicate** | Hubs improved; city uniqueness still weak |
| FAQ / schema depth | Weak | Added on pillars + hubs |

---

## Deploy & Verification Checklist

1. Deploy Netlify publish of this repo.  
2. Live tests (must pass):

```text
GET /asdf-not-a-real-page-xyz/     → 404 (not homepage)
GET /fence-installation/           → 200, H1 about installation, canonical self
GET /fence-repair/                 → unique page
GET /sitemap.xml                   → only twinriversfence.com hosts
GET /robots.txt                    → Allow + Sitemap line (plus any Cloudflare managed block)
GET /property-improvement/fence-repair/ → 301 → /fence-repair/
```

3. GSC → Sitemaps → submit `https://twinriversfence.com/sitemap.xml`  
4. Request indexing on the 7 pillars  
5. Re-check “Crawled – currently not indexed” in 1–3 weeks (status can lag)

---

## Final Summary of Code Changes

- `netlify.toml` — removed SPA 200 rewrite; added property-improvement 301s  
- `404.html`, `robots.txt`, `sitemap.xml` — new/rewritten  
- `fence-installation/`, `fence-repair/`, `gate-installation/`, `custom-fence-design/`, `fence-staining/`, `retaining-wall/`, `deck-patio/` — new indexable landings  
- `index.html` — schema, linked services, footer, alts, city links  
- `services/{wood,vinyl,chain-link,privacy,fence-repair,gate-installation}/index.html` — expanded + canonical + schema  
- `scripts/seo-fix-service-pages.mjs` — generator for pillars/sitemap/robots/404  

**Static site:** no compile step beyond publishing files. Validate HTML presence of routes by confirming each `*/index.html` exists (verified during implementation).

---

*Prepared as a technical SEO engineering audit with live-fetch evidence. Indexing recovery requires production deploy + GSC recrawl; code alone does not update Google’s index.*
