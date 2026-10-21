# Google Images Optimization

**Date:** 2026-10-20  
**Status:** Safe alt-text and loading fixes implemented. No fake project photos were created. Image sitemaps were not added.

## Audit findings

City homepages use the same Unsplash fence photographs on every site:

| Unsplash ID | Used as |
| --- | --- |
| photo-1604015641586-6fa03629f976 | Wood / redwood hero |
| photo-1593285247650-cd7bb44adcfd | Vinyl panel |
| photo-1586574208875-cd77c2bfb851 | Chain-link / commercial |
| photo-1560184897-ae75f418493e | Neighborhood panorama |
| photo-1645791498650-2509fad63992 | Temporary fence / foothills |
| photo-1500382017468-9049fed747ef | Landscape |

Previous alt text claimed those photos were Roseville, Rocklin, Folsom, Elk Grove, or Granite Bay project photos. They are stock. That is a trust and Google Images risk.

Other image facts:

- `og:image` on every city site is the favicon (`/favicon-512x512.png`). That will not win social or image search.
- Sitemaps are URL-only. No image namespace. Adding Unsplash URLs to an image sitemap would ask Google to index someone else’s photos as ours.
- Responsive attributes were already present: `width`, `height`, `loading="lazy"` on below-fold photos, `decoding="async"`. Granite Bay already had `fetchpriority="high"` on the first photo.
- Lazy loading is already in the homepage templates. No broken local image files were found in `public/` (favicons only).
- Authentic Twin Rivers project photography is not stored in the city repositories.

## Implemented

Homepage alt text on all six city sites now labels stock clearly, for example:

- “Stock photo of a wood privacy fence along a residential property line”
- “Stock photo of a vinyl privacy fence in a residential yard”
- “Stock photo of a chain-link fence along a property boundary”

Homepage titles were not changed.

Filenames were not rewritten. These images are remote Unsplash URLs; renaming would not create first-party assets and would risk broken references.

## Asset request list (do this next)

Photograph real completed jobs. One clear, well-lit photo per row is more valuable than a stock library.

| Priority | Subject | Why it matters | Suggested filename after approval |
| --- | --- | --- | --- |
| 1 | Crew/truck on a job, license visible | GBP + homepage trust | `twin-rivers-crew-jobsite.jpg` |
| 2 | Wood privacy, valley tract lot | Roseville/Rocklin/Folsom/Elk Grove money terms | `wood-privacy-fence-sacramento-valley.jpg` |
| 3 | Wood fence on a slope / foothill lot | Grass Valley / Granite Bay | `wood-fence-foothill-slope.jpg` |
| 4 | Vinyl HOA fence | Folsom/Rocklin HOA queries | `vinyl-hoa-privacy-fence.jpg` |
| 5 | Chain-link side yard or commercial | Elk Grove + commercial | `chain-link-fence-commercial.jpg` |
| 6 | Side-yard walk gate | Rocklin/Roseville gate queries | `side-yard-wood-gate.jpg` |
| 7 | Driveway / automatic gate | Granite Bay + hub | `automatic-driveway-gate.jpg` |
| 8 | Repair before/after | Fence-repair pages already get impressions | `fence-repair-post-reset-before.jpg` / `-after.jpg` |
| 9 | Ranch or agricultural run | Only if the job is real | `ranch-fence-nevada-county.jpg` |
| 10 | Square 1200×1200 finished job | Replace favicon as `og:image` | `twin-rivers-og-fence.jpg` |

Rules:

- Do not invent locations in filenames or alt text. If the city is not verified, omit it.
- Keep old Unsplash URLs until first-party files are in `public/images/` and templates are updated.
- After authentic images ship, add an image sitemap for **those** files only.

## Image sitemap decision

Not implemented in this pass. Reason: the only decorative photos are third-party stock. An image sitemap would either be empty or dishonest.

When authentic files exist, extend `build.mjs` `buildSitemap()` with the image namespace for homepage and the matching service page only.

## What was not done

- No AI-generated project photos
- No Unsplash photos labeled as Twin Rivers jobs
- No URL-breaking filename changes
- No image sitemap for stock
- Lighthouse image audits were not run (no Lighthouse integration in this environment)
