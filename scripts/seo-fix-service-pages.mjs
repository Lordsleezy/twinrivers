/**
 * Generate high-value service landing pages + update sitemap/robots/404.
 * Run: node scripts/seo-fix-service-pages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const today = "2026-07-21"; // keep in sync with generate-unique-city-pages.mjs SITEMAP_LASTMOD

const services = [
  {
    slug: "fence-installation",
    title: "Fence Installation in Sacramento Valley | Twin Rivers Fence",
    h1: "Fence Installation Built for California Yards",
    description:
      "Professional fence installation across Sacramento, Roseville, Folsom, Rocklin, Elk Grove, Auburn, and Grass Valley. Wood, vinyl, chain link, and privacy fencing. Licensed #1089233.",
    serviceType: "Fence Installation",
    heroTag: "Fence Installation",
    intro:
      "Twin Rivers Fence installs residential and commercial fences across the Sacramento Valley and Sierra Foothills. We plan posts for your soil and slope, match HOA standards when required, and leave a clean, square line that holds through heat, wind, and winter rain.",
    sections: [
      {
        h2: "What we install",
        body: "We install wood privacy and picket fences, cedar and redwood lines, vinyl privacy systems, chain link for pets and pools, and ornamental styles for front yards. Every job starts with a site walk: property lines, grade changes, utilities, gate openings, and neighbor access.",
      },
      {
        h2: "Our installation process",
        body: "We mark the run, dig and set posts to the depth your soil needs, hang rails or panels true, and finish with hardware that latches cleanly. You get a clear scope before work begins—materials, footage, gates, and any removals—so pricing is tied to the yard you actually have.",
      },
      {
        h2: "Where we install fences",
        body: "We regularly install fences in Sacramento, Elk Grove, Roseville, Rocklin, Folsom, Citrus Heights, Lincoln, Auburn, Grass Valley, Nevada City, and nearby foothill communities. Local crews mean faster scheduling and installs planned for Central Valley clay, foothill rock, and hillside drainage.",
      },
      {
        h2: "Why homeowners hire Twin Rivers",
        body: "Licensed California contractor #1089233, 40+ years of fencing experience, and a verified Google Business Profile with real customer reviews. We do residential backyards, rental turnovers, HOA communities, and commercial perimeters with the same attention to posts, alignment, and cleanup.",
      },
    ],
    faqs: [
      {
        q: "How long does a typical fence installation take?",
        a: "Most residential backyard fences take one to three days once materials are on site. Larger runs, rocky soil, or multi-gate projects can take longer. We confirm timing during the on-site quote.",
      },
      {
        q: "Do you remove old fencing?",
        a: "Yes. We can haul away existing fence sections and posts as part of the scope. Removal is priced separately so you only pay for what your property needs.",
      },
      {
        q: "Which fence material is best for Sacramento summers?",
        a: "Vinyl and well-built cedar both hold up well. Vinyl needs less maintenance; cedar and redwood look natural and can be stained for longer life. We help you choose based on privacy needs, budget, and HOA rules.",
      },
      {
        q: "Do you handle permits?",
        a: "Permit rules vary by city and fence height. We advise what typically applies in your city and can coordinate the install around permit timing when required.",
      },
    ],
    related: [
      ["/fence-repair/", "Fence Repair"],
      ["/gate-installation/", "Gate Installation"],
      ["/custom-fence-design/", "Custom Fence Design"],
      ["/services/wood-fence-installation/", "Wood Fence by City"],
      ["/projects/", "Recent Projects"],
    ],
    cta: "Call for a free fence installation estimate",
  },
  {
    slug: "fence-repair",
    title: "Fence Repair in Northern California | Twin Rivers Fence",
    h1: "Fence Repair That Fixes the Weak Spots—Not Just the Look",
    description:
      "Fence repair for leaning sections, rotted posts, storm damage, and failing gates across Sacramento Valley and the Sierra Foothills. Honest repair-vs-replace advice. Licensed #1089233.",
    serviceType: "Fence Repair",
    heroTag: "Fence Repair",
    intro:
      "Storms, clay heave, and aging posts take down fence lines fast. Twin Rivers Fence repairs what is salvageable and tells you plainly when a full replace costs less over the next few years. We work residential yards, rentals, and commercial perimeters from Sacramento to Grass Valley.",
    sections: [
      {
        h2: "Common fence repairs we handle",
        body: "We reset leaning posts, replace rotten sections, rebuild blown panels, rehang sagging gates, swap broken rails, and reinforce corners that carry wind load. If only part of the line failed, we match materials as closely as practical so the repair does not look patched.",
      },
      {
        h2: "Repair vs. replace—clear recommendations",
        body: "If posts are still solid and only a few panels failed, repair usually wins. If posts are soft at grade for most of the run, a new fence is often the better investment. You get that call before we start, with photos and a written scope.",
      },
      {
        h2: "Storm and emergency fence work",
        body: "After high winds or tree damage, we can secure open sections, rebuild the failed run, and restore gate access. Fast response matters for pets, kids, and property lines—call (916) 906-2254 when something is down.",
      },
      {
        h2: "Service area for fence repair",
        body: "We repair fences throughout Sacramento, Roseville, Rocklin, Folsom, Elk Grove, Auburn, Lincoln, Grass Valley, Nevada City, and surrounding communities. Local crews mean we know common soil and weather failure patterns in each area.",
      },
    ],
    faqs: [
      {
        q: "Can you repair just one section of my fence?",
        a: "Yes. Partial repairs are common. We isolate the failed posts or panels and rebuild that span so the rest of the fence stays in place.",
      },
      {
        q: "Why is my fence leaning after rain?",
        a: "Central Valley clay expands and softens, and shallow posts lose grip. We reset posts deeper or with better footings so the line stays plumb through wet seasons.",
      },
      {
        q: "Do you repair vinyl and chain link as well as wood?",
        a: "Yes. We repair wood, vinyl, and chain link fences, including gates and hardware, as long as replacement parts are available for your system.",
      },
      {
        q: "How quickly can you schedule a repair?",
        a: "Many repairs are scheduled within days. Storm damage and open property lines are prioritized when possible.",
      },
    ],
    related: [
      ["/fence-installation/", "Fence Installation"],
      ["/gate-installation/", "Gate Installation"],
      ["/fence-staining/", "Fence Staining & Sealing"],
      ["/services/fence-repair/", "Fence Repair by City"],
      ["/projects/", "Project Gallery"],
    ],
    cta: "Call for a fence repair quote",
  },
  {
    slug: "gate-installation",
    title: "Gate Installation & Custom Gates | Twin Rivers Fence",
    h1: "Gate Installation That Swings True and Stays Aligned",
    description:
      "Custom gate installation for wood, vinyl, and chain link fences. Single and double gates, driveway openings, and hardware that latches cleanly. Sacramento Valley & foothills. License #1089233.",
    serviceType: "Gate Installation",
    heroTag: "Gate Installation",
    intro:
      "A fence is only as useful as the gate you walk through every day. Twin Rivers Fence builds and installs single gates, double gates, and wider openings sized for mowers, trailers, and driveway access—hung so hinges do not sag and latches meet every time.",
    sections: [
      {
        h2: "Residential and driveway gates",
        body: "We install backyard privacy gates, side-yard access gates, and wider double gates for equipment. Opening width, swing direction, and latch height are planned around how you actually use the yard—not a one-size template.",
      },
      {
        h2: "Hardware and automation readiness",
        body: "We fit quality hinges, latches, drop rods, and stops. If you want future automation, we can plan post strength and clearances so a motor kit can be added later without rebuilding the opening.",
      },
      {
        h2: "Matching your existing fence",
        body: "New gates can match an existing wood, vinyl, or chain link line, or we can rebuild the gate opening as part of a larger fence install. Commercial properties get heavier hardware and wider clearances for service traffic.",
      },
      {
        h2: "Where we install gates",
        body: "Gate installation across Sacramento, Elk Grove, Folsom, Roseville, Rocklin, Auburn, Grass Valley, and nearby Northern California communities. Same licensed crew that builds the fence line.",
      },
    ],
    faqs: [
      {
        q: "Can you replace a sagging gate without replacing the fence?",
        a: "Often yes. We rebuild or rehang the gate, reinforce the hinge post if needed, and realign the latch so the rest of the fence stays.",
      },
      {
        q: "What size gate do I need for a lawn tractor?",
        a: "Most riding mowers need a wider single or a double gate. We measure your equipment and set the opening with clearance for turns and slopes.",
      },
      {
        q: "Do you install automatic gates?",
        a: "We install gate structures ready for operators and can coordinate automation hardware. Tell us your access needs during the quote.",
      },
      {
        q: "How much does a new gate cost?",
        a: "Cost depends on width, material, and hardware. A standard walk gate costs less than a reinforced double driveway opening. We price after seeing the opening and fence type.",
      },
    ],
    related: [
      ["/fence-installation/", "Fence Installation"],
      ["/custom-fence-design/", "Custom Fence Design"],
      ["/fence-repair/", "Fence Repair"],
      ["/services/gate-installation/", "Gates by City"],
      ["/projects/", "Gate Projects"],
    ],
    cta: "Schedule a gate installation estimate",
  },
  {
    slug: "custom-fence-design",
    title: "Custom Fence Design | Twin Rivers Fence",
    h1: "Custom Fence Design for Privacy, Style, and Site Conditions",
    description:
      "Custom fence design for unique lots, HOA requirements, mixed materials, and specialty layouts. Twin Rivers Fence plans and builds custom fencing across Northern California. License #1089233.",
    serviceType: "Custom Fence Design",
    heroTag: "Custom Fence Design",
    intro:
      "Not every property fits a standard panel run. Sloped lots, mixed front-and-back styles, privacy needs next to neighbors, and HOA design rules all call for a custom plan. Twin Rivers Fence designs and builds fences that fit the ground you have and the look you want.",
    sections: [
      {
        h2: "Design that starts on site",
        body: "We walk the property, note grade changes, drainage, trees, utilities, and sight lines. Then we recommend heights, materials, and gate placements that solve privacy and access without fighting the lot.",
      },
      {
        h2: "Mixed materials and specialty details",
        body: "Custom work can include board-on-board privacy, lattice tops, picture-frame trim, transition heights, decorative face boards, or combining wood privacy in back with open styles in front. Commercial custom work focuses on security, traffic flow, and durable hardware.",
      },
      {
        h2: "HOA and neighborhood standards",
        body: "Many Sacramento Valley and foothill neighborhoods have style or height rules. We help you choose compliant designs and provide the clear scope drawings or descriptions HOAs often ask for.",
      },
      {
        h2: "From design to install",
        body: "Once the design is set, the same crew builds it—posts, panels, gates, and finish details—so the plan does not get lost between a designer and a separate installer.",
      },
    ],
    faqs: [
      {
        q: "Can you match a neighbor’s fence style?",
        a: "We can usually match height, board pattern, and color closely. Exact vintage materials are not always available, but we aim for a cohesive look along the shared line.",
      },
      {
        q: "Do custom fences cost more than standard installs?",
        a: "Specialty trim, mixed heights, and complex slopes add labor and materials. Many custom jobs are only modestly above a standard privacy run when the layout is straightforward.",
      },
      {
        q: "Can you design around a pool or slope?",
        a: "Yes. Pool codes and hillside steps need specific planning. We design for code, drainage, and safe access before installation starts.",
      },
      {
        q: "Do you provide design options before I commit?",
        a: "Yes. After the site visit we outline material and layout options with pricing so you can choose before we schedule the build.",
      },
    ],
    related: [
      ["/fence-installation/", "Fence Installation"],
      ["/gate-installation/", "Gate Installation"],
      ["/fence-staining/", "Staining & Sealing"],
      ["/projects/", "Custom Project Examples"],
      ["/services/", "All Services"],
    ],
    cta: "Request a custom fence design consult",
  },
  {
    slug: "fence-staining",
    title: "Fence Staining & Sealing | Twin Rivers Fence",
    h1: "Fence Staining & Sealing That Protects Wood Through California Weather",
    description:
      "Professional fence staining and sealing for cedar and wood fences in Sacramento Valley and the Sierra Foothills. Protect color and boards from sun and rain. Licensed #1089233.",
    serviceType: "Fence Staining and Sealing",
    heroTag: "Fence Staining & Sealing",
    intro:
      "Sacramento Valley sun and foothill moisture are hard on bare wood. Twin Rivers Fence stains and seals cedar and other wood fences to slow drying, reduce water uptake, and keep the color even—so your fence lasts longer between major repairs.",
    sections: [
      {
        h2: "Why stain and seal matter here",
        body: "UV breaks down lignin in wood; rain and irrigation soak end grain and posts at grade. A quality stain with sealer slows both problems. Skipping protection is one of the fastest ways a new wood fence greys, cups, and needs early board replacement.",
      },
      {
        h2: "What the service includes",
        body: "We prep the surface as needed, protect nearby landscaping, apply stain evenly across boards and rails, and treat the faces that take the most sun. Color options range from natural cedar tones to deeper browns that hide wear between refresh cycles.",
      },
      {
        h2: "Best timing for Northern California",
        body: "Dry, mild days are ideal—common in spring and fall. Fresh installs should cure before coating; we advise timing during your quote so stain bonds correctly.",
      },
      {
        h2: "Pair staining with repairs",
        body: "If boards are already failing, we can repair or replace damaged sections first, then stain the full line so new wood matches. That combination often costs less than waiting until the whole fence needs replacement.",
      },
    ],
    faqs: [
      {
        q: "How often should a wood fence be stained?",
        a: "Many Sacramento Valley fences benefit from a refresh every few years, depending on sun exposure and product. South- and west-facing runs usually need attention sooner.",
      },
      {
        q: "Can you stain an older grey fence?",
        a: "Often yes after prep. Heavily weathered wood may need cleaning or board replacement first so the stain absorbs evenly.",
      },
      {
        q: "Is staining included with a new fence install?",
        a: "Staining is typically a separate scope. Many homeowners add it at install or within the first season for maximum protection.",
      },
      {
        q: "Do you stain vinyl fences?",
        a: "Vinyl does not need traditional stain. For vinyl we focus on cleaning and hardware care; staining services are for wood fences.",
      },
    ],
    related: [
      ["/fence-installation/", "Fence Installation"],
      ["/fence-repair/", "Fence Repair"],
      ["/custom-fence-design/", "Custom Fence Design"],
      ["/services/wood-fence-installation/", "Wood Fence Services"],
      ["/#contact", "Get a Quote"],
    ],
    cta: "Get a staining & sealing estimate",
  },
  {
    slug: "retaining-wall",
    title: "Retaining Wall Installation | Twin Rivers Fence",
    h1: "Retaining Wall Installation for Slopes, Yards, and Fence Lines",
    description:
      "Retaining wall installation to control grade, support fence lines, and create usable yard space across Sacramento Valley and foothill properties. Twin Rivers Fence. License #1089233.",
    serviceType: "Retaining Wall Installation",
    heroTag: "Retaining Walls",
    intro:
      "Sloped lots in the foothills and graded yards in the valley often need a wall before a fence can sit true. Twin Rivers Fence builds retaining walls that hold soil, manage drainage, and create a stable base for fencing and outdoor living space.",
    sections: [
      {
        h2: "When a retaining wall is the right move",
        body: "If soil is creeping toward a fence, a patio sits below grade, or a hillside leaves no flat play area, a retaining wall solves the grade problem instead of fighting it with taller posts alone.",
      },
      {
        h2: "Walls that work with fencing",
        body: "We plan wall height, footing, and drainage so a fence can mount cleanly above or behind the wall. That coordination prevents leaning lines and washouts at the post line after the first heavy season.",
      },
      {
        h2: "Materials and site planning",
        body: "Material choice depends on height, load, and look—block systems and timber options are common for residential yards. We assess soil, water flow, and access before recommending a system.",
      },
      {
        h2: "Service area",
        body: "Retaining wall and related property improvement work across Sacramento, Roseville, Folsom, Auburn, Grass Valley, and surrounding Northern California communities where slopes and grade changes are common.",
      },
    ],
    faqs: [
      {
        q: "Do I need a retaining wall before installing a fence?",
        a: "Not always. Mild slopes can often be stepped with the fence. When soil is moving or the grade drop is sharp, a wall is the stable long-term fix.",
      },
      {
        q: "Can you build a wall and fence together?",
        a: "Yes. Combining scopes usually saves mobilization cost and ensures the fence posts and wall drainage are planned as one system.",
      },
      {
        q: "How tall can a residential retaining wall be?",
        a: "Height limits and engineering needs vary by city and load. We advise what is typical for your site during the on-site visit.",
      },
      {
        q: "Do retaining walls need drainage?",
        a: "Proper drainage behind the wall is critical. We plan gravel and drain paths so water does not pressure the face after storms.",
      },
    ],
    related: [
      ["/fence-installation/", "Fence Installation"],
      ["/deck-patio/", "Deck & Patio Construction"],
      ["/custom-fence-design/", "Custom Fence Design"],
      ["/property-improvement/yard-improvements/", "Yard Improvements"],
      ["/#contact", "Request a Site Visit"],
    ],
    cta: "Request a retaining wall estimate",
  },
  {
    slug: "deck-patio",
    title: "Deck & Patio Construction | Twin Rivers Fence",
    h1: "Deck & Patio Construction That Completes the Outdoor Space",
    description:
      "Deck and patio construction paired with fencing and gates for Northern California homes. Twin Rivers Fence builds outdoor living spaces that last. Licensed contractor #1089233.",
    serviceType: "Deck and Patio Construction",
    heroTag: "Decks & Patios",
    intro:
      "A solid fence defines the yard; a well-built deck or patio makes it usable. Twin Rivers Fence builds decks and patio-ready outdoor spaces that pair with new or existing fencing—so privacy, access, and structure work together.",
    sections: [
      {
        h2: "Decks built for California living",
        body: "We frame decks for level living space off the house or over uneven grade, with attention to footings, ledger details, and railings where required. Materials and finishes are chosen for sun exposure and how you entertain outdoors.",
      },
      {
        h2: "Patios and yard transitions",
        body: "Patio projects focus on usable flat space, clean transitions to lawn or garden beds, and gate access that does not fight furniture layouts. When a fence is part of the plan, we align openings and sight lines with the patio edge.",
      },
      {
        h2: "One crew for fence, gate, and deck",
        body: "Hiring separate trades for fence and deck often leaves gaps in scheduling and elevation details. Twin Rivers can scope fencing, gates, and deck work together so heights, steps, and access match on day one.",
      },
      {
        h2: "Where we build",
        body: "Deck and patio construction for homeowners across Sacramento, Elk Grove, Roseville, Rocklin, Folsom, Auburn, Grass Valley, and nearby communities.",
      },
    ],
    faqs: [
      {
        q: "Can you build a deck and fence in the same project?",
        a: "Yes. Combined projects are common and usually more efficient. We sequence footings, framing, and fence posts so nothing blocks access mid-build.",
      },
      {
        q: "Do decks need permits?",
        a: "Many decks do, depending on height and city rules. We discuss typical requirements for your location during the estimate.",
      },
      {
        q: "What deck materials do you recommend?",
        a: "It depends on budget, sun exposure, and maintenance preference. We review options on site and price the system that fits how you use the space.",
      },
      {
        q: "Do you only build decks with new fences?",
        a: "No. We can add a deck or patio where fencing already exists, or repair fence lines that meet the new structure.",
      },
    ],
    related: [
      ["/fence-installation/", "Fence Installation"],
      ["/gate-installation/", "Gate Installation"],
      ["/retaining-wall/", "Retaining Walls"],
      ["/property-improvement/deck-installation/", "Deck Installation Hub"],
      ["/projects/", "See Our Work"],
    ],
    cta: "Get a deck & patio quote",
  },
];

function pageHtml(s) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.serviceType,
    serviceType: s.serviceType,
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
      areaServed: [
        "Sacramento, CA",
        "Roseville, CA",
        "Rocklin, CA",
        "Folsom, CA",
        "Elk Grove, CA",
        "Auburn, CA",
        "Grass Valley, CA",
      ],
    },
    areaServed: "Northern California",
    url: `https://twinriversfence.com/${s.slug}/`,
  };
  const breadcrumbSchema = {
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
        name: s.serviceType,
        item: `https://twinriversfence.com/${s.slug}/`,
      },
    ],
  };

  const sectionsHtml = s.sections
    .map(
      (sec) => `
    <section class="block">
      <h2>${sec.h2}</h2>
      <p>${sec.body}</p>
    </section>`
    )
    .join("\n");

  const faqsHtml = s.faqs
    .map(
      (f) => `
      <details class="faq-item">
        <summary>${f.q}</summary>
        <p>${f.a}</p>
      </details>`
    )
    .join("\n");

  const relatedHtml = s.related
    .map((r) => `<li><a href="${r[0]}">${r[1]}</a></li>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${s.title}</title>
<link rel="canonical" href="https://twinriversfence.com/${s.slug}/">
<meta name="description" content="${s.description}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${s.title}">
<meta property="og:description" content="${s.description}">
<meta property="og:url" content="https://twinriversfence.com/${s.slug}/">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230a0a0a'/%3E%3Cpath d='M7 23h18M9 13h14M11 8l3 4v14h-3V8Zm8 0 3 4v14h-3V8Z' fill='none' stroke='%23d4a853' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E">
<script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<style>
:root { --gold:#d4a853; --gold-bright:#e8bb60; --black:#0a0a0a; --panel:#111; --soft:rgba(255,255,255,.68); }
*{ box-sizing:border-box; margin:0; padding:0; }
body { background:var(--black); color:#fff; font-family:Georgia,"Times New Roman",serif; line-height:1.7; }
a { color:var(--gold); }
.top { position:sticky; top:0; z-index:20; display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:.85rem 6vw; background:rgba(10,10,10,.92); border-bottom:1px solid rgba(255,255,255,.08); backdrop-filter:blur(10px); font-family:system-ui,sans-serif; }
.brand { color:#fff; text-decoration:none; font-weight:700; letter-spacing:.04em; }
.top-links { display:flex; gap:1rem; flex-wrap:wrap; align-items:center; font-size:.9rem; }
.top-links a { color:rgba(255,255,255,.8); text-decoration:none; }
.top-links a:hover { color:var(--gold-bright); }
.btn { display:inline-block; background:var(--gold); color:#111; text-decoration:none; padding:.75rem 1.1rem; font-family:system-ui,sans-serif; font-weight:700; border-radius:3px; }
.btn:hover { background:var(--gold-bright); }
.hero { padding:5.5rem 6vw 3rem; background:radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,83,.18), transparent 60%), linear-gradient(180deg,#141414,var(--black)); }
.tag { color:var(--gold); font-family:system-ui,sans-serif; text-transform:uppercase; letter-spacing:.14em; font-size:.75rem; }
.hero h1 { font-size:clamp(2rem,5vw,3.4rem); line-height:1.15; margin:.6rem 0 1rem; max-width:18ch; }
.hero .lead { color:var(--soft); max-width:62ch; font-size:1.08rem; font-family:system-ui,sans-serif; }
.crumbs { font-family:system-ui,sans-serif; font-size:.85rem; color:rgba(255,255,255,.55); margin-bottom:1.25rem; }
.crumbs a { color:rgba(255,255,255,.75); text-decoration:none; }
main { padding:0 6vw 4rem; max-width:920px; }
.block { padding:2rem 0; border-bottom:1px solid rgba(255,255,255,.08); }
.block h2 { font-size:1.55rem; margin-bottom:.75rem; }
.block p { color:var(--soft); font-family:system-ui,sans-serif; font-size:1.02rem; }
.faq { padding:2.5rem 0; }
.faq h2 { margin-bottom:1rem; }
.faq-item { border:1px solid rgba(255,255,255,.1); border-radius:4px; padding:1rem 1.1rem; margin-bottom:.65rem; background:var(--panel); font-family:system-ui,sans-serif; }
.faq-item summary { cursor:pointer; color:#fff; font-weight:600; }
.faq-item p { color:var(--soft); margin-top:.65rem; }
.related { padding:2rem 0 1rem; }
.related ul { list-style:none; display:grid; gap:.5rem; font-family:system-ui,sans-serif; }
.cta-band { margin:2rem 0 0; padding:1.75rem; background:linear-gradient(135deg,rgba(212,168,83,.16),rgba(255,255,255,.03)); border:1px solid rgba(212,168,83,.35); border-radius:6px; font-family:system-ui,sans-serif; }
.cta-band p { color:var(--soft); margin:.5rem 0 1rem; }
.eeat { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:.75rem; margin:1.5rem 0; font-family:system-ui,sans-serif; }
.eeat div { padding:.85rem 1rem; background:var(--panel); border:1px solid rgba(255,255,255,.08); border-radius:4px; color:var(--soft); font-size:.92rem; }
.eeat strong { display:block; color:#fff; margin-bottom:.25rem; }
footer { padding:2rem 6vw; border-top:1px solid rgba(255,255,255,.08); color:rgba(255,255,255,.55); font-family:system-ui,sans-serif; font-size:.9rem; }
footer a { color:rgba(255,255,255,.75); margin-right:.75rem; }
@media (max-width:700px){ .top{flex-direction:column; align-items:flex-start;} .hero{padding-top:4.5rem;} }
</style>
</head>
<body>
<header class="top">
  <a class="brand" href="/">Twin Rivers Fence</a>
  <nav class="top-links" aria-label="Primary">
    <a href="/fence-installation/">Installation</a>
    <a href="/fence-repair/">Repair</a>
    <a href="/gate-installation/">Gates</a>
    <a href="/projects/">Projects</a>
    <a href="/reviews/">Reviews</a>
    <a href="tel:+19169062254">(916) 906-2254</a>
  </nav>
</header>
<section class="hero">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / ${s.serviceType}</nav>
  <div class="tag">${s.heroTag}</div>
  <h1>${s.h1}</h1>
  <p class="lead">${s.intro}</p>
  <div class="eeat" aria-label="Trust signals">
    <div><strong>Licensed #1089233</strong>California contractor</div>
    <div><strong>40+ Years</strong>Fencing experience</div>
    <div><strong>5.0 Google</strong>Verified reviews</div>
    <div><strong>Local Crews</strong>Sacramento to foothills</div>
  </div>
  <p style="margin-top:1.25rem;"><a class="btn" href="/#contact">${s.cta}</a></p>
</section>
<main>
${sectionsHtml}
  <section class="faq">
    <h2>Frequently asked questions</h2>
${faqsHtml}
  </section>
  <section class="related">
    <h2>Related services</h2>
    <ul>
${relatedHtml}
    </ul>
  </section>
  <div class="cta-band">
    <h2 style="font-size:1.35rem;margin-bottom:.25rem;">Ready to talk through your project?</h2>
    <p>Call Twin Rivers Fence for a free on-site estimate. We serve Sacramento Valley and Sierra Foothills properties.</p>
    <a class="btn" href="tel:+19169062254">Call (916) 906-2254</a>
    <a class="btn" href="/#contact" style="margin-left:.5rem;background:transparent;border:1px solid var(--gold);color:var(--gold);">Request a Quote</a>
  </div>
</main>
<footer>
  <div>Twin Rivers LLC · License #1089233 · Grass Valley, CA</div>
  <div style="margin-top:.75rem;">
    <a href="/fence-installation/">Fence Installation</a>
    <a href="/fence-repair/">Fence Repair</a>
    <a href="/gate-installation/">Gate Installation</a>
    <a href="/custom-fence-design/">Custom Design</a>
    <a href="/fence-staining/">Staining</a>
    <a href="/retaining-wall/">Retaining Walls</a>
    <a href="/deck-patio/">Decks &amp; Patios</a>
    <a href="/services/">All Services</a>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
  </div>
</footer>
</body>
</html>
`;
}

for (const s of services) {
  const dir = path.join(root, s.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), pageHtml(s), "utf8");
  console.log("Wrote", s.slug + "/index.html");
}

// 404 page
fs.writeFileSync(
  path.join(root, "404.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page Not Found | Twin Rivers Fence</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://twinriversfence.com/404.html">
<style>
body{margin:0;background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:2rem;text-align:center}
a{color:#d4a853}
h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3rem)}
p{color:rgba(255,255,255,.65);max-width:42ch;margin:1rem auto 1.5rem}
.links{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.links a{text-decoration:none;border:1px solid rgba(212,168,83,.4);padding:.6rem .9rem;border-radius:3px}
</style>
</head>
<body>
  <div>
    <h1>This page does not exist</h1>
    <p>The URL you requested is not a published Twin Rivers Fence page. Try one of these services or return home.</p>
    <div class="links">
      <a href="/">Home</a>
      <a href="/fence-installation/">Fence Installation</a>
      <a href="/fence-repair/">Fence Repair</a>
      <a href="/gate-installation/">Gate Installation</a>
      <a href="/services/">All Services</a>
    </div>
  </div>
</body>
</html>
`,
  "utf8"
);
console.log("Wrote 404.html");

// robots.txt
fs.writeFileSync(
  path.join(root, "robots.txt"),
  `User-agent: *
Allow: /

Sitemap: https://twinriversfence.com/sitemap.xml
`,
  "utf8"
);
console.log("Wrote robots.txt");

// Build sitemap from known high-value URLs + existing twinriversfence.com entries
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
  ["https://twinriversfence.com/projects/roseville-cedar-fence-installation/", "0.7"],
  ["https://twinriversfence.com/projects/elk-grove-vinyl-fence/", "0.7"],
  ["https://twinriversfence.com/projects/commercial-security-fence-sacramento/", "0.7"],
];

const cities = [
  "sacramento",
  "elk-grove",
  "roseville",
  "folsom",
  "citrus-heights",
  "rocklin",
  "grass-valley",
  "nevada-city",
  "auburn",
  "lincoln",
  "penn-valley",
  "lake-wildwood",
  "rough-and-ready",
  "north-san-juan",
  "chicago-park",
  "alta-sierra",
];
const serviceBases = [
  "wood-fence-installation",
  "vinyl-fence-installation",
  "chain-link-fence-installation",
  "privacy-fence-installation",
  "fence-repair",
  "gate-installation",
];

for (const city of cities) {
  priorityUrls.push([`https://twinriversfence.com/fencing/${city}/`, "0.75"]);
  for (const base of serviceBases) {
    priorityUrls.push([
      `https://twinriversfence.com/services/${base}-${city}/`,
      "0.7",
    ]);
  }
}

const urlset = priorityUrls
  .map(
    ([loc, priority]) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
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
