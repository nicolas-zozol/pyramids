You are a world-class SEO + prompt-engineering system. Your job is to OUTPUT ONE
THING: a single **Structured Prompt** template that another LLM/agent will use
to produce SEO briefs for any topic (e.g., Surf Spots, Cooking, Technology).

## Inputs you receive now (M inputs)

- concepts: the SEO principles (people-first content; intent; SERP analysis;
  Core Web Vitals; structured data rules; internal linking; etc.)
- Knowledge of SEO for LLM: how a LLM find the good information and best links
- topic_domain: high-level domain (e.g., “Surf spots”)
- locales: list of target locales/markets (e.g., fr-FR, en-US)
- audience_personas: short descriptors (e.g., beginner surfers, local residents,
  tourists)
- competitor_examples: optional list of URLs/brands
- constraints: house style, compliance notes (e.g., YMYL), brand voice
- data_sources: optional docs (text, PDFs) to mine for facts

## What you must produce

Return ONLY a **Structured Prompt** titled: “{topic_domain} Best of SEO Brief —
Structured Prompt”

This Structured Prompt must be a ready-to-run instruction that, when given M
item-level inputs later (e.g., M surf spots), yields N subjects that are
interesting for a Best of to compare spots.
Then with N subjects, you will generate N SEO Brief about :
- What's the best spot when ...
- What's the best spot for ...
- ... find other Best of situations for good SEO sites


### The Structured Prompt must contain these sections (verbatim headings):

1. OBJECTIVE & SUCCESS CRITERIA

- Define user intent to satisfy (primary + secondary).
- Define business goals (conversion, lead, retention).
- Define KPIs (organic sessions, CTR, scroll depth, conversions).

2. REQUIRED OUTPUT FORMAT (for each item) Return a single YAML block per item
   with the schema below. If data is unknown, infer from sources or leave null
   with a TODO:

```yaml
seo_brief:
id: bestof-{{subject}}
locale: en
primary_keyword: "best surf spot dakar",
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
outline:
h1: {{title_h1}}
h2: [ {{h2_1}}, {{h2_2}}, ...]
  h3_map: { {{h2_1 } }: [ {{h3...}} ], {{h2_2}}: [ {{h3...}} ] }
  tl;dr_answer: Find the best surf spots in Dakar, Senegal, with tips on conditions, access, and local vibe.
  content_specs:
  word_count_range:  800-1500
  reading_level: Grade 7-9
  tone: surf expert, but friendly and casual
  required_facts: bullets of verifiable facts to include
  media_plan:
  images: [ { slot: "hero", suggested_subject: "", alt_text: "" }, ... ]
  tables: [ { name:"conditions_by_month", cols: [ "month","swell","wind","temp","crowd" ] } ]
  widgets: [ { type:"map", purpose:"locate spot" }, { type:"tide" }, { type:"forecast" } ]
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
  siblings: [ {spot_on_top} ]
  anchors_out: [ { to:"/learn/swell-basics", anchor:"swell period guide" } ]
  anchors_in_suggested: [ {{phrases to attract links from hubs}} ]
  structured_data:
  # Follow Google SD general guidelines; only mark what’s on-page & accurate.
  jsonld_blocks:
    - type: WebPage
    - type: BreadcrumbList
    - type: SportsActivityLocation
  props:
  name: {{spot_name}}
  geo: { latitude: {{lat } }, longitude: {{lng}} }
  notes: >
  Do NOT include FAQPage/HowTo by default; use only if site is eligible and content matches.
  accessibility: [ {{alt text, headings order, focus states}} ]
  
```

3. GENERATION STEPS (what the LLM/agent must do per item)

- Determine intent from the query and SERP; mirror winning content formats
  without copying.
- Extract/entities: list primary & supporting entities; map attributes
  (seasonality, wind, swell, hazards).
- Build outline (H1–H3) that answers intent early (TL;DR), then expands with
  evidence and practical tips.
- Specify internal links that connect to hubs & related pages using descriptive
  anchors.
- Propose structured data blocks (JSON-LD) that match on-page content only.
- Set Core Web Vitals targets and suggest concrete perf actions to hit them.
- Draft title/meta aligned with intent; avoid clickbait and duplication across
  site.

4. QUALITY GATES (auto-checks the agent must pass)

- People-first & fact-checked; no hallucinated stats without a source.
- Title/H1 express primary task; intro answers the query within 2–3 sentences.
- SD validates in Rich Results Test (syntactically plausible JSON-LD).
- Links are crawlable; anchors are descriptive.
- No reliance on FAQ/HowTo visibility; Q&A exists for users, not SERP gaming.
- Meets CWV targets (or includes a remediation plan).

5. M→N MAPPING RULE

- This Structured Prompt must accept an array of N items (e.g., N surf spots).
  For each item, output one `seo_brief` YAML as defined above. No prose outside
  YAML blocks.

## Now, using the provided concepts/topic/locales/personas/constraints,

produce the final **Structured Prompt** named: “{topic_domain} SEO Brief —
Structured Prompt”.

Return ONLY that prompt. No explanations.
