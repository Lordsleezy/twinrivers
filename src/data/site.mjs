/** Twin Rivers — Fantastic Fence architecture + Twin Rivers content */
export const site = {
  name: "Twin Rivers Fence",
  legalName: "Twin Rivers LLC",
  domain: "https://twinriversfence.com",
  phoneDisplay: "(916) 906-2254",
  phoneTel: "+19169062254",
  license: "1089233",
  yearsExperience: 40,
  priceRange: "$$",
  email: "info@twinriversfence.com",
  mapsUrl: "https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6",
  googleReviewsUrl: "https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6",
  address: { locality: "Grass Valley", region: "CA", country: "US" },
  tagline: "Repair, Replace, and Installation",
  heroHeadline: "Best Fence Company in the Sacramento Valley – Repair and Replacement",
  heroLead:
    "Twin Rivers Fence is based in Nevada County and is Sacramento Valley and the Sierra Foothills’ preferred licensed, bonded, and insured fencing contractor—high-quality fence installation and repairs at a fair price. Wood, vinyl, chain link, privacy, gates, and custom fencing.",
};

/** Cities with dedicated Twin Rivers satellite sites — Areas links redirect here */
export const dedicatedCitySites = {
  "grass-valley": "https://grassvalleyfencing.com/",
  rocklin: "https://rocklinfencing.com/",
  roseville: "https://rosevillefencingca.com/",
  folsom: "https://folsomfencing.com/",
  "elk-grove": "https://elkgrovefencing.com/",
  "granite-bay": "https://granitebayfencing.com/",
};

export const citySites = [
  { label: "Grass Valley", href: "https://grassvalleyfencing.com/" },
  { label: "Rocklin", href: "https://rocklinfencing.com/" },
  { label: "Roseville", href: "https://rosevillefencingca.com/" },
  { label: "Folsom", href: "https://folsomfencing.com/" },
  { label: "Elk Grove", href: "https://elkgrovefencing.com/" },
  { label: "Granite Bay", href: "https://granitebayfencing.com/" },
];

/** Full Areas We Serve list (Fantastic Fence coverage + Twin Rivers SEO cities) */
export const cities = [
  { name: "Alta Sierra", slug: "alta-sierra" },
  { name: "Antelope", slug: "antelope" },
  { name: "Applegate", slug: "applegate" },
  { name: "Arden-Arcade", slug: "arden-arcade" },
  { name: "Auburn", slug: "auburn" },
  { name: "Auburn Lake Trails", slug: "auburn-lake-trails" },
  { name: "Cameron Park", slug: "cameron-park" },
  { name: "Carmichael", slug: "carmichael" },
  { name: "Chicago Park", slug: "chicago-park" },
  { name: "Chico", slug: "chico" },
  { name: "Citrus Heights", slug: "citrus-heights" },
  { name: "Colfax", slug: "colfax" },
  { name: "Davis", slug: "davis" },
  { name: "Dixon", slug: "dixon" },
  { name: "El Dorado Hills", slug: "el-dorado-hills" },
  { name: "Elk Grove", slug: "elk-grove" },
  { name: "Elverta", slug: "elverta" },
  { name: "Fair Oaks", slug: "fair-oaks" },
  { name: "Folsom", slug: "folsom" },
  { name: "Foothill Farms", slug: "foothill-farms" },
  { name: "Fruitridge", slug: "fruitridge" },
  { name: "Galt", slug: "galt" },
  { name: "Gold River", slug: "gold-river" },
  { name: "Granite Bay", slug: "granite-bay" },
  { name: "Grass Valley", slug: "grass-valley" },
  { name: "La Riviera", slug: "la-riviera" },
  { name: "Laguna", slug: "laguna" },
  { name: "Lake of the Pines", slug: "lake-of-the-pines" },
  { name: "Lake Wildwood", slug: "lake-wildwood" },
  { name: "Lemon Hill", slug: "lemon-hill" },
  { name: "Lincoln", slug: "lincoln" },
  { name: "Linda", slug: "linda" },
  { name: "Live Oak", slug: "live-oak" },
  { name: "Lodi", slug: "lodi" },
  { name: "Loma Rica", slug: "loma-rica" },
  { name: "Loomis", slug: "loomis" },
  { name: "Marysville", slug: "marysville" },
  { name: "Mather", slug: "mather" },
  { name: "McClellan Park", slug: "mcclellan-park" },
  { name: "Meadow Vista", slug: "meadow-vista" },
  { name: "Natomas", slug: "natomas" },
  { name: "Nevada City", slug: "nevada-city" },
  { name: "Nicolaus", slug: "nicolaus" },
  { name: "North Highlands", slug: "north-highlands" },
  { name: "North San Juan", slug: "north-san-juan" },
  { name: "Orangevale", slug: "orangevale" },
  { name: "Oroville", slug: "oroville" },
  { name: "Paradise", slug: "paradise" },
  { name: "Parkway", slug: "parkway" },
  { name: "Penn Valley", slug: "penn-valley" },
  { name: "Placer County", slug: "placer-county" },
  { name: "Plumas Lake", slug: "plumas-lake" },
  { name: "Pocket", slug: "pocket" },
  { name: "Rancho Cordova", slug: "rancho-cordova" },
  { name: "Rancho Murieta", slug: "rancho-murieta" },
  { name: "Rescue", slug: "rescue" },
  { name: "Rio Linda", slug: "rio-linda" },
  { name: "Rio Oso", slug: "rio-oso" },
  { name: "Rocklin", slug: "rocklin" },
  { name: "Rosemont", slug: "rosemont" },
  { name: "Roseville", slug: "roseville" },
  { name: "Rough and Ready", slug: "rough-and-ready" },
  { name: "Sacramento", slug: "sacramento" },
  { name: "Sheridan", slug: "sheridan" },
  { name: "Shingle Springs", slug: "shingle-springs" },
  { name: "Vacaville", slug: "vacaville" },
  { name: "Vineyard", slug: "vineyard" },
  { name: "West Sacramento", slug: "west-sacramento" },
  { name: "Wheatland", slug: "wheatland" },
  { name: "Wilton", slug: "wilton" },
  { name: "Woodland", slug: "woodland" },
  { name: "Yuba City", slug: "yuba-city" },
];

export const counties = [
  { name: "Nevada County", slug: "nevada-county" },
  { name: "Sacramento County", slug: "sacramento-county" },
];

export function areaHref(slug) {
  if (dedicatedCitySites[slug]) return dedicatedCitySites[slug];
  return `/fencing/${slug}/`;
}

export function areaIsExternal(slug) {
  return Boolean(dedicatedCitySites[slug]);
}

/** Material cards — images match job type */
export const fenceOptions = [
  {
    slug: "wood",
    title: "Wood Fence",
    href: "/services/wood-fence-installation/",
    image: "/assets/materials/wood.jpg.webp",
    blurb:
      "A classic and versatile choice—natural beauty, privacy, and security. Perfect for any property style and fully customizable.",
  },
  {
    slug: "iron",
    title: "Ornamental Iron",
    href: "/fence-installation/",
    image: "/assets/materials/iron.jpg.webp",
    blurb:
      "Elegant and durable ornamental iron fences offer timeless beauty and strong security for residential and commercial properties.",
  },
  {
    slug: "chain-link",
    title: "Chain Link",
    href: "/services/chain-link-fence-installation/",
    image: "/assets/materials/chain.jpg.webp",
    blurb:
      "An affordable, practical fencing solution—visibility and security for homes, businesses, pets, and industrial sites.",
  },
  {
    slug: "vinyl",
    title: "Vinyl",
    href: "/services/vinyl-fence-installation/",
    image: "/assets/materials/vinyl.jpg.webp",
    blurb:
      "Low-maintenance and weather-resistant vinyl with a clean, modern look and excellent durability and privacy options.",
  },
  {
    slug: "privacy",
    title: "Privacy",
    href: "/services/privacy-fence-installation/",
    image: "/assets/materials/privacy.jpg.webp",
    blurb:
      "Solid privacy fencing for backyard retreats—block sightlines and noise while matching your home’s style.",
  },
  {
    slug: "ag",
    title: "Agricultural",
    href: "/commercial-projects/",
    image: "/assets/materials/ag.jpg.webp",
    blurb:
      "Designed for farms and large properties—contain livestock and define boundaries with cost-effective durability.",
  },
  {
    slug: "retaining",
    title: "Retaining Wall",
    href: "/retaining-wall/",
    image: "/assets/materials/retaining.jpg.webp",
    blurb:
      "Essential soil support that enhances property layout and landscaping—often paired with new fence lines.",
  },
  {
    slug: "hidden",
    title: "Hidden Steel Posts",
    href: "/custom-fence-design/",
    image: "/assets/materials/hidden-posts.jpg.webp",
    blurb:
      "Enhanced strength and stability while keeping the clean look of wood or vinyl fencing.",
  },
];

export const residentialNav = [
  { label: "All Residential", href: "/residential/" },
  { label: "Wood Fences", href: "/services/wood-fence-installation/" },
  { label: "Vinyl Fences", href: "/services/vinyl-fence-installation/" },
  { label: "Chain Link Fences", href: "/services/chain-link-fence-installation/" },
  { label: "Privacy Fences", href: "/services/privacy-fence-installation/" },
  { label: "Ornamental Iron", href: "/fence-installation/" },
  { label: "Fence Repair", href: "/fence-repair/" },
  { label: "Gate Installation", href: "/gate-installation/" },
  { label: "Fence Staining", href: "/fence-staining/" },
  { label: "Custom Design", href: "/custom-fence-design/" },
  { label: "Retaining Walls", href: "/retaining-wall/" },
  { label: "Temporary Fence", href: "/services/temporary-fence-rental/" },
];

export const commercialNav = [
  { label: "Commercial Projects", href: "/commercial-projects/" },
  { label: "Temporary Fence Rental", href: "/services/temporary-fence-rental/" },
  { label: "Fence Installation", href: "/fence-installation/" },
  { label: "Fence Repair", href: "/fence-repair/" },
  { label: "Agricultural", href: "/commercial-projects/" },
];

export const gateNav = [
  { label: "All Gates", href: "/gate-installation/" },
  { label: "Gate Installation", href: "/gate-installation/" },
  { label: "Motorized Gates", href: "/automatic-gates/" },
  { label: "Gate Repair", href: "/gate-repair/" },
  { label: "Custom Fence Design", href: "/custom-fence-design/" },
];

export const patioNav = [
  { label: "All Decks & Patios", href: "/deck-patio/" },
  { label: "All Decks", href: "/decks/" },
  { label: "Wood Decks", href: "/decks/wood-deck/" },
  { label: "Composite Decks", href: "/decks/composite-deck/" },
  { label: "Redwood Decks", href: "/decks/redwood-deck/" },
  { label: "Deck Railing", href: "/decks/deck-railing/" },
  { label: "Pergolas", href: "/decks/pergola/" },
  { label: "Deck Repair", href: "/decks/deck-repair/" },
  { label: "All Patios", href: "/patios/" },
  { label: "Concrete Patios", href: "/patios/concrete-patio/" },
  { label: "Paver Patios", href: "/patios/paver-patio/" },
  { label: "Stamped Concrete", href: "/patios/stamped-concrete-patio/" },
  { label: "Stone Patios", href: "/patios/stone-patio/" },
  { label: "Patio Covers", href: "/patios/patio-cover/" },
  { label: "Patio Repair", href: "/patios/patio-repair/" },
];

export const resourceNav = [
  { label: "About Us", href: "/about/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Reviews", href: "/reviews/" },
  { label: "Financing", href: "/financing/" },
  { label: "Resources", href: "/fence-learning-center/" },
  { label: "Service Areas", href: "/fencing/" },
  { label: "Contact", href: "/contact/" },
];

export const nav = [
  { label: "Residential", href: "/residential/", children: residentialNav },
  { label: "Commercial", href: "/commercial-projects/", children: commercialNav },
  { label: "Gates", href: "/gate-installation/", children: gateNav },
  { label: "Decks & Patios", href: "/deck-patio/", children: patioNav },
  { label: "Resources", href: "/fence-learning-center/", children: resourceNav },
  { label: "Picture Gallery", href: "/gallery/" },
];

export const deckPatioPages = [
  {
    path: "/deck-patio/",
    title: "Decks & Patios | Twin Rivers Fence",
    h1: "Decks & Patios",
    lead: "Outdoor living upgrades that pair with fencing—decks, patios, covers, and repairs across Northern California.",
    body: "Twin Rivers builds and repairs decks and patios that expand usable outdoor space. Choose wood, composite, or redwood decks; concrete, paver, stamped, or stone patios; plus covers, railings, and pergolas.",
  },
  {
    path: "/decks/",
    title: "Deck Installation | Twin Rivers Fence",
    h1: "Deck Installation",
    lead: "Custom wood, composite, and redwood decks built for Sacramento Valley and foothill homes.",
    body: "From raised decks to ground-level entertaining spaces, we design layouts that fit your yard grade, access, and outdoor living goals.",
  },
  {
    path: "/decks/wood-deck/",
    title: "Wood Decks | Twin Rivers Fence",
    h1: "Wood Decks",
    lead: "Classic wood decks with warm character and full customization.",
    body: "Wood decks deliver natural beauty and flexible design. We build with quality framing, proper drainage details, and finishes suited to Northern California sun and weather.",
  },
  {
    path: "/decks/composite-deck/",
    title: "Composite Decks | Twin Rivers Fence",
    h1: "Composite Decks",
    lead: "Low-maintenance composite decking that stays looking sharp season after season.",
    body: "Composite boards resist fading, splinters, and constant staining—ideal for busy homeowners who want outdoor living without heavy upkeep.",
  },
  {
    path: "/decks/redwood-deck/",
    title: "Redwood Decks | Twin Rivers Fence",
    h1: "Redwood Decks",
    lead: "Premium redwood decks with rich color and lasting outdoor presence.",
    body: "Redwood is a Northern California favorite for decks that feel elevated and durable. We frame and finish for longevity and clean lines.",
  },
  {
    path: "/decks/deck-railing/",
    title: "Deck Railing | Twin Rivers Fence",
    h1: "Deck Railing",
    lead: "Safe, stylish railings matched to your deck and home.",
    body: "Code-conscious railings in wood and complementary styles—built to feel solid under hand and look intentional from the yard.",
  },
  {
    path: "/decks/pergola/",
    title: "Pergolas | Twin Rivers Fence",
    h1: "Pergolas",
    lead: "Shade structures that define outdoor rooms and patio zones.",
    body: "Pergolas add filtered shade and architectural interest—perfect beside fences, decks, and patio entertaining areas.",
  },
  {
    path: "/decks/deck-repair/",
    title: "Deck Repair | Twin Rivers Fence",
    h1: "Deck Repair",
    lead: "Board, railing, and structural deck repairs that restore safety and looks.",
    body: "Soft boards, loose railings, and worn stairs don’t have to mean a full rebuild. We assess damage and repair or replace the right sections.",
  },
  {
    path: "/patios/",
    title: "Patio Installation | Twin Rivers Fence",
    h1: "Patio Installation",
    lead: "Concrete, paver, stamped, and stone patios for backyard living.",
    body: "A well-built patio anchors outdoor furniture, dining, and entertaining. We help you choose the surface that fits style, budget, and maintenance preferences.",
  },
  {
    path: "/patios/concrete-patio/",
    title: "Concrete Patios | Twin Rivers Fence",
    h1: "Concrete Patios",
    lead: "Clean, durable concrete patios for everyday outdoor living.",
    body: "Concrete is a practical foundation for furniture and foot traffic. We place and finish slabs with attention to slope, joints, and edges.",
  },
  {
    path: "/patios/paver-patio/",
    title: "Paver Patios | Twin Rivers Fence",
    h1: "Paver Patios",
    lead: "Interlocking paver patios with flexible patterns and colors.",
    body: "Pavers offer repairability and design variety—great for curved layouts and coordinated walkways.",
  },
  {
    path: "/patios/stamped-concrete-patio/",
    title: "Stamped Concrete Patios | Twin Rivers Fence",
    h1: "Stamped Concrete Patios",
    lead: "Decorative stamped concrete with stone and texture looks.",
    body: "Stamped finishes add curb appeal without full masonry budgets—ideal when you want pattern and color in a continuous surface.",
  },
  {
    path: "/patios/stone-patio/",
    title: "Stone Patios | Twin Rivers Fence",
    h1: "Stone Patios",
    lead: "Natural stone patio surfaces with timeless outdoor character.",
    body: "Stone patios bring texture and permanence to landscaped yards. We set surfaces for drainage and long-term stability.",
  },
  {
    path: "/patios/patio-cover/",
    title: "Patio Covers | Twin Rivers Fence",
    h1: "Patio Covers",
    lead: "Shade and weather protection for patios and outdoor rooms.",
    body: "Patio covers extend usable hours outdoors—pair with fencing and decks for a complete backyard upgrade.",
  },
  {
    path: "/patios/patio-repair/",
    title: "Patio Repair | Twin Rivers Fence",
    h1: "Patio Repair",
    lead: "Crack, settling, and surface repairs for aging patio areas.",
    body: "We evaluate whether repair or resurfacing makes sense, then restore a safer, better-looking outdoor surface.",
  },
];

export const serviceQuickLinks = [
  { label: "Fence Installation", href: "/fence-installation/", desc: "New fence lines built right" },
  { label: "Fence & Gate Repair", href: "/fence-repair/", desc: "Fast fixes that last" },
  { label: "Fence Replacement", href: "/services/fence-repair/", desc: "Remove old, install new" },
  { label: "Areas We Serve", href: "/fencing/", desc: "Valley to foothills" },
];

export const offices = [
  {
    title: "Sierra Foothills HQ",
    area: "Serving Grass Valley, Nevada City & Nevada County",
    maps: "https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6",
  },
  {
    title: "Sacramento Valley",
    area: "Serving Sacramento, Elk Grove, Folsom & Citrus Heights",
    maps: "https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6",
  },
  {
    title: "Placer County",
    area: "Serving Roseville, Rocklin, Lincoln & Auburn",
    maps: "https://maps.app.goo.gl/rXBxsJXV2E6Z3Luu6",
  },
];

export const testimonials = [
  {
    quote:
      "Very professional! Installed around 100' of fencing including a gate. Huge thank you for great communication throughout this project. The crew came on time, knocked on the door, introduced themselves, then walked the job with us. Cleaned after the job was done!",
    name: "Andrei K.",
    place: "Roseville",
    when: "a week ago",
  },
  {
    quote:
      "Called Twin Rivers for a quote to replace our pool fence and part of our back fence. They came out right away, explained city code needs, and weren’t the cheapest—but we felt good with the interaction. Communication up to the project was great. The finished fence looks amazing.",
    name: "Jon C.",
    place: "Rocklin",
    when: "a week ago",
  },
  {
    quote:
      "On time, professional and efficient. Communication between our family and the crew was clear and concise. We had 2 estimates done, made our choice, and we are very satisfied.",
    name: "Susan S.",
    place: "Folsom",
    when: "a month ago",
  },
  {
    quote:
      "The crew that came out to replace part of our fence did a fantastic job. They left the job site very clean. I would recommend Twin Rivers going forward. Thank you!",
    name: "Gabrielle S.",
    place: "Elk Grove",
    when: "3 months ago",
  },
  {
    quote:
      "The Twin Rivers crew came early morning and explained what they were going to do. They finished faster than I thought. I will recommend them to other neighbors. Great work.",
    name: "Benjamin F.",
    place: "Sacramento",
    when: "3 months ago",
  },
  {
    quote:
      "Professional project scheduling and management. The install crew was friendly, professional, and truly skilled! My fence looks AMAZING. I can highly recommend Twin Rivers for all your fencing needs.",
    name: "Kristie M.",
    place: "Lincoln",
    when: "4 months ago",
  },
  {
    quote:
      "Courteous and professional. They removed the old fence and posts, put up metal posts with wood, and completed the job in hours. Left the yard in great condition. I am very pleased.",
    name: "D. Bronow",
    place: "Citrus Heights",
    when: "4 months ago",
  },
  {
    quote:
      "Wonderful customer service during estimate and scheduling. Excellent, hardworking crew knocked out our fence in a day—147ft removed and rebuilt. Excellent quality, would recommend.",
    name: "Sally",
    place: "Auburn",
    when: "5 months ago",
  },
  {
    quote:
      "The crew arrived as scheduled and were very courteous and respectful of our yard. They worked hard and finished on time. They even saved me money by suggesting a smart change. Will call again.",
    name: "Steve S.",
    place: "Grass Valley",
    when: "5 months ago",
  },
  {
    quote:
      "Incredible job with our fence—hidden steel posts and a new gate. They worked carefully yet quickly and were kind and professional. Came back to replace a slightly cracked board without hassle. Above and beyond.",
    name: "Charlotte H.",
    place: "Nevada City",
    when: "5 months ago",
  },
  {
    quote:
      "Refreshing experience. Communicated start and end times, walked the property with me, and the final outcome was amazing. 100% recommend for friends and family.",
    name: "Kathleen K.",
    place: "Penn Valley",
    when: "5 months ago",
  },
  {
    quote:
      "Professional. Quote was competitive. Installation crew on time and finished in one day. Utilities marked before construction. Very pleased—especially how they worked around a large oak.",
    name: "Kevin K.",
    place: "Folsom",
    when: "6 months ago",
  },
];

export const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "Fence Installation", href: "/fence-installation/" },
      { label: "Fence Repair", href: "/fence-repair/" },
      { label: "Gate Installation", href: "/gate-installation/" },
      { label: "Custom Design", href: "/custom-fence-design/" },
      { label: "Commercial", href: "/commercial-projects/" },
      { label: "Temporary Fence", href: "/services/temporary-fence-rental/" },
    ],
  },
  {
    title: "Fence Types",
    links: [
      { label: "Wood", href: "/services/wood-fence-installation/" },
      { label: "Vinyl", href: "/services/vinyl-fence-installation/" },
      { label: "Chain Link", href: "/services/chain-link-fence-installation/" },
      { label: "Privacy", href: "/services/privacy-fence-installation/" },
      { label: "Decks & Patios", href: "/deck-patio/" },
      { label: "Retaining Walls", href: "/retaining-wall/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about/" },
      { label: "Gallery", href: "/gallery/" },
      { label: "Reviews", href: "/reviews/" },
      { label: "Financing", href: "/financing/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Contact", href: "/contact/" },
      { label: "Resources", href: "/fence-learning-center/" },
    ],
  },
];
