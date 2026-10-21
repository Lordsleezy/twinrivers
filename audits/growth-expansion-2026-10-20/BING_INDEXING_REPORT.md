# Bing Webmaster Tools and IndexNow

**Date:** 2026-10-20  
**Status:** IndexNow code is implemented locally. Bing Webmaster accounts were not created or changed.

## Domain inventory

| Domain | Repo | Google GSC | Bing indexed (public evidence) |
| --- | --- | --- | --- |
| rosevillefencingca.com | roseville-site | sc-domain, working | Not separately sampled this pass |
| rocklinfencing.com | rocklin-site | sc-domain, working | Not separately sampled this pass |
| folsomfencing.com | folsom-site | sc-domain, working | Not separately sampled this pass |
| elkgrovefencing.com | elkgrove-site | sc-domain, working | Not separately sampled this pass |
| granitebayfencing.com | granitebay-site | sc-domain, working | Not separately sampled this pass |
| grassvalleyfencing.com | grassvalley-site | sc-domain, working | Yes — homepage and fence-installation URLs in Bing SERP |
| twinriversfence.com | twinrivers | sc-domain, working | Yes — homepage, fence-repair, fence-installation, gate-installation |

No Bing Webmaster MCP exists. Indexing evidence is from a live Bing search, not an owner dashboard.

## Technical checks (city sites)

From local builds and GSC URL Inspection:

- `robots.txt` is generated as `Allow: /` plus the sitemap URL
- Roseville `/fence-repair/` and Folsom `/fence-repair/` are **Submitted and indexed** in Google, robots allowed, canonicals match
- Sitemaps are valid URL-only XML written at build time
- Canonical tags come from `site.domain` + path
- IndexNow was **not** present before this mission

## IndexNow implementation (local, not deployed)

Shared key (public by design, also stored as a key file):

`8f3a2c91e8b04d6a9c1f5e2d8a4b6c0e`

Files added:

- `{city-site}/public/8f3a2c91e8b04d6a9c1f5e2d8a4b6c0e.txt`
- `{city-site}/netlify/functions/deploy-succeeded.cjs`
- `twinrivers/8f3a2c91e8b04d6a9c1f5e2d8a4b6c0e.txt`
- `twinrivers/netlify/functions/deploy-succeeded.cjs`

Behavior:

- Runs only on Netlify **production** deploys
- Skips `*.netlify.app` preview hosts
- Submits only a small allowlist of real content URLs (home, fence-repair, gates/wood or hub equivalents)
- Can be disabled with env `INDEXNOW_NOTIFY=0`
- Key is not logged as a secret; the `.txt` file is the official public key location

This is not a submission loop. It notifies IndexNow once per production deploy for pages that this mission actually updated.

## Bing Webmaster Tools — manual steps after approval

1. Go to https://www.bing.com/webmasters
2. Sign in with the Microsoft account that should own the properties
3. Use **Import from Google Search Console** (all seven `sc-domain` properties are already verified in GSC)
4. Confirm sitemaps:
   - https://rosevillefencingca.com/sitemap.xml
   - https://rocklinfencing.com/sitemap.xml
   - https://folsomfencing.com/sitemap.xml
   - https://elkgrovefencing.com/sitemap.xml
   - https://granitebayfencing.com/sitemap.xml
   - https://grassvalleyfencing.com/sitemap.xml
   - https://twinriversfence.com/sitemap.xml
5. After the first production deploy, Bing can also pick up the IndexNow key file automatically
6. Do not add `www.` or `twinriversllc.org` as extra production properties unless you still want that unused domain monitored

## What was not done

- No Bing Webmaster login
- No sitemap submitted through Bing’s UI
- No live IndexNow pings (sites are not deployed)
- No Lighthouse or Bing webmaster API crawl
