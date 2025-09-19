{topic_domain} SEO Brief — Structured Prompt

You are a world-class SEO strategist and prompt engineer. Use the provided M inputs to generate N item-level SEO briefs. Inputs you will receive now (M inputs):

- concepts
- topic_domain
- locales
- audience_personas
- competitor_examples (optional)
- constraints (house style, compliance notes, brand voice)
- data_sources (optional; docs/text to mine for facts)

You will later receive an array of N items (e.g., surf spots) with at least a unique name field (e.g., spot_name). For each item, output exactly one YAML block following the schema below and nothing else.

1. OBJECTIVE & SUCCESS CRITERIA

- Define user intent to satisfy (primary + secondary).
- Define business goals (conversion, lead, retention).
- Define KPIs (organic sessions, CTR, scroll depth, conversions).

2. REQUIRED OUTPUT FORMAT (for each item) Return a single YAML block per item with the schema below. If data is unknown, infer from sources or leave null with a TODO:

```yaml
seo_brief:
id: spot-{{spot_name}}
locale: en
primary_keyword: "surf dakar {{spot_name}}",
keyword_cluster: [ "surf senegal", "surf spots dakar", "surf waves", "best surf dakar" ]
search_intent: informational
audience_notes: "surfers and tourist traveling to Dakar"
serp_snapshot: "Mostly local surf camp and global surf meteo report"
result_types: [ {{"map_pack","video","image_pack","top_stories","shopping","sitelinks"}} ]
top_competitors: [ "https://www.surf-report.com/news/voyages/afrique-senegal-dakar-surf-body-board-voyage-surf-trip-1228227218.html" ]
content_gaps: [ {{bullets}} ]
entities:
primary: [ {{core_entities}} ]      # e.g., Place, Beach, Tide, Swell, Safety
supporting: [ {{related_entities}} ] # e.g., Nearby towns, seasons, wildlife
surf_attributes:
  break_type: { one_of: [ reef, point, beach, jetty, slab, rivermouth ] }
  wave_directions: [ left, right, a-frame ]
  typical_wave_height_m: { min: {{min}}, max: {{max}} }
  optimal_swell:
    directions: [ {{W}}, {{NW}}, {{N}}, {{NE}}, {{E}}, {{SE}}, {{S}}, {{SW}} ]
    period_seconds: { min: {{min}}, optimal: {{opt}}, max: {{max}} }
    size_ft: { min: {{min}}, optimal: {{opt}}, max: {{max}} }
  optimal_wind:
    directions_offshore: [ {{N}}, {{NE}}, {{E}}, {{SE}}, {{S}}, {{SW}}, {{W}}, {{NW}} ]
    tolerances: { cross_shore_ok: {{boolean}}, onshore_ok: {{boolean}} }
    speed_knots_max: {{max_knots}}
  tides:
    best_tide: [ low, mid, high, pushing, dropping ]
    tide_range_m: { spring: {{spring}}, neap: {{neap}} }
    notes: {{tide_notes}}
  bottom: [ sand, reef, rock, cobblestone ]
  crowd_level: { typical: {{low|medium|high}}, seasonal_peaks: {{notes}} }
  skill_level: { min: {{beginner|intermediate|advanced}}, ideal: {{level}}, notes: {{notes}} }
  hazards: [ urchins, rocks, rips, shorebreak, localism, pollution ]
  access: { approach: {{text}}, parking: {{text}}, fees: {{text}}, public_transport: {{text}} }
  amenities: [ showers, lifeguards, rentals, schools, toilets, food ]
  local_vibe: [ friendly, mellow, territorial ]
  etiquette_notes: {{text}}
  board_recommendations: [ fish, shortboard, step-up, longboard, soft-top ]
  seasonality:
    best_months: [ {{months}} ]
    shoulder_months: [ {{months}} ]
    no_go_months: [ {{months}} ]
  water_temp_c_by_month: { jan: {{c}}, feb: {{c}}, mar: {{c}}, apr: {{c}}, may: {{c}}, jun: {{c}}, jul: {{c}}, aug: {{c}}, sep: {{c}}, oct: {{c}}, nov: {{c}}, dec: {{c}} }
  wetsuit_by_month: { jan: {{suit}}, feb: {{suit}}, mar: {{suit}}, apr: {{suit}}, may: {{suit}}, jun: {{suit}}, jul: {{suit}}, aug: {{suit}}, sep: {{suit}}, oct: {{suit}}, nov: {{suit}}, dec: {{suit}} }
  nearby_spots: [ {{names_or_slugs}} ]
outline:
h1: {{title_h1}}
h2: [ {{h2_1}}, {{h2_2}}, ...]
  h3_map: { {{h2_1 } }: [ {{h3...}} ], {{h2_2}}: [ {{h3...}} ] }
  tl;dr_answer: Find the best surf spots in Dakar, Senegal, with tips on conditions, access, and local vibe.
  content_specs:
  word_count_range:  800-1500
  reading_level: Grade 9-12
  tone: expert but friendly
  required_facts: bullets of verifiable facts to include
  media_plan:
  images: [ { slot: "hero", suggested_subject: "", alt_text: "" }, ... ]
  tables: [
    { name: "conditions_by_month", cols: [ "month","swell","wind","temp","crowd" ] },
    { name: "tide_windows", cols: [ "window","start","end","notes" ] },
    { name: "wind_compatibility", cols: [ "direction","offshore?","cross_shore?","onshore?","max_knots" ] },
    { name: "swell_dir_period_grid", cols: [ "direction","min_period_s","optimal_period_s","size_ft" ] },
    { name: "wetsuit_by_month", cols: [ "month","water_temp_c","recommended_wetsuit" ] },
    { name: "hazards_checklist", cols: [ "hazard","likelihood","mitigation" ] },
    { name: "access_and_parking", cols: [ "approach","parking","fees","public_transport" ] },
    { name: "skill_fit_by_size", cols: [ "wave_height_ft","beginner","intermediate","advanced" ] }
  ]
  widgets: [ { type:"map", purpose:"locate spot" }, { type:"tide" }, { type:"forecast" }, { type:"wind" }, { type:"webcam", purpose:"live conditions", availability:"if available" } ]
  onpage_elements:
  url_slug: {{slug}}
  page_title: {{<= 60 char, descriptive, intent-matched}}
  meta_description: {{<= 155 char, compelling benefit + CTA}}
  canonical: {{absolute_url}}
  robots: {{index,follow}}
  og_tags:
  og:title: {{...}}
  og:description: {{...}}
  og:image_hint: {{description of ideal image}}
  internal_linking:
  parent_hub: {{url_or_slug}}
  siblings: [ {{related_spot_slugs}} ]
  anchors_out: [ { to:"/learn/swell-basics", anchor:"swell period guide" } ]
  anchors_in_suggested: [ {{phrases to attract links from hubs}} ]
  structured_data:
  # Follow Google SD general guidelines; only mark what’s on-page & accurate.
  jsonld_blocks:
    - type: WebPage
    - type: BreadcrumbList
    - type: SportsActivityLocation
    - type: Place
  props:
  name: {{spot_name}}
  geo: { latitude: {{lat } }, longitude: {{lng}} }
  address: {{if applicable}}
  openingHours: {{if applicable}}
  notes: >
  Do NOT include FAQPage/HowTo by default; use only if site is eligible and content matches.
  page_experience_targets:
  core_web_vitals:
  LCP: "<=2.5s"
  CLS: "<=0.1"
  INP: "<=200ms"
  perf_actions: [ {{image compression, lazy-hydration, critical CSS, defer non-critical JS}} ]
  accessibility: [ {{alt text, headings order, focus states}} ]
  compliance:
  claims_require_citations: true
  safety_disclaimers: [ {{e.g., rip currents, local laws}} ]
  measurement:
  events: [ {{cta_click, map_interaction, phone_click, forecast_widget_view, webcam_view, whatsapp_click, book_camp_cta}} ]
  fields_for_dashboard: [ {{impressions, CTR, avg_position, conversions, scroll_depth, time_on_page}} ]
```

3. GENERATION STEPS (what the LLM/agent must do per item)

- Determine intent from the query and SERP; mirror winning content formats without copying.
- Extract/entities: list primary & supporting entities; map attributes (seasonality, wind, swell, hazards).
- Build outline (H1–H3) that answers intent early (TL;DR), then expands with evidence and practical tips.
- Specify internal links that connect to hubs & related pages using descriptive anchors.
- Propose structured data blocks (JSON-LD) that match on-page content only.
- Set Core Web Vitals targets and suggest concrete perf actions to hit them.
- Draft title/meta aligned with intent; avoid clickbait and duplication across site.
- Compute surfer-critical windows: optimal swell (direction/period/size), wind (offshore/cross/onshore + speed), and tide (best state, pushing/dropping), and summarize as a conditions cheat-sheet early on.
- Populate surf_attributes with precise, locale-aware details: break type, bottom, typical wave height, crowd, skill level, hazards, access/parking, amenities, local vibe/etiquette, nearby spots.
- Provide seasonality, water temperatures, and wetsuit recommendations by month; include board recommendations by typical wave size/energy.
- Include a practical access section: approach, parking, fees, public transport; add safety and emergency notes where relevant.
- Ensure media and widgets help decision-making: map pin location, tide and forecast widgets, optional webcam; all images have descriptive alt including spot and condition context.

4. QUALITY GATES (auto-checks the agent must pass)

- People-first & fact-checked; no hallucinated stats without a source.
- Title/H1 express primary task; intro answers the query within 2–3 sentences.
- SD validates in Rich Results Test (syntactically plausible JSON-LD).
- Links are crawlable; anchors are descriptive.
- No reliance on FAQ/HowTo visibility; Q&A exists for users, not SERP gaming.
- Meets CWV targets (or includes a remediation plan).
- Presence check: page includes concise sections for Conditions (swell/wind/tide), Access, Hazards, Seasonality, Gear (boards + wetsuit), and Etiquette/Local vibe.
- TL;DR explicitly states when the spot works (swell dir/period/size, wind, tide) in plain language.
- Structured data includes accurate coordinates; name matches H1; only on-page facts are marked up.
- Media has meaningful alt text ("SpotName: condition context"); tables and widgets render with complete headers/labels.
- Safety disclaimers are included when hazards are non-trivial; claims needing citations are supported.

5. M→N MAPPING RULE

- This Structured Prompt must accept an array of N items (e.g., N surf spots). For each item, output one `seo_brief` YAML as defined above. No prose outside YAML blocks.
- Accept inputs: {concepts}, {topic_domain}, {locales}, {audience_personas}, {competitor_examples?}, {constraints}, {data_sources?}.
- If a field is unknown, infer from sources or leave null with a TODO. Respect constraints and house style.
