# Local SEO Technical Fixes

**Date:** 2026-10-20  
**Status:** Identity bug fixed on all six city sites. Schema and NAP were audited. No private address was published.

## Production identity (verified)

One business, seven sites:

| Site | Domain | Role |
| --- | --- | --- |
| Twin Rivers hub | twinriversfence.com | Parent / GBP website |
| Grass Valley | grassvalleyfencing.com | City |
| Roseville | rosevillefencingca.com | City |
| Rocklin | rocklinfencing.com | City |
| Folsom | folsomfencing.com | City |
| Elk Grove | elkgrovefencing.com | City |
| Granite Bay | granitebayfencing.com | City |

Shared verified facts:

- Name: Twin Rivers Fence
- Phone: (916) 906-2254 / +19169062254
- License: CSLB #1089233
- Experience: 40+ years on city sites
- No public street address on city `site.js` files (locality + region + country + geo only)
- Schema: `HomeAndConstructionBusiness` + `FenceContractor`, `parentOrganization` Twin Rivers Fence
- GBP / Maps sameAs: https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6

`twinriversllc.org` is a verified GSC property with 0 clicks / 0 impressions. It is not an eighth marketing site.

## Implemented fix: false Nevada County identity

Every city `src/templates/page.js` hard-coded:

- Trust strip: “Nevada County Local”
- Contact note: “Tell us about your Nevada County fence project…”

That is true in Grass Valley and misleading in Roseville, Rocklin, Folsom, Elk Grove, and Granite Bay. It is a local-relevance bug and a trust bug.

Now:

- Grass Valley keeps **Nevada County Local**
- Other cities use **{City} Local**
- Contact note uses the city locality

Verified in built HTML:

- Roseville `/fence-repair/` → “Roseville Local”
- Rocklin `/fence-repair/` → “Rocklin Local”
- Grass Valley `/fence-repair/` → “Nevada County Local”

## Schema and footer (already correct, left in place)

- LocalBusiness `@id` is `{domain}/#localbusiness`
- Service schema points at that provider id
- `areaServed` is city-specific, not a copy of the whole network
- Footer states license, locality, and phone
- Footer “City Sites” links to the other official domains (existing, not expanded)
- Inner service-area doorway URLs on some sites are already noindexed (Roseville headers for granite-bay/lincoln/loomis)

## Remaining inconsistencies (not silently “fixed”)

| Item | Finding | Action needed |
| --- | --- | --- |
| Hours | GBP/Bing 8 AM; hub FAQ 9–5; hub footer 8–5 | Confirm one schedule |
| og:image | Favicon on every city site | Replace after authentic photo exists |
| Email | `site.email` is null | **Question:** public estimate email? |
| License address | BuildZoom shows 21030 Home Camp Rd | Do not publish unless it is a public office |
| Social sameAs | Only GBP + hub | Add Facebook/Instagram after official URLs are confirmed |
| Decks/patios in nav | Present on city sites | **Question:** are these regularly sold services? |
| Twin Rivers Fencing Maps result | Second listing in Google Maps | Confirm duplicate vs competitor |

## What was not done

- No street address added
- No extra LocalBusiness nodes per city that imply a storefront
- No homepage title/meta edits
- No index/noindex changes to existing URLs
