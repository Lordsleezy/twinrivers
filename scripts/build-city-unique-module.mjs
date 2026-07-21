import fs from "fs";

const cityUniqueContent = {
  sacramento: {
    uniqueParagraphs: [
      "Sacramento lots rarely share the same fence story: an East Sacramento bungalow may need a lower street face while the rear run climbs for privacy along an alley. We map irrigation sleeves, sidewalk easements, and how afternoon sun hits west boards before ordering lumber.",
      "Valley clay around Land Park and Tahoe Park can hold moisture against posts through winter, then pull away in July heat. That swing is why we treat footing depth and drainage at the base as part of the design, not an afterthought once panels are cut.",
      "Natomas and Pocket-Greenhaven often mix RV gates, pool latches, and long straight runs on flat ground. Crews still verify corner pins because older subdivisions sometimes drift from recorded lines when landscaping matures.",
    ],
    processClauses: [
      "Because Sacramento clay expands and shrinks seasonally, ",
      "When we work Sacramento Valley lots from Midtown alleys to Natomas flats we first confirm grade and utilities, then ",
      "On Sacramento sites where irrigation and clay meet at the post line, ",
    ],
    footerTaglines: [
      "Twin Rivers LLC · License #1089233 · Sacramento Valley routes daily",
      "East Sacramento to Natomas · licensed fence work · Twin Rivers",
      "Serving Sacramento County neighborhoods · #1089233 · Twin Rivers Fence",
    ],
    eeatSets: [
      [["License #1089233", "Sacramento County contractor"], ["40+ years", "Valley fence installs"], ["Sacramento crews", "Midtown to Pocket"], ["Free estimate", "On-site footage and posts"]],
      [["CSLB #1089233", "Insured Northern CA"], ["Since the 1980s", "Wood, vinyl and gates"], ["Local scheduling", "Sacramento Valley"], ["Clear scopes", "Before materials order"]],
    ],
  },
  "elk-grove": {
    uniqueParagraphs: [
      "Elk Grove tracts in Laguna West and Stonelake usually arrive with HOA color charts and height caps already decided. We photograph the approved sheet and match cap styles so the install passes a drive-by review without a second trip.",
      "Sheldon and east-side acreage properties trade HOA uniformity for longer runs, equipment gates, and soft soil near horse paddocks. Posts on those lines often need wider footings where sprinklers keep clay wet year-round.",
      "Old Town Elk Grove mixes mature trees and narrow side yards; roots can deflect a post hole by inches. We plan panel lengths so repairs later do not require tearing out an entire corner that was forced off-line.",
    ],
    processClauses: ["For Elk Grove HOA yards with steady irrigation, ", "On south Sacramento County lots where turf keeps soil soft, ", "When Elk Grove CC&Rs govern street-facing height, "],
    footerTaglines: ["Twin Rivers · #1089233 · Elk Grove and south county", "Laguna West to Sheldon · Twin Rivers Fence", "Elk Grove fence installs and repairs · licensed crew"],
    eeatSets: [[["#1089233", "Elk Grove licensed"], ["HOA-aware", "Vinyl and wood specs"], ["South county crews", "Laguna and Sheldon"], ["Free walkthrough", "Footage and gate sizes"]], [["License 1089233", "CA fence contractor"], ["40+ years", "Tract and acreage"], ["Elk Grove routes", "East and west"], ["Written quote", "After on-site photos"]]],
  },
  roseville: {
    uniqueParagraphs: [
      "Roseville pool yards in west-side neighborhoods need self-closing hardware and latch height planned before the first post is set. We coordinate with existing deck pavers so gate swing does not scrape coping stones.",
      "Johnson Ranch and Fiddyment Farm edges see rolling grade where stepped cedar keeps a level sight line without leaving awkward gaps at the bottom. Corner posts on those slopes carry more load than flat-lot templates assume.",
      "Downtown Roseville and Cirby Side lots sometimes sit on older lines with mixed wood and vinyl neighbors. We talk through repair segments versus full replacement when only one side of a corner has rotted.",
    ],
    processClauses: ["On south Placer lots where pool barriers and slopes combine, ", "For Roseville properties stepping down toward creek draws, ", "When Roseville west-side sun fades stain quickly on exposed rails, "],
    footerTaglines: ["Twin Rivers Fence · Roseville and south Placer · #1089233", "West Roseville to Johnson Ranch · licensed installs", "Roseville privacy, pools and gates · Twin Rivers LLC"],
    eeatSets: [[["License #1089233", "Placer County work"], ["Pool-ready gates", "Latch planning"], ["Roseville crews", "West and east"], ["Free estimate", "Placer routes"]], [["#1089233", "Insured contractor"], ["Four decades", "Cedar and vinyl"], ["Local to Roseville", "HOA packets welcome"], ["On-site scope", "Before dig day"]]],
  },
  folsom: {
    uniqueParagraphs: [
      "Folsom canyon-edge homes in American River Canyon and Willow Springs can hit decomposed granite a foot down, then clay. Dig time changes every few panels. We carry auger extensions and adjust concrete volume per post rather than one blanket spec.",
      "Empire Ranch and Broadstone tracts favor clean vinyl faces, but wind funnels through gaps toward the American River corridor. Taller privacy sections get heavier posts and closer spacing when the yard opens toward the gap.",
      "Historic Folsom blocks near Sutter Street often need lower front profiles and taller rear privacy without blocking alley access. We measure vehicle paths for trash haulers and delivery trucks before sizing gates.",
    ],
    processClauses: ["Where Folsom hillside rock alternates with clay pockets, ", "On eastern Sacramento County lots exposed to canyon wind, ", "For Historic Folsom alleys with tight gate clearances, "],
    footerTaglines: ["Twin Rivers · Folsom hillside and tract work · #1089233", "Empire Ranch to canyon edge · Twin Rivers Fence", "Folsom gates, privacy and repairs · licensed"],
    eeatSets: [[["#1089233", "Folsom-area licensed"], ["Slope experience", "Stepped panels"], ["Canyon and tract", "Local crews"], ["Free quote", "Grade-aware scope"]], [["CSLB 1089233", "Fence and gates"], ["40+ years", "Wind-load planning"], ["Folsom routes", "Broadstone regular"], ["On-site visit", "Rock and clay check"]]],
  },
  "citrus-heights": {
    uniqueParagraphs: [
      "Citrus Heights streets near Arcade Creek and Sunrise Boulevard often have forty-year cedar lines with only a few posts gone soft. We isolate those posts, sister or replace, and leave healthy boards in place when fasteners and rails still have life.",
      "Twin Oaks and Greenback corridor yards battle shade on one side and full afternoon sun on the other. Boards cup differently on the same run. Stain and board species choices should account for that split, not just the fence height.",
      "Sayonara Drive-area lots frequently upgrade to vinyl on the street-visible side while keeping chain link for dogs along side yards. We transition heights and posts so the change looks intentional at the property corner.",
    ],
    processClauses: ["Under mature Citrus Heights tree canopies where roots shift posts, ", "On northeast Sacramento County lines with mixed sun and shade, ", "When Citrus Heights homeowners want partial rebuilds instead of full tear-out, "],
    footerTaglines: ["Twin Rivers Fence · Citrus Heights repairs and installs · #1089233", "Sunrise corridor to Arcade Creek · licensed crew", "Citrus Heights selective rebuilds · Twin Rivers LLC"],
    eeatSets: [[["License #1089233", "Sacramento County"], ["Repair-first", "Save solid spans"], ["Citrus Heights", "Mature-lot crews"], ["Free assessment", "Post and rail check"]], [["#1089233", "Insured"], ["40+ years", "Wood to vinyl"], ["Local routes", "Greenback and Sunrise"], ["Clear pricing", "Per failed post"]]],
  },
  rocklin: {
    uniqueParagraphs: [
      "Rocklin Whitney Ranch and Stanford Ranch communities expect uniform height and color across long block faces. We stage materials by lot so cap profiles and picket tops match even when installs happen a week apart on the same street.",
      "Secret Ravine and Clover Valley pockets can have shallow rock shelves that ring when augers hit stone. We relocate posts a few inches when pins allow, documenting changes so neighbors see a straight line without voids at the base.",
      "Downtown Rocklin older sections mix wood privacy with decorative front pickets. We scarf new wood to weathered rails when owners want to preserve character rather than a bright new patch in the middle of a run.",
    ],
    processClauses: ["Where Rocklin rocky soils slow standard auger depth, ", "For south Placer HOAs that inspect cap and color continuity, ", "On Rocklin ravine lots with wind exposure toward open space, "],
    footerTaglines: ["Twin Rivers · Rocklin and Whitney Ranch · #1089233", "Stanford Ranch to downtown · Twin Rivers Fence", "Rocklin vinyl, cedar and gates · licensed"],
    eeatSets: [[["#1089233", "Placer licensed"], ["HOA staging", "Matching caps"], ["Rocklin crews", "Ranch tracts"], ["Free estimate", "Rock check at dig"]], [["License 1089233", "Fence contractor"], ["40+ years", "Wood and vinyl"], ["Local", "Secret Ravine routes"], ["Written scope", "Before HOA photos"]]],
  },
  "grass-valley": {
    uniqueParagraphs: [
      "Grass Valley properties from downtown outward mix historic picket fronts with tall cedar privacy out back toward the timber line. Snow load and wet winter soil mean posts set shallower than valley specs often lean by spring.",
      "Neighborhoods approaching Brunswick Basin see heavier truck traffic; gates and hinge posts take abuse when owners back trailers daily. We upgrade hinge hardware and post size at those openings first.",
      "Foothill fire awareness shows up as non-combustible zones near some structures; we note when metal or shorter open fencing may be preferred next to defensible-space planning even if wood is used elsewhere.",
    ],
    processClauses: ["On Nevada County foothill soils that stay wet into March, ", "For Grass Valley yards where winter lean follows freeze-thaw cycles, ", "When Grass Valley gate openings see daily equipment traffic, "],
    footerTaglines: ["Twin Rivers Fence · Grass Valley and Nevada County · #1089233", "Downtown to Brunswick · foothill fence crew", "Grass Valley repair and install · Twin Rivers LLC"],
    eeatSets: [[["#1089233", "Nevada County"], ["Foothill winters", "Deeper footings"], ["Grass Valley", "Local dig crews"], ["Free visit", "Post lean check"]], [["License 1089233", "CA contractor"], ["40+ years", "Cedar and chain link"], ["Gold Country", "Grass Valley routes"], ["Honest scope", "Repair vs replace"]]],
  },
  "nevada-city": {
    uniqueParagraphs: [
      "Nevada City hillside lots on narrow streets leave little room to swing long panels; we pre-build sections in the driveway or street when permitted, then walk them into place to avoid crushing plantings.",
      "Historic district expectations favor lower front fences and simpler profiles that do not compete with Victorian trim. Rear yards toward the ravine may still need six-foot privacy; height transitions happen at the house corner, not mid-yard.",
      "Decomposed granite and tree roots on Banner Mountain approaches mean post locations flex around obstacles while keeping latch alignment on gates. We mark those offsets on the scope so future owners know the line was intentional.",
    ],
    processClauses: ["On Nevada City slopes with tight access and historic frontage rules, ", "Where Nevada County granite and roots deflect standard post spacing, ", "For Nevada City properties balancing street character and rear privacy, "],
    footerTaglines: ["Twin Rivers · Nevada City historic and hillside · #1089233", "Banner Mountain to downtown · Twin Rivers Fence", "Nevada City fences and gates · licensed crew"],
    eeatSets: [[["#1089233", "Nevada County licensed"], ["Historic-aware", "Front height planning"], ["Nevada City crews", "Tight-access installs"], ["Free estimate", "Slope and access walk"]], [["CSLB 1089233", "Fence and gate work"], ["40+ years", "Foothill experience"], ["Local routes", "Nevada City weekly"], ["Clear quote", "Panel carry plan"]]],
  },
  auburn: {
    uniqueParagraphs: [
      "Auburn lots along the I-80 corridor and up toward Old Town sit on varied grade. Level panels on a slope telegraph every inch of error. We use stepped tops or racked panels depending on whether the HOA or the view matters more.",
      "Horse properties and semi-rural parcels off Auburn Folsom Road need wider gates and braced posts where animals push on rails. Hardware is galvanized or coated to survive dust and occasional irrigation overspray.",
      "Older Auburn neighborhoods near the fairgrounds combine chain link side yards with wood privacy out back; we tie new work to existing post sizes so transitions do not look like two contractors decades apart.",
    ],
    processClauses: ["On Placer County Auburn grades where stepped tops are mandatory, ", "For Auburn ranch parcels with livestock pressure on gates, ", "When Auburn semi-rural lines mix chain link and wood in one perimeter, "],
    footerTaglines: ["Twin Rivers Fence · Auburn and Placer foothills · #1089233", "Old Town Auburn to corridor · licensed installs", "Auburn gates, wood and vinyl · Twin Rivers LLC"],
    eeatSets: [[["License #1089233", "Placer County"], ["Ranch gates", "Braced posts"], ["Auburn crews", "Slope and flat"], ["Free quote", "Equipment paths measured"]], [["#1089233", "Insured"], ["40+ years", "Wood and chain link"], ["Local", "Auburn Folsom Rd area"], ["On-site", "Before material haul"]]],
  },
  lincoln: {
    uniqueParagraphs: [
      "Lincoln Sun City and newer west-side tracts emphasize low-maintenance vinyl and consistent lattice tops where covenants require them. We verify manufacturer SKUs against HOA lists before ordering because returns on wrong color white are costly delays.",
      "East Lincoln and rural stretches toward Wheatland swap HOAs for longer agricultural runs and pipe-rail gates. Corner bracing and stretch wire tension matter more than decorative caps on those perimeters.",
      "Thunder Valley casino corridor traffic does not change fence specs, but noise prompts taller solid privacy along some back lines facing arterials. We discuss acoustic limits honestly because wood helps sight lines more than sound.",
    ],
    processClauses: ["For Lincoln active-adult communities with strict vinyl palettes, ", "On east Lincoln agricultural edges with long straight runs, ", "When Lincoln rear lines face busy arterials and need solid privacy, "],
    footerTaglines: ["Twin Rivers · #1089233 · Lincoln and west Placer · #1089233", "Sun City to rural Lincoln · Twin Rivers Fence", "Lincoln vinyl, wood and repair · licensed"],
    eeatSets: [[["#1089233", "Placer / Lincoln"], ["HOA vinyl", "SKU matched"], ["Lincoln crews", "West and east"], ["Free walk", "Covenant check"]], [["License 1089233", "Contractor"], ["40+ years", "Farm and tract"], ["Local scheduling", "Lincoln routes"], ["Written scope", "Gate widths for gear"]]],
  },
  "penn-valley": {
    uniqueParagraphs: [
      "Penn Valley parcels are often wider than deep, with oak shade and seasonal creeks influencing where soil stays soft. We avoid placing hinge posts in low spots that pond after January storms unless drainage is corrected first.",
      "Custom gate openings for tractors and fire access repeat on Penn Valley ranches; double gates need drop rods and secondary latches that still meet everyday pedestrian use without dragging.",
      "Wildland interface concerns appear on lots backing open grassland. Owners sometimes want a shorter open wire section near the house pad and taller privacy toward the road; we plan transitions so fire crews retain sight lines where requested.",
    ],
    processClauses: ["On Penn Valley ranch lots with seasonal wet strips along creeks, ", "Where Penn Valley driveways need wide double gates for equipment, ", "For Penn Valley perimeters mixing open wire and privacy sections, "],
    footerTaglines: ["Twin Rivers Fence · Penn Valley and ridge communities · #1089233", "Ranch gates and cedar lines · Twin Rivers LLC", "Penn Valley licensed fence work · #1089233"],
    eeatSets: [[["#1089233", "Nevada County rural"], ["Ranch gates", "Drop rods set"], ["Penn Valley", "Creek-lot experience"], ["Free estimate", "Access and grade"]], [["License 1089233", "CA fence"], ["40+ years", "Wire and wood"], ["Local crews", "Penn Valley routes"], ["Honest advice", "Drainage at posts"]]],
  },
  "lake-wildwood": {
    uniqueParagraphs: [
      "Lake Wildwood gates and fence segments must respect association rules on height, color, and visibility from the golf course fairways. We submit rough sketches when the architectural committee asks for them before install week.",
      "Slopes down toward the lake shrink usable yard depth; stepped vinyl or wood keeps privacy without requiring impossible post depths on cut banks. Retaining edges near fences get checked so runoff does not undercut footings.",
      "Second-home owners often want low-maintenance vinyl with keyed latches matching community standards. We photograph existing approved homes when matching a new run to neighborhood precedent.",
    ],
    processClauses: ["Inside Lake Wildwood where association design review applies, ", "On Lake Wildwood slopes above the water line with cut banks, ", "For Lake Wildwood second homes needing match-the-neighbor vinyl, "],
    footerTaglines: ["Twin Rivers · Lake Wildwood association installs · #1089233", "Gated community fence work · Twin Rivers Fence", "Lake Wildwood vinyl and gates · licensed crew"],
    eeatSets: [[["#1089233", "Lake Wildwood"], ["ARC-ready", "Sketch support"], ["Association rules", "Height and color"], ["Free visit", "Pre-committee photos"]], [["License 1089233", "Insured"], ["40+ years", "Vinyl privacy"], ["Local", "Lake Wildwood routes"], ["Clear scope", "Slope and drainage"]]],
  },
  "rough-and-ready": {
    uniqueParagraphs: [
      "Rough and Ready homesteads and small-acre plots favor practical wire and wood combinations that keep livestock in without ornate trim. Posts are often set in native clay that cracks in summer; concrete collars above grade reduce moisture wicking.",
      "Limited street frontage means many fences are visible only to neighbors who share long property lines. We confirm pins and talk through shared-cost sections when both owners want the same upgrade.",
      "Fire season prep sometimes prompts clearing along fence lines; we set new runs back from brush when owners want defensible space, using wire where visibility matters and wood where privacy is still needed near the house.",
    ],
    processClauses: ["On Rough and Ready acreage where clay cracks in dry months, ", "When Rough and Ready shared lines need matching specs with neighbors, ", "For Rough and Ready perimeters balancing wire livestock fencing and home privacy, "],
    footerTaglines: ["Twin Rivers Fence · Rough and Ready and Penn Valley fringe · #1089233", "Rural wire, wood and gates · Twin Rivers LLC", "Rough and Ready licensed fence crew · #1089233"],
    eeatSets: [[["#1089233", "Rural Nevada County"], ["Wire and wood", "Livestock aware"], ["Rough and Ready", "Acreage routes"], ["Free quote", "Line pins and access"]], [["License 1089233", "Contractor"], ["40+ years", "Practical ranch fencing"], ["Local", "Grass Valley area"], ["Straight talk", "Repair vs full run"]]],
  },
  "north-san-juan": {
    uniqueParagraphs: [
      "North San Juan properties along the Yuba follow narrow county roads with limited staging room for material drops. We plan delivery times and panel lengths so trucks are not blocking one-lane traffic during peak commute.",
      "Historic mining-era lots may have retaining walls, rock outcrops, and fences that predate current codes. We document what stays, what gets rebuilt, and how new height meets county expectations without assuming a blank slate.",
      "Oak woodland shade keeps north-facing wood damp; stainless or coated fasteners matter on those runs. South-facing sections on the same lot may dry quickly, so mixed hardware and board treatment within one job is normal here.",
    ],
    processClauses: ["Along North San Juan road frontage with tight staging, ", "Where North San Juan rock walls and old lines constrain post placement, ", "On North San Juan wooded lots with split sun exposure on one fence, "],
    footerTaglines: ["Twin Rivers · North San Juan and ridge roads · #1089233", "Yuba corridor fence work · Twin Rivers Fence", "North San Juan repair and install · licensed"],
    eeatSets: [[["#1089233", "Nevada County"], ["Tight staging", "Road-aware drops"], ["North San Juan", "Historic lots"], ["Free estimate", "Rock and wall survey"]], [["License 1089233", "CA fence"], ["40+ years", "Wood and wire"], ["Local crews", "Ridge routes"], ["Written scope", "Mixed exposure boards"]]],
  },
  "chicago-park": {
    uniqueParagraphs: [
      "Chicago Park rural parcels stretch along county roads with mixed pasture and residential uses. Fence height often steps down toward the road for visibility while back fields use taller wire or wood for deer pressure.",
      "Timbered lots lose sunlight early; moss on north-side boards is common and does not always mean structural failure. We distinguish cosmetic growth from post rot before recommending full replacement.",
      "Seasonal residents sometimes want winter-ready latches and gates that still operate when snow piles along the opening. We set hinge height and latch type with snow clearance in mind on those driveways.",
    ],
    processClauses: ["On Chicago Park road-front lots needing lower visibility fencing, ", "Where Chicago Park timber shade masks post condition until probed, ", "For Chicago Park seasonal homes with snow-prone gate openings, "],
    footerTaglines: ["Twin Rivers Fence · Chicago Park and Sierra foothills · #1089233", "Pasture wire to home privacy · Twin Rivers LLC", "Chicago Park licensed fencing · #1089233"],
    eeatSets: [[["#1089233", "Rural foothill"], ["Deer and pasture", "Height steps"], ["Chicago Park", "County road lots"], ["Free visit", "Road set-back check"]], [["License 1089233", "Insured"], ["40+ years", "Wood and wire"], ["Local", "Chicago Park routes"], ["Repair focus", "Rot vs moss"]]],
  },
  "alta-sierra": {
    uniqueParagraphs: [
      "Alta Sierra subdivision loops on cul-de-sacs often have rear lines that drop five feet in twenty linear feet. Stepped cedar or racked vinyl prevents gaps that dogs exploit while keeping a level top sight line from the patio.",
      "Golf course-adjacent homes face association sight-line rules toward fairways; we use approved colors and heights that still block ball retrieval paths where owners want privacy from walkers.",
      "Timbered backyard lots in Alta Sierra hold moisture under pine duff; posts need drainage at the base even when the yard looks dry on the surface. We cut back duff carefully rather than burying it against new wood.",
    ],
    processClauses: ["On Alta Sierra cul-de-sac slopes where stepped fencing is standard, ", "For Alta Sierra homes with golf-course visibility rules, ", "Where Alta Sierra pine duff traps moisture at post bases, "],
    footerTaglines: ["Twin Rivers · Alta Sierra and Grass Valley edge · #1089233", "Subdivision slopes and privacy · Twin Rivers Fence", "Alta Sierra cedar, vinyl and gates · licensed"],
    eeatSets: [[["#1089233", "Alta Sierra"], ["Stepped installs", "Dog-safe bottoms"], ["Golf-course rules", "Color matched"], ["Free quote", "Grade walk"]], [["License 1089233", "Contractor"], ["40+ years", "Foothill subdivisions"], ["Local crews", "Alta Sierra loops"], ["Clear scope", "Drainage at posts"]]],
  },
};

fs.writeFileSync(
  "seo-city-unique-paragraphs.mjs",
  "/** City-specific unique copy merged into seo-city-data city objects. */\nexport const cityUniqueContent = " +
    JSON.stringify(cityUniqueContent, null, 2) +
    ";\n",
  "utf8"
);
console.log("Wrote seo-city-unique-paragraphs.mjs", Object.keys(cityUniqueContent).length, "cities");
