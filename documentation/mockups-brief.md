# robusta.build v3 — mockups brief for Claude Design

## What I want from you

Mockups of robusta.build, the personal site of Nicolas Zozol, as a set of pages built with the existing Robusta Build design system described below. Not a new identity: the hand-drawn sketchnote language stays, the pages and the content change. For each page, one desktop frame at 1280 and one mobile frame at 360, plus a components inventory, see Deliverables.

The attached files are the real design system: `colors_and_type.css` holds the tokens, `sketch.css` the primitives and the layout of the current sections, `marketing-page.html` the current home page, `robusta-build-wordmark.svg` and `crystal-tux.svg` the brand assets. Start from them.

The site runs on Pyramids, a static site generator of mine: every page is prerendered at build, nothing runs on a request, and every text is a slot the site fills in three languages. The constraints that follow are listed under Hard constraints. They decide whether a mockup can be coded, so treat them as part of the brief.

## Who I am, in facts

- Nicolas Zozol, senior fullstack engineer, Toulouse, France, remote. Twenty years shipping software, freelance since 2007. Toptal top 3% since 2018. Oracle Certified Java Master. Science teacher in France and the U.S. before that, 2000–2007.
- Brand: robusta.build. Contact: nicolas@robusta.build and LinkedIn. No phone on the site, no form.
- Engagements I can name: Swaap Finance, first engineer, 2021–2024, from a demo to a multi-site monorepo, TVL 0 → $5M, $1B+ monthly volume. Boston Consulting Group via Toptal, 2018, an ETL rewrite that saved $25k+ in consulting fees. Diool Payments via Toptal, 2019–2021, frontend lead, AngularJS → Angular migration. Nauto AI via Toptal, 2019, a real-time alarm dashboard in React.
- Community: organizer of the Toulouse Java User Group since 2019. Stack Overflow, 7000+ reputation since 2010.

## Positioning

I build the systems that let AI coding agents produce software that holds in production: the agent workflows, the harness around the agents, the MCP servers and tools they call, the documents they work from, the evals that say whether they did the job. RB Compound is the method, the products below are the proof, the blog is where I explain. I work with technical leads and teams who already use coding agents and want them to produce maintainable software.

In three seconds the visitor must read: senior engineer, builds with AI agents, available for an engagement. Not an agency, not a course seller, not a content creator.

Vocabulary buyers search for, to use as precise nouns where they name something I do: AI coding agents, agentic engineering, agent harness, multi-agent orchestration, MCP servers, context engineering, spec-driven development (I say documents first), evals, Claude Code. Never as adjectives, never three in a row. Banned: cutting-edge, unlock, empower, supercharge, 10x, passionate, seamless.

## The products, what makes the site alive

The site must read like the workshop of someone who ships: what exists, what is maintained, what is being built this month. Each product has a card: name, one line, status, stack, a link (GitHub, docs or an article), and a latest move, a dated one-liner that the build reads from a markdown file. The home shows the latest moves across products; the products page shows every card in full.

- RB Compound — the documents-first workflow for AI coding agents: a story, a design the team approves, then test-first code, run by named agents (epicman, storyman, designman, bsman, tddman, codeman, docman, boss). Two versions: open source, three agents, coming as a plugin, not published yet; complete, with a paid accompaniment of the team. Status: in daily use, plugin coming.
- Masala Parser — parser combinators for JavaScript and TypeScript, an implementation of Haskell's Parsec: from a regex replacement to a full compiler. Open source since 2013, ~140 GitHub stars, 8 contributors, 450+ unit tests. Status: maintained.
- Massivoto — an automation programming language: a DSL that chains commands with variable flow and human checkpoints, `@store/load … @ai/generate … @human/validation … @email/send`. An open source platform and its interpreter. Status: in progress.
- Rooftop — in progress, not public. [one line from Nicolas: what rooftop does]. Show it as a work-in-progress card.
- herdr — the terminal workspace manager for AI coding agents my day runs in: workspaces, panes, and the state of each agent, blocked, working, done, idle. [Nicolas: author or power user, state which]. Status: [to confirm].

Real content only. When a fact is missing, leave a bracketed slot. Never invent a number, a logo, a quote or a client.

## Pages

Header and footer on every page.

- Header: the wordmark lockup, links to products, resume and articles, one link per other language, `français` and `español`, then a `contact me` call to action. The language switch is two links, not a dropdown.
- Footer: tagline, link columns, pages, products, articles by category, elsewhere (GitHub, LinkedIn, Stack Overflow), then the copyright. No newsletter.

1. Home, `/`
   - Hero: who, what, available. Primary call to action the email, secondary LinkedIn. Crystal Tux once, with a handwritten annotation.
   - Now building: three to five dated latest moves across products, like a lab notebook page. The liveliest block of the site.
   - RB Compound: the two flow diagrams on dotted paper, condensed. Open source: epic → story → design → validation → code. Complete: story → brainstorm → design → code → docs.
   - Products: the cards, compact, linking to the products page.
   - What I take on: four engagements as sticker cards, fullstack product engineering, agent systems and harnesses, parsers, compilers and dev tooling, legacy rescues and migrations. Each card says the shape of the engagement and the outcome, not a feature list.
   - Writing: the latest articles, title, excerpt, date, category.
   - Closing call to action: let's talk about your team. Email and LinkedIn, no form.
2. Products, `/products`: every card in full, one page with an anchor per product: a paragraph, a code or terminal sample where it helps (a `.oto` program, a Masala combinator, the RB Compound slang), status, links, the latest moves of that product.
3. Resume, `/resume`: a page that reads as a CV and prints well. A header block, name, title, location, availability, contact. A timeline of engagements with their outcomes. Open source, community, teaching years, certification, spoken languages [slot]. A `download pdf` sticker button.
4. Blog home, `/articles`: the h1 `articles`, a roll of 12 posts, title, excerpt, date, category tag, then `newer articles` and `older articles` as hand-drawn arrows, and the list of categories.
5. Category, `/articles/c/<category>`: a breadcrumb `articles › typescript`, the h1 is the category label, the same roll.
6. Article, `/articles/<slug>`: breadcrumb, h1, published date and `updated on` when present, author, a 16:9 cover filling its box, the body in a 68ch measure, h2 and h3, paragraphs, code blocks in Plex Mono, callouts, images with captions, lists. End of article: the category link, a `read it in French` link, up to three related articles.
7. 404: keep the current one, consistent with the rest.

## Hard constraints from Pyramids

- A page is a stack of full-width sections, each made of the design system's primitives. Name every new section.
- Every text, alt texts, labels and placeholders included, is a slot the site fills per language. Design in English, check that French strings 30% longer still fit, and that `español` fits in the header.
- Three languages, `/` English, `/fr`, `/es`, same layout in each.
- No backend: no form, no newsletter, no comments, no search, no cookie banner. The call to action is an email and a LinkedIn link.
- No client state in the components: no dropdown, no carousel, no tabs, no modal, no theme toggle. Light theme only.
- Blog roll of 12, newest first, flat categories, one category per article, tags have no page.
- Covers are plain 16:9 images. The article body is markdown rendered to HTML: design the prose styles, not a page builder.
- Exactly one h1 per page. A breadcrumb on article and category pages.
- No photography. Diagrams are hand-drawn, screenshots are not used.

## The design system to use

Voice: lowercase by default, proper nouns and acronyms keep their case, first person, direct, technically precise, em dashes and arrows welcome, `// eyebrow` lines in mono, no emoji in copy. The only emoji are the two glyphs of the logo lockup.

- Paper and ink: `--paper` #fafaf7 background, `--paper-2` #f3f1ea secondary panels, `--ink` #1a1a1a strokes and headings, `--ink-soft` #2b2b2b body, `--ink-mute` #6b6b66 captions. Color covers 5–10% of a composition.
- Brand ramps, each with a `-soft` tint used as a highlighter wash and a `-deep` tone for hover: primary #562571 purple, the primary action; secondary #FFCC3F gold; accent #0B65C2 blue, links and focus. Never a colored full background.
- Type: IBM Plex Sans for body, headings and UI; IBM Plex Mono for code and eyebrows; Caveat only for the logo and rare handwritten annotations. No Inter, Roboto, system-ui or any clean geometric sans.
- Type scale, ten steps, display 34–80px, h1 28–56, h2 24–40, h3 20–28, h4 18–20, lead 17–19, body 16–17, small 14–15, tiny 12–13, code 13–14. Line length 68ch for prose.
- Breakpoints 640, 768, 1024, 1280, 1536; 320 is the floor, nothing scrolls sideways there. Mobile first.
- Motifs: wobbly SVG-path borders instead of CSS borders; stickers, a solid black offset 4px down-right, no drop shadow anywhere; speech-bubble callouts; hand-drawn arrows; a pink under-squiggle on an emphasized word; wavy dividers; dotted bullet-journal grid behind diagrams; tags; cards tilted ±0.4–0.6°, a few pixels of jitter between siblings. Radii 3–10px.
- Existing sections to reuse: SiteHeader, Hero, ServicesGrid, FlowDiagram, PrinciplesList, NotesPreview, CTA, SiteFooter. Existing primitives: BrandLogo, SkButton (primary and ghost), SkCallout, SkTag, SkInput, SkArrowRight.
- Don't: gradients, glassmorphism, blur, 3D, photo backgrounds, rounded cards with a colored left border, the SaaS hero with a screenshot on the right, an icon for every label, icon fonts. Icons are inline hand-drawn SVG, stroke 1.8, round caps.
- Crystal Tux and the cast of The theme below: one scene per page, in the margins, dividers, empty states and diagram props. Never a full-color illustration competing with the copy.

## The theme: Robusta Station, the wrong hemisphere club

The set is the Antarctic ice: paper is snow, ink is the line, the two washes are the sky, purple for the aurora australis, gold for the low sun. The joke that holds the cast: everyone is in the wrong hemisphere except the penguin. The polar bear and the igloo come from the Arctic, an oak has no business on the ice, and they all ship anyway. It fits the work: migrations, legacy rescues, agents put to work where nothing was planned for them. Absurd and cheerful, drawn like the rest of the system: ink doodles in margins, dividers, empty states and diagram props, at most two washes, never a full-color illustration competing with the copy. One scene per page.

The cast, each with a fixed role so it means the same thing on every page:

- Crystal Tux, the penguin with the antenna: the host. Hero, 404, footer.
- The penguin colony: the RB Compound agents, one prop each. A clipboard for storyman, a T-square for designman, an APPROVED stamp for the validation, a whistle for boss, a lantern for docman, a broom for doneman, a magnifying glass for fixman.
- The polar bear tourist: the client. Arrived from the wrong hemisphere with a suitcase full of legacy, map upside down, a cardboard sign reading `wrong hemisphere`. In "what I take on" and at the mailbox of the closing call to action.
- The green oak on the ice: the open source that has grown since 2013, Masala Parser. A notice board nailed to the trunk for the articles.
- The igloo under construction: the "now building" block. Each ice block is a dated latest move; the crane of the logo stands next to it.
- The research station, antenna and rooftop deck: Rooftop. The one on the roof with binoculars looks at the graph of batches, ice floes joined by planks.
- The walrus with a moustache and a mug: the veteran, twenty years in. He drinks robusta, the coffee the brand is named after. Resume page.
- The husky team in harness: the agent harness, literally. A penguin musher, the design doc on the sled. Multi-agent orchestration diagrams.
- The orca: the production incident. A fin passing under a divider, rarely.
- The skua or the albatross: the mail. Contact, "I answer every message myself".
- The krill swarm: the tests, 450 identical little ones.
- The snowman: the brainstorm, a throwaway document, it melts.
- The sleeping seal: the reviewer who did not read.

Props and set:

- Displaced objects, the heart of the absurd: a red phone box, a bus stop where penguins wait for approval, a mailbox, a street lamp, a park bench, a vending machine, a traffic light.
- Expedition: flags planted at DONE milestones, a logbook, a spyglass, a compass, knotted ropes, a tent, a sled, skis, snowshoes, a pickaxe for legacy, a shovel for chores.
- Station: radio, kettle, thermometer, lantern, antenna, solar panel.
- Sky: the aurora australis as a purple wash, `--brand-primary-soft`; the low sun as a gold dot, `--brand-secondary`.
- The iceberg: the sticker card. What shows above, what holds it below: the architecture under the feature.

Dividers and panel backgrounds, designed as reusable primitives:

- A wavy horizon line with a distant iceberg and a tiny penguin.
- An ice crack zigzagging across the page, a penguin leaning over the edge.
- Footprints: penguin prints from one side, bear prints from the other, crossing in the middle.
- A fishing hole with a line dropping from the top of a section: the parser pulling tokens out of text.
- A string of pennants between two poles, for the cheerful side.
- A band of dark water at the bottom of a section, the edge of the floe.
- Backgrounds: sparse snow instead of the dot grid, logbook ruled lines for "now building" and the prose, igloo blocks as a faint pattern, a snowdrift on the top edge of a card.

Inspiration keywords: Antarctic expedition field journal, research station sketch, ink doodle penguin colony, iceberg cross-section, aurora australis line art, bullet journal ice theme. For the tone, not to copy: Sempé for tiny characters in a vast white landscape, Saul Steinberg for the absurd line, the Shadoks for cheerful absurdity, Julia Evans' Wizard Zines for the sketchnote.

## Deliverables

- One frame per page at 1280 and one at 360, pages 1 to 7.
- A cast sheet: each character once, in the ink style, with its role and its prop.
- A dividers sheet: each divider and panel background once, at 1280 and 360.
- A components inventory: for each section, existing or new, its PascalCase name, its parts, its text slots, and how it reflows at 640, 768, 1024 and 1280.
- The copy you wrote, listed per page in the lowercase voice, so I can paste it into the site's page copy.
- The list of every fact you were missing and left as a slot.
