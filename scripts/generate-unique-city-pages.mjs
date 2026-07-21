/**
 * Regenerate uniquely composed city×service and fencing city pages.
 * Run: node scripts/generate-unique-city-pages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  cities,
  services,
  seededPick,
  hashVariant,
} from "./seo-city-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const NODE =
  process.env.NODE ||
  path.join(
    root,
    ".tools/node/extract/node-v22.17.0-win-x64/node.exe"
  );

const css = `
:root{--gold:#d4a853;--gold-b:#e8bb60;--bg:#0a0a0a;--panel:#12141a;--soft:rgba(255,255,255,.7);--line:rgba(255,255,255,.1)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.7}
a{color:var(--gold)}
.top{position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;justify-content:space-between;align-items:center;padding:.85rem 5vw;background:rgba(10,10,10,.94);border-bottom:1px solid var(--line);backdrop-filter:blur(10px)}
.brand{color:#fff;text-decoration:none;font-weight:700;letter-spacing:.03em}
.top nav{display:flex;flex-wrap:wrap;gap:.75rem 1rem;font-size:.9rem}
.top nav a{color:rgba(255,255,255,.82);text-decoration:none}
.top nav a:hover{color:var(--gold-b)}
.hero{padding:4.5rem 5vw 2.5rem;background:radial-gradient(ellipse 70% 55% at 20% 0%,rgba(212,168,83,.16),transparent 55%),linear-gradient(180deg,#141414,var(--bg))}
.crumbs{font-size:.85rem;color:rgba(255,255,255,.55);margin-bottom:1rem}
.crumbs a{color:rgba(255,255,255,.75);text-decoration:none}
.tag{color:var(--gold);text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;font-weight:700}
.hero h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.8rem,4.5vw,3rem);line-height:1.15;margin:.55rem 0 1rem;max-width:22ch}
.lead{color:var(--soft);max-width:68ch;font-size:1.05rem}
.eeat{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.65rem;margin:1.35rem 0 1.5rem}
.eeat div{background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:.75rem .9rem;font-size:.88rem;color:var(--soft)}
.eeat strong{display:block;color:#fff;margin-bottom:.15rem}
.btn{display:inline-block;background:var(--gold);color:#111;text-decoration:none;font-weight:700;padding:.75rem 1.1rem;border-radius:3px}
.btn.alt{background:transparent;border:1px solid var(--gold);color:var(--gold);margin-left:.4rem}
main{padding:0 5vw 3rem;max-width:920px}
.block{padding:1.75rem 0;border-bottom:1px solid var(--line)}
.block h2{font-family:Georgia,serif;font-size:1.45rem;margin-bottom:.7rem}
.block h3{font-size:1.08rem;margin:1rem 0 .4rem;color:#fff}
.block p,.block li{color:var(--soft)}
.block ul{margin:.5rem 0 .5rem 1.2rem}
.block li{margin:.25rem 0}
.media{margin:1rem 0;border-radius:6px;overflow:hidden;border:1px solid var(--line);background:#1a1a1a}
.media img{display:block;width:100%;height:auto;min-height:180px;object-fit:cover;background:linear-gradient(135deg,#1a1a1a,#2a2418)}
.media figcaption{font-size:.82rem;color:rgba(255,255,255,.5);padding:.55rem .75rem}
.faq details{background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:.9rem 1rem;margin:.55rem 0}
.faq summary{cursor:pointer;font-weight:600}
.faq p{margin-top:.55rem;color:var(--soft)}
.related{display:grid;gap:.4rem;list-style:none;margin-top:.75rem}
.cta-band{margin:1.75rem 0 0;padding:1.4rem;border:1px solid rgba(212,168,83,.35);border-radius:6px;background:linear-gradient(135deg,rgba(212,168,83,.14),rgba(255,255,255,.03))}
footer{padding:2rem 5vw;border-top:1px solid var(--line);color:rgba(255,255,255,.55);font-size:.9rem}
footer a{margin-right:.8rem;color:rgba(255,255,255,.75);text-decoration:none}
@media(max-width:700px){.btn.alt{margin-left:0;margin-top:.5rem;display:inline-block}}
`;

const unsplash = [
  "https://images.unsplash.com/photo-1604015641586-6fa03629f976?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1593285247650-cd7bb44adcfd?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1586574208875-cd77c2bfb851?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1645791498650-2509fad63992?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleVariants(city, service, v) {
  const c = city.name;
  const s = service.name;
  const opts = [
    `${s} in ${c}, CA | Twin Rivers Fence`,
    `${c} ${s} | Licensed Local Crew | Twin Rivers`,
    `Professional ${s} for ${c} Homes | Twin Rivers Fence`,
    `${s} Near ${c} | Twin Rivers Fence (#1089233)`,
  ];
  return opts[v % opts.length];
}

function metaVariants(city, service, v) {
  const c = city.name;
  const s = service.short;
  const opts = [
    `Twin Rivers Fence provides ${s} service in ${c} and nearby ${city.region} communities. Licensed #1089233. Free on-site estimates—call (916) 906-2254.`,
    `Need ${s} work in ${c}? Local crews familiar with ${city.county} soils, HOAs, and yard layouts. Twin Rivers Fence · License #1089233.`,
    `${c} ${s} built for local climate and lot conditions. Privacy, repairs, and gates with clear scopes. Twin Rivers Fence.`,
    `From ${city.neighborhoods[0]} to nearby ${city.nearby[0]}, Twin Rivers handles ${s} projects with licensed Northern California crews.`,
  ];
  return opts[v % opts.length];
}

function h1Variants(city, service, v) {
  const opts = [
    `${service.name} in ${city.name}, California`,
    `${city.name} ${service.name} Built for Local Lots`,
    `${service.name} for ${city.name} Homes & Properties`,
    `Reliable ${service.name} Across ${city.name}`,
  ];
  return opts[v % opts.length];
}

function introFor(city, service, v) {
  const n1 = city.neighborhoods[0];
  const n2 = city.neighborhoods[1];
  const near = city.nearby.slice(0, 2).join(" and ");
  if (city.uniqueParagraphs?.length) {
    const u = city.uniqueParagraphs[hashVariant(city.slug + service.key + "intro", city.uniqueParagraphs.length)];
    return `${u} For ${service.short} work here, Twin Rivers plans around ${city.region} conditions and your ${n1} or ${n2} layout.`;
  }
  const intros = [
    `Twin Rivers Fence installs and supports ${service.short} projects throughout ${city.name}, including ${n1} and ${n2}. Properties here sit in ${city.region}, where ${city.soil} That local context shapes how we set posts, plan gates, and sequence the job.`,
    `Homeowners in ${city.name} call Twin Rivers when they need ${service.short} work that fits ${city.county} conditions—not a generic one-size template. We regularly serve ${n1}, ${n2}, and nearby ${near}, with scopes written around your actual grade, access, and privacy goals.`,
    `Looking for ${service.short} help in ${city.name}? Twin Rivers Fence brings licensed Northern California crews (#1089233) who already work ${city.region} lots. From ${n1} to the edges toward ${city.nearby[0]}, we plan materials and post depth for how yards here actually behave through the year.`,
  ];
  return intros[v % intros.length];
}

function sectionNeighborhoods(city, service) {
  const list = city.neighborhoods
    .map((n) => `<li>${esc(n)}</li>`)
    .join("");
  return {
    h2: `${service.name} across ${city.name} neighborhoods`,
    html: `<p>We work residential and light commercial sites across ${esc(city.name)}, including:</p><ul>${list}</ul><p>If your street is near ${esc(city.nearby[0])} or ${esc(city.nearby[1])}, we can usually include it on the same scheduling route as other ${esc(city.region)} jobs.</p>`,
  };
}

function sectionNearby(city, service) {
  const links = city.nearby
    .map((n) => {
      const slug = Object.values(cities).find((c) => c.name === n)?.slug;
      if (slug && services[service.key]) {
        return `<li><a href="/services/${service.key}-${slug}/">${esc(service.name)} in ${esc(n)}</a></li>`;
      }
      return `<li>${esc(n)}</li>`;
    })
    .join("");
  return {
    h2: `Nearby communities we also serve from ${city.name}`,
    html: `<p>${esc(city.name)} projects often connect with neighboring towns in ${esc(city.county)} and beyond:</p><ul>${links}</ul><p>That routing experience helps us plan material drops and multi-day installs efficiently.</p>`,
  };
}

function sectionTrends(city, service) {
  return {
    h2: `Local ${service.short} trends in ${city.name}`,
    html: `<p>${esc(city.trends)}</p><p>${esc(service.styleBlurb)} In ${esc(city.name)}, that usually means balancing ${esc(city.climate)}</p>`,
  };
}

function sectionStyles(city, service) {
  const styles = seededPick(
    city.slug + service.key + "styles",
    city.styles,
    Math.min(4, city.styles.length)
  );
  return {
    h2: `Common fence styles we see in ${city.name}`,
    html: `<p>Popular choices for ${esc(city.name)} properties include:</p><ul>${styles.map((s) => `<li>${esc(s)}</li>`).join("")}</ul><p>For ${esc(service.name).toLowerCase()}, we also specify ${service.materials.map(esc).join(", ")} based on the look and durability you want.</p>`,
  };
}

function sectionPermits(city, service) {
  return {
    h2: `Permits & guidelines for ${city.name} fencing`,
    html: `<p>${esc(city.permits)}</p><p>For ${esc(service.short)} projects, we review height, street visibility, and any HOA notes before locking materials—so you are not surprised mid-install. Related reading: <a href="/permits/fence-permit-${city.slug}/">fence permit notes for ${esc(city.name)}</a> and <a href="/cost/fence-installation-cost-${city.slug}/">${esc(city.name)} fence cost context</a>.</p>`,
  };
}

function sectionProjects(city, service, v) {
  const ideas = seededPick(city.slug + service.key + "proj", city.projectIdeas, 2);
  const extra = [
    `A ${service.short} scope on a ${city.name} lot where ${city.soil.split("—")[0].toLowerCase()} required adjusting post depth mid-run.`,
    `Coordinating ${service.short} work in ${city.neighborhoods[v % city.neighborhoods.length]} around existing landscaping and gate clearances.`,
  ];
  return {
    h2: `Example ${service.short} project scenarios in ${city.name}`,
    html: `<p>These are realistic project types we plan for in ${esc(city.name)}—illustrative scenarios based on common local conditions, not fabricated customer testimonials:</p><ul>${[...ideas, extra[v % 2]].map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p>During your on-site visit we photograph conditions and write a scope tied to your property—not a generic package.</p>`,
  };
}


const uniqueH2Templates = [
  (city) => `Working on ${city.name} lots`,
  (city) => `What changes on ${city.name} job sites`,
  (city) => `Fence realities in ${city.name} neighborhoods`,
  (city) => `${city.name} yards we see on estimates`,
  (city) => `Local context for ${city.name} installs`,
  (city) => `How ${city.name} properties shape the run`,
];

function eeatHtml(city, seed) {
  const sets = city.eeatSets || [
    [
      ["License #1089233", "California contractor"],
      ["40+ Years", "Fencing experience"],
      ["Local crews", city.region],
      ["Free estimate", "On-site scoping"],
    ],
  ];
  const set = sets[hashVariant(city.slug + seed + "eeat", sets.length)];
  return set
    .map(
      ([strong, text]) =>
        `<div><strong>${esc(strong)}</strong>${esc(text)}</div>`
    )
    .join("\n    ");
}

function footerTagline(city, seed) {
  const opts = city.footerTaglines || [
    `Twin Rivers LLC · License #1089233 · Serving ${city.name} & ${city.region}`,
  ];
  return opts[hashVariant(city.slug + seed + "foot", opts.length)];
}

function uniqueParagraphSections(city, service, seed) {
  const paras = city.uniqueParagraphs || [];
  if (paras.length < 2) return [];
  const picks = seededPick(
    city.slug + service.key + seed + "uniq",
    paras,
    2
  );
  return picks.map((p, i) => {
    const h2 =
      uniqueH2Templates[
        hashVariant(city.slug + service.key + seed + "h2" + i, uniqueH2Templates.length)
      ](city);
    return { h2, html: `<p>${esc(p)}</p>` };
  });
}

function processBodyFor(city, service, v) {
  const wraps = [
    (p) => p,
    (p) => `After a ${city.name} site walk, ${p.charAt(0).toLowerCase()}${p.slice(1)}`,
    (p) => `${p} That sequence is adjusted for ${city.region} access, gates, and footing.`,
  ];
  return wraps[hashVariant(city.slug + service.key + "pw" + (v ?? 0), wraps.length)](service.process);
}

function sectionProcess(city, service, v) {
  const clauses = city.processClauses || [
    `On ${city.name} sites we account for local soil and access, then `,
  ];
  const clause = clauses[hashVariant(city.slug + service.key + (v ?? 0) + "proc", clauses.length)];
  return {
    h2: service.processTitle + ` in ${city.name}`,
    html: `<p>${esc(clause)}${esc(processBodyFor(city, service, v))}</p><p>${esc(city.uniqueParagraphs?.[hashVariant(city.slug + service.key + "proc2", city.uniqueParagraphs.length)] || city.soil)}</p>`,
  };
}

function sectionWhy(city, service, v) {
  const whyLead =
    city.uniqueParagraphs?.[
      hashVariant(city.slug + service.key + "why" + (v ?? 0), city.uniqueParagraphs.length)
    ] ||
    `Crews that already work ${city.region} understand how local yards drain and dry.`;
  const trust = [
    `<p>${esc(whyLead)} Licensed contractor <strong>#1089233</strong> with 40+ years of fencing experience serves ${esc(city.name)} with clear scopes—not generic flyer pricing.</p>`,
    `<p>${esc(whyLead)} You get repair-versus-replace honesty, ${esc(city.county)}-aware footing choices, and ${esc(service.short)} installs scoped to your property.</p>`,
    `<p>${esc(whyLead)} Twin Rivers (#1089233) routes ${esc(city.region)} jobs weekly; read <a href="/reviews/">reviews</a> or <a href="/projects/">projects</a> before you book.</p>`,
  ];
  return {
    h2: `Why ${city.name} homeowners call Twin Rivers for ${service.short}`,
    html: trust[hashVariant(city.slug + service.key + "trust", trust.length)],
  };
}

function sectionClimate(city, service) {
  return {
    h2: `${city.name} climate & site conditions that affect ${service.short} work`,
    html: `<p>${esc(city.climate)}</p><p>We factor sun orientation, irrigation edges, and slope into material and footing choices for ${esc(service.name).toLowerCase()} so the line stays straighter longer.</p>`,
  };
}

function sectionFieldNotes(city, service, seed) {
  const h2Opts = [
    `Field notes for ${city.name} ${service.name}`,
    `What we check on ${city.name} ${service.name} jobs`,
    `${city.name} site checklist for ${service.name}`,
  ];
  const h2 = h2Opts[hashVariant(seed + "fieldH2", h2Opts.length)];
  const mats = service.materials.map(esc).join(", ");
  const n0 = esc(city.neighborhoods[0]);
  let uniqueSent = "";
  if (city.uniqueParagraphs?.length) {
    uniqueSent =
      city.uniqueParagraphs[
        hashVariant(city.slug + service.key + "fieldUniq", city.uniqueParagraphs.length)
      ];
  }
  const parts = [
    `On ${esc(service.name).toLowerCase()} visits in ${esc(city.name)}, we start at ${n0} and trace the proposed run while noting ${esc(city.soil)}`,
    `Seasonal patterns matter too: ${esc(city.climate)}`,
    `For this ${esc(service.short)} scope we usually specify ${mats}, then adjust post depth and hardware if irrigation, roots, or hardpan show up mid-dig.`,
    `${esc(uniqueSent)}`,
    `That combination—${esc(city.name)} soil, ${esc(service.name).toLowerCase()} materials, and your ${n0} layout—is why we write field notes before ordering lumber or panels so the crew arrives with the right lengths and brackets.`,
  ];
  const body = parts.join(" ");
  return { h2, html: `<p>${body}</p>` };
}

function buildFaqs(city, service, v) {
  const coda = [
    ` In ${city.name}, we also plan around ${city.neighborhoods[0]} access and ${city.region} weather.`,
    ` For ${city.name} lots, post depth often follows ${city.soil.split("—")[0].toLowerCase()}.`,
    ` Nearby ${city.nearby[0]} and ${city.nearby[1] || city.nearby[0]} jobs use the same licensed Twin Rivers crews.`,
  ];
  const base = service.faqSeeds.map(([q, a], i) => ({
    q: `${q.replace(/\?$/, "")} in ${city.name}?`,
    a: a + coda[i % coda.length],
  }));
  const local = [
    {
      q: `Which ${city.name} neighborhoods do you serve for ${service.short}?`,
      a: `We regularly work ${city.neighborhoods.slice(0, 3).join(", ")}, and nearby ${city.nearby[0]}. Call with your address if you are unsure.`,
    },
    {
      q: `How do ${city.name} soils affect ${service.short} pricing?`,
      a: `${city.soil} Rocky or irrigated soft spots can add dig time; we note that on the written scope after seeing the yard.`,
    },
    {
      q: `Do HOAs or design guidelines in ${city.name} change ${service.short} options?`,
      a: `Where guidelines apply, they can limit height, color, and street-facing style. Share your packet and we design to it before ordering materials.`,
    },
  ];
  const pool = [...base, ...local];
  return seededPick(city.slug + service.key + "faq" + v, pool, 4);
}

function relatedLinks(city, service) {
  const others = Object.keys(services).filter((k) => k !== service.key);
  const picks = seededPick(city.slug + "rel", others, 3);
  const links = [
    [`${service.pillar}`, `${service.name.replace(" Installation", "").replace("Fence Repair", "Fence repair")} overview`],
    [`/fencing/${city.slug}/`, `All fencing in ${city.name}`],
    [`/services/${service.key}/`, `${service.name} by city`],
    ...picks.map((k) => [
      `/services/${k}-${city.slug}/`,
      `${services[k].name} in ${city.name}`,
    ]),
    [`/fence-installation/`, "Fence installation"],
    [`/fence-repair/`, "Fence repair"],
    [`/gate-installation/`, "Gate installation"],
    [`/reviews/`, "Customer reviews"],
    [`/#contact`, `Contact Twin Rivers`],
  ];
  // unique by href
  const seen = new Set();
  return links.filter(([href]) => {
    if (seen.has(href)) return false;
    seen.add(href);
    return true;
  });
}

function ctaBlock(city, service, v) {
  const lines = [
    `<h2>${esc(city.cta)}</h2><p>Tell us about your ${esc(city.name)} ${esc(service.short)} project—footage, gates, and access. We will schedule an on-site estimate with a licensed Twin Rivers crew.</p>`,
    `<h2>Ready for a clear ${esc(city.name)} ${esc(service.short)} scope?</h2><p>Call (916) 906-2254 or request a quote online. We serve ${esc(city.neighborhoods[0])} and the wider ${esc(city.region)}.</p>`,
    `<h2>Plan your ${esc(service.name).toLowerCase()} in ${esc(city.name)}</h2><p>Local posts, honest recommendations, and clean installs. ${esc(city.cta)} today.</p>`,
  ];
  return lines[v % lines.length];
}

function pageHtml(city, service) {
  const seed = `${city.slug}|${service.key}`;
  const v = hashVariant(seed, 97);
  const title = titleVariants(city, service, v);
  const description = metaVariants(city, service, v);
  const h1 = h1Variants(city, service, v);
  const intro = introFor(city, service, v);
  const imgIdx = hashVariant(seed + "img", unsplash.length);
  const alt = `${service.name} — ${city.imgAltBase}`;
  const faqs = buildFaqs(city, service, v);
  const canonical = `https://twinriversfence.com/services/${service.key}-${city.slug}/`;

  let sectionFns = [
    sectionNeighborhoods,
    sectionNearby,
    sectionTrends,
    sectionStyles,
    sectionPermits,
    sectionProjects,
    sectionProcess,
    sectionWhy,
    sectionClimate,
  ];
  if (hashVariant(seed + "skC", 2) === 0) {
    sectionFns = sectionFns.filter((fn) => fn !== sectionClimate);
  }
  if (hashVariant(seed + "skN", 2) === 0) {
    sectionFns = sectionFns.filter((fn) => fn !== sectionNearby);
  }
  if (hashVariant(seed + "skP", 2) === 0) {
    sectionFns = sectionFns.filter((fn) => fn !== sectionPermits);
  }
  // Rotate starting point so heading order differs by page
  const rot = hashVariant(seed + "rot", sectionFns.length);
  const ordered = [
    ...sectionFns.slice(rot),
    ...sectionFns.slice(0, rot),
  ].map((fn) => fn(city, service, v));

  // Drop one section occasionally for structural variety (keep at least 7)
  const drop = hashVariant(seed + "drop", ordered.length);
  const drop2 = hashVariant(seed + "drop2", ordered.length);
  let sections =
    ordered.length > 8
      ? ordered.filter((_, i) => i !== drop && i !== drop2)
      : ordered.length > 7
        ? ordered.filter((_, i) => i !== drop)
        : ordered;
  const uniqSections = uniqueParagraphSections(city, service, seed);
  if (uniqSections.length) {
    const at = hashVariant(seed + "uniqAt", sections.length + 1);
    sections = [
      ...sections.slice(0, at),
      ...uniqSections,
      ...sections.slice(at),
    ];
  }

  sections = [...sections, sectionFieldNotes(city, service, seed)];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.name} in ${city.name}`,
    serviceType: service.name,
    url: canonical,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "State", name: "California" },
    },
    provider: {
      "@type": "FenceContractor",
      name: "Twin Rivers Fence",
      telephone: "+1-916-906-2254",
      url: "https://twinriversfence.com/",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Grass Valley",
        addressRegion: "CA",
        addressCountry: "US",
      },
    },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://twinriversfence.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: "https://twinriversfence.com/services/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.name,
        item: `https://twinriversfence.com${service.hub}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: city.name,
        item: canonical,
      },
    ],
  };

  const related = relatedLinks(city, service)
    .map(([href, text]) => `<li><a href="${href}">${esc(text)}</a></li>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<link rel="canonical" href="${canonical}">
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<style>${css}</style>
</head>
<body>
<header class="top">
  <a class="brand" href="/">Twin Rivers Fence</a>
  <nav aria-label="Primary">
    <a href="/fence-installation/">Installation</a>
    <a href="/fence-repair/">Repair</a>
    <a href="/gate-installation/">Gates</a>
    <a href="/services/">Services</a>
    <a href="/fencing/${city.slug}/">${esc(city.name)}</a>
    <a href="tel:+19169062254">(916) 906-2254</a>
  </nav>
</header>
<section class="hero">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/services/">Services</a> / <a href="${service.hub}">${esc(service.name)}</a> / ${esc(city.name)}</nav>
  <div class="tag">${esc(city.name)} · ${esc(city.county)}</div>
  <h1>${esc(h1)}</h1>
  <p class="lead">${esc(intro)}</p>
  <div class="eeat" aria-label="Trust signals">
    <div><strong>License #1089233</strong>California contractor</div>
    <div><strong>40+ Years</strong>Fencing experience</div>
    <div><strong>Local crews</strong>${esc(city.region)}</div>
    <div><strong>Free estimate</strong>On-site scoping</div>
  </div>
  <p><a class="btn" href="/#contact">${esc(city.cta)}</a><a class="btn alt" href="tel:+19169062254">Call (916) 906-2254</a></p>
</section>
<main>
  <figure class="media">
    <img src="${unsplash[imgIdx]}" alt="${esc(alt)}" width="1400" height="788" loading="lazy" decoding="async">
    <figcaption>${esc(service.name)} planning for ${esc(city.name)} yards — illustrative stock photo; your quote uses photos of your property.</figcaption>
  </figure>
${sections
  .map(
    (s) => `  <section class="block">
    <h2>${esc(s.h2)}</h2>
    ${s.html}
  </section>`
  )
  .join("\n")}
  <section class="block faq">
    <h2>FAQs: ${esc(service.name)} in ${esc(city.name)}</h2>
${faqs
  .map(
    (f) => `    <details>
      <summary>${esc(f.q)}</summary>
      <p>${esc(f.a)}</p>
    </details>`
  )
  .join("\n")}
  </section>
  <section class="block">
    <h2>Related ${esc(city.name)} fencing links</h2>
    <ul class="related">
${related}
    </ul>
  </section>
  <div class="cta-band">
    ${ctaBlock(city, service, v)}
    <p style="margin-top:1rem"><a class="btn" href="/#contact">Request a quote</a><a class="btn alt" href="tel:+19169062254">Call now</a></p>
  </div>
</main>
<footer>
  <div>${esc(footerTagline(city, seed))}</div>
  <div style="margin-top:.75rem">
    <a href="/fence-installation/">Installation</a>
    <a href="/fence-repair/">Repair</a>
    <a href="/gate-installation/">Gates</a>
    <a href="/services/">Services</a>
    <a href="/fencing/${city.slug}/">${esc(city.name)} fencing</a>
    <a href="/reviews/">Reviews</a>
    <a href="/projects/">Projects</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
  </div>
</footer>
</body>
</html>
`;
}

function fencingPageHtml(city) {
  const seed = `fencing|${city.slug}`;
  const v = hashVariant(seed, 53);
  const titleOpts = [
    `Fence Installation & Repair in ${city.name}, CA | Twin Rivers Fence`,
    `${city.name} Fencing Company | Twin Rivers Fence (#1089233)`,
    `Fences, Gates & Repairs in ${city.name} | Twin Rivers`,
  ];
  const title = titleOpts[v % titleOpts.length];
  const description = `Twin Rivers Fence serves ${city.name} with wood, vinyl, chain link, privacy fencing, repairs, and gates. Local crews for ${city.region}. Licensed #1089233.`;
  const canonical = `https://twinriversfence.com/fencing/${city.slug}/`;
  const serviceLinks = Object.values(services)
    .map(
      (s) =>
        `<li><a href="/services/${s.key}-${city.slug}/">${esc(s.name)} in ${esc(city.name)}</a></li>`
    )
    .join("\n");
  const nearbyLinks = city.nearby
    .map((n) => {
      const slug = Object.values(cities).find((c) => c.name === n)?.slug;
      return slug
        ? `<li><a href="/fencing/${slug}/">Fencing in ${esc(n)}</a></li>`
        : `<li>${esc(n)}</li>`;
    })
    .join("\n");
  const faqs = [
    {
      q: `What fencing services do you offer in ${city.name}?`,
      a: `Wood, vinyl, chain link, privacy fencing, repairs, and gates—scoped for ${city.region} lot conditions.`,
    },
    {
      q: `Do you work in ${city.neighborhoods[0]}?`,
      a: `Yes. We regularly serve ${city.neighborhoods.slice(0, 3).join(", ")}, and nearby ${city.nearby[0]}.`,
    },
    {
      q: `How do I get a quote in ${city.name}?`,
      a: `Call (916) 906-2254 or request a quote online. We schedule an on-site visit for accurate footage and post conditions.`,
    },
    {
      q: `Are you licensed?`,
      a: `Yes—California contractor license #1089233, with 40+ years of fencing experience.`,
    },
  ];
  const imgIdx = hashVariant(seed + "img", unsplash.length);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Fencing Services in ${city.name}`,
    serviceType: "Fence Installation and Repair",
    url: canonical,
    provider: {
      "@type": "FenceContractor",
      name: "Twin Rivers Fence",
      telephone: "+1-916-906-2254",
      url: "https://twinriversfence.com/",
    },
    areaServed: city.name + ", CA",
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<link rel="canonical" href="${canonical}">
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<style>${css}</style>
</head>
<body>
<header class="top">
  <a class="brand" href="/">Twin Rivers Fence</a>
  <nav>
    <a href="/fence-installation/">Installation</a>
    <a href="/fence-repair/">Repair</a>
    <a href="/gate-installation/">Gates</a>
    <a href="/services/">Services</a>
    <a href="tel:+19169062254">(916) 906-2254</a>
  </nav>
</header>
<section class="hero">
  <nav class="crumbs"><a href="/">Home</a> / <a href="/services/">Services</a> / ${esc(city.name)} Fencing</nav>
  <div class="tag">${esc(city.name)} · ${esc(city.county)}</div>
  <h1>Fencing services in ${esc(city.name)}, California</h1>
  <p class="lead">Twin Rivers Fence provides residential and commercial fencing across ${esc(city.name)}—from ${esc(city.neighborhoods[0])} to ${esc(city.neighborhoods[1])}—with installs and repairs planned for ${esc(city.region)} conditions. ${esc(city.soil)}</p>
  <div class="eeat">
    <div><strong>#1089233</strong>Licensed contractor</div>
    <div><strong>40+ Years</strong>Experience</div>
    <div><strong>${esc(city.region)}</strong>Local crews</div>
  </div>
  <p><a class="btn" href="/#contact">${esc(city.cta)}</a></p>
</section>
<main>
  <figure class="media">
    <img src="${unsplash[imgIdx]}" alt="Fence installation and repair services in ${esc(city.name)}, California" loading="lazy" width="1400" height="788">
    <figcaption>Fencing for ${esc(city.name)} properties — illustrative image; quotes use your site photos.</figcaption>
  </figure>
  <section class="block">
    <h2>What ${esc(city.name)} homeowners request</h2>
    <p>${esc(city.trends)}</p>
    <p>${esc(city.climate)}</p>
  </section>
  <section class="block">
    <h2>${esc(city.name)} services</h2>
    <ul class="related">
${serviceLinks}
    </ul>
  </section>
  <section class="block">
    <h2>Neighborhoods &amp; nearby</h2>
    <p>We work ${esc(city.neighborhoods.join(", "))}.</p>
    <ul>${nearbyLinks}</ul>
  </section>
  <section class="block">
    <h2>Permits &amp; planning notes</h2>
    <p>${esc(city.permits)}</p>
    <p><a href="/permits/fence-permit-${city.slug}/">Permit notes for ${esc(city.name)}</a> · <a href="/cost/fence-installation-cost-${city.slug}/">Cost context for ${esc(city.name)}</a></p>
  </section>
  <section class="block faq">
    <h2>${esc(city.name)} fencing FAQs</h2>
${faqs
  .map(
    (f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`
  )
  .join("\n")}
  </section>
  <div class="cta-band">
    <h2>${esc(city.cta)}</h2>
    <p>Call (916) 906-2254 for an on-site estimate in ${esc(city.name)}.</p>
    <p><a class="btn" href="/#contact">Request a quote</a></p>
  </div>
</main>
<footer>
  <div>Twin Rivers LLC · License #1089233 · ${esc(city.name)}</div>
  <div style="margin-top:.75rem">
    <a href="/fence-installation/">Installation</a>
    <a href="/fence-repair/">Repair</a>
    <a href="/gate-installation/">Gates</a>
    <a href="/services/">Services</a>
    <a href="/reviews/">Reviews</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
  </div>
</footer>
</body>
</html>`;
}



const SITEMAP_LASTMOD = "2026-07-21";

function writeSitemap() {
  const priorityUrls = [
    ["https://twinriversfence.com/", "1.0"],
    ["https://twinriversfence.com/fence-installation/", "0.95"],
    ["https://twinriversfence.com/fence-repair/", "0.95"],
    ["https://twinriversfence.com/gate-installation/", "0.95"],
    ["https://twinriversfence.com/custom-fence-design/", "0.9"],
    ["https://twinriversfence.com/fence-staining/", "0.85"],
    ["https://twinriversfence.com/retaining-wall/", "0.85"],
    ["https://twinriversfence.com/deck-patio/", "0.85"],
    ["https://twinriversfence.com/services/", "0.9"],
    ["https://twinriversfence.com/services/wood-fence-installation/", "0.85"],
    ["https://twinriversfence.com/services/vinyl-fence-installation/", "0.85"],
    ["https://twinriversfence.com/services/chain-link-fence-installation/", "0.85"],
    ["https://twinriversfence.com/services/privacy-fence-installation/", "0.85"],
    ["https://twinriversfence.com/services/fence-repair/", "0.85"],
    ["https://twinriversfence.com/services/gate-installation/", "0.85"],
    ["https://twinriversfence.com/fence-learning-center/", "0.8"],
    ["https://twinriversfence.com/projects/", "0.8"],
    ["https://twinriversfence.com/reviews/", "0.8"],
    ["https://twinriversfence.com/commercial-projects/", "0.8"],
  ];
  for (const city of Object.values(cities)) {
    priorityUrls.push([
      `https://twinriversfence.com/fencing/${city.slug}/`,
      "0.75",
    ]);
    for (const service of Object.values(services)) {
      priorityUrls.push([
        `https://twinriversfence.com/services/${service.key}-${city.slug}/`,
        "0.7",
      ]);
    }
  }
  const urlset = priorityUrls
    .map(
      ([loc, priority]) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${SITEMAP_LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("\n");
  fs.writeFileSync(
    path.join(root, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>
`,
    "utf8"
  );
  console.log("Wrote sitemap.xml with", priorityUrls.length, "URLs");
}

let cityServiceCount = 0;
for (const city of Object.values(cities)) {
  for (const service of Object.values(services)) {
    const dir = path.join(
      root,
      "services",
      `${service.key}-${city.slug}`
    );
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), pageHtml(city, service));
    cityServiceCount++;
  }
  // fencing pages for cities that have fencing folders (skip if we want all)
  const fdir = path.join(root, "fencing", city.slug);
  fs.mkdirSync(fdir, { recursive: true });
  fs.writeFileSync(path.join(fdir, "index.html"), fencingPageHtml(city));
}

console.log("Wrote", cityServiceCount, "city×service pages");
console.log("Wrote", Object.keys(cities).length, "fencing city pages");
writeSitemap();
console.log("Node hint:", NODE);
