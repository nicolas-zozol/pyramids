---
name: geo-article
description: Plan, write or audit an article of a pyramids site so that answer engines (ChatGPT, Perplexity, Gemini, Claude) cite it — Generative Engine Optimization. Three modes — `questions` (build the register of buyer questions and the format each one calls for), `write <question>` (draft an article into the site's corpus, unpublished), `audit <article>` (read-only citability report). Use whenever a pyramids article is created, rewritten or reviewed for search or AI visibility, or when "GEO", "cité par ChatGPT", "AI citations" or "LLM visibility" is said.
---

# geo-article — articles that answer engines cite

An answer engine reads many pages per question and cites a handful. It cites the page whose passage answers the question directly, in the format it already favours for that kind of question, on a site it already trusts. This skill works on the first two; the third is site-level and off-site work.

Source: Tibo's newsletter of 2026-10-22, "How to get ChatGPT to cite your website" — 96 questions asked to four engines, 2,671 cited sources, 74 % of them blog content. The figures below come from it.

## Scope

In scope: one article, from the question it answers to its file in the corpus.

Out of scope, flagged in the report but never done here:

- Sitemap, canonical URL, structured data, `robots.txt`, title and description in the head: site-level, owned by `features/pyramid-v2-epic/__done/seo-excellence/seo-excellence.story.md`.
- Opening to indexing: `features/pyramid-v2-epic/__done/go-live/go-live.story.md`. An article opens on the Netlify production build only; every other deploy is `noindex`.
- IndexNow submission, mentions on other sites, domain authority: off-site work.
- Landing page wording: the site configuration's page copy (BR-PYRAMID-8). ChatGPT checks a brand's own product and pricing pages after building its shortlist: a landing page that answers plainly matters, but it is not an article.

## Rules of the site

Read before writing, they override anything below:

- `business-rules.md` — BR-PYRAMID-9 (one category at most), BR-PYRAMID-10 (published only when declared), BR-ROBUSTA-1 (robusta.build serves several locales, English by default).
- `ubiquitous-language.md` — Article, Category, Tag, Slug, Locale, Translation identifier.
- The reading contract: `apps/robusta-build/src/content/corpus-reader/contract.ts`.

## Mode `questions`

Builds or refreshes `documentation/geo-questions.md`, the register of the questions a buyer of the site asks an answer engine.

1. Read the site configuration (`apps/<site>/src/seopyramids.config.ts`: mission, page copy, contact) and the list of published articles. Derive who buys and what they buy.
2. Write 5 to 15 real questions, phrased as a buyer types them to a chatbot, in the site's locale. Cover the five kinds:
   - Best: « meilleur freelance Solidity », « meilleure librairie pour signer une transaction Ethereum »
   - Versus: « ethers.js ou viem », « Ledger contre MetaMask »
   - Alternatives: « alternative à MetaMask », « alternative à Gmail »
   - How to: « comment auditer un smart contract », « comment quitter Gmail »
   - What is: « qu'est-ce que le yield farming »
3. For each question, give its kind, the format it calls for (table below), the existing article that answers it or « aucun », and a verdict: covered, to rewrite (`audit` it), to write.
4. Questions where the site has no legitimate expertise are dropped, not kept for volume.

Register entry format, one bullet per question:

```md
- « Test-first or code-first with AI coding agents? » — versus, comparatif — aucun — à écrire
- « Quelles alternatives à Gmail pour une entreprise ? » — alternatives, listicle — privacy/quitter-gmail.md — à auditer
```

The register ends with a `## Contrôle mensuel` section: the date of each check, and for each question which engines cite the site and which pages they cite instead. This skill cannot query the engines; Nicolas runs the questions (by hand or through an AI citation analyzer) and the section records what he reports. A question still uncited after two checks gets its article audited again. Expect months, not weeks: the newsletter's median site doubled its Google clicks after about seven months.

## Format by question kind

Write the format the engines already cite for that kind of question. Don't try to win with a different one.

- « Meilleur X » → listicle (73 % of cited sources)
- « Alternatives à X » → listicle (71 %)
- « X ou Y », « X contre Y » → comparison (75 %)
- « Comment faire X » → guide (55 %)
- « Qu'est-ce que X » → guide with a definition first (63 %)

What each format holds:

- Listicle: a numbered list of entries; each entry is a heading with the name, one sentence saying who it suits, then the facts (price, licence, limits, version tested). The site's own offer may appear as one entry among others, stated as plainly as the rest; a listicle that only praises the author is not cited.
- Comparison: a verdict in the first paragraph (« Choisissez X si…, Y si… »), a comparison table on the criteria a buyer weighs, one section per criterion, then a « Lequel choisir » section by use case.
- Guide: the result in the first paragraph, prerequisites, numbered steps each with its command or code, the errors a reader hits and their fix.
- Definition: « X est … » in the first sentence, then how it works, an example, its limits, and what it is not.

## Mode `write <question>`

Drafts one article for a question of the register (or a question given inline, added to the register first).

1. Check the register: an existing article answering the same question is rewritten (`audit` first), never duplicated.
2. Pick the format from the question kind.
3. Gather the facts: the site's own articles, the code of the repository when the subject is the author's work, primary sources (official docs, changelogs, specs) for everything else. A figure, a price or a version without a source is left out, never estimated.
4. Write the file under the citability rules below.
5. Report: path, question, format, the facts left out for lack of a source, and the open points for Nicolas.

File: `apps/<site>/content/articles/<category>/<slug>.md`.

```md
---
title: "Ethers.js ou viem : lequel choisir en 2026"
slug: ethers-ou-viem
tags: ["ethereum", "typescript"]
locale: "fr"
date: "2026-10-25"
image: ./images/ethers-viem.png
category: blockchain
published: false
author: Nicolas Zozol
---

Pour un nouveau projet TypeScript, viem … ; ethers.js reste le bon choix si …

---

## Le verdict
…
```

- `slug` is always declared: without it the slug is derived from the title, and a title that carries its year would change the URL at every update. Short, in the site's locale, the words of the question, never changed once published.
- `published: false`: Nicolas publishes (BR-PYRAMID-10).
- One category, one segment, an existing one when it fits (BR-PYRAMID-9).
- `translationId` only when the article is a translation of another.
- The excerpt is the text above the first `---`. It becomes the page's description: it is the answer to the question, self-contained, 1 to 2 sentences, under 160 characters when possible.
- `image` is optional for a draft; when no cover exists, leave the field out and say so in the report rather than reusing an unrelated image. A published article needs one: the blog roll shows it, and `migrated-corpus.spec.ts` fails without it.
- Publishing an article moves the counts and slug list of `apps/robusta-build/src/content/migrated-corpus.spec.ts`: say so in the report.

## Citability rules

An engine lifts a passage, not a page. Every rule below makes a passage liftable on its own.

- Answer first. The excerpt answers the title's question; each section's first sentence answers its heading.
- Headings are the questions. `##` and `###` headings phrase the sub-questions a buyer asks (« Combien coûte un audit Solidity ? »), not labels (« Tarifs »). The body never uses `#`: the title is the page's only first-level heading.
- One section, one answer. A section is understandable without the ones before it: name the subject again instead of « il » or « cet outil ».
- Facts over adjectives. Numbers, versions, dates, prices, commands, named tools. « rapide » says nothing; « 2,3 s contre 7,1 s sur 10 000 appels » is citable.
- Sources inline. Link the primary source next to the fact it backs.
- Experience shown. What the author did, built or measured (« sur le projet X, nous… ») is what an engine cannot find elsewhere, and what makes the page worth citing over a vendor's doc.
- Dated. Write the year in the title when the answer changes with time, and the version of every tool compared.
- Tables for comparisons, lists for steps and entries. A table cell holds a fact, not a sentence.
- A `## Questions fréquentes` section closes the article: 3 to 5 neighbouring questions from the register or from the « Autres questions » a search shows, each answered in 2 to 4 sentences.
- Internal links to the site's other articles where a reader would follow them, with the destination's words as the anchor.
- Plain French, no hype. Apply the `deslop` skill in write mode.

## Mode `audit <article>`

Read-only. Reads the article and reports, in French:

- The question it answers, its kind, and whether its format matches the table above.
- Each citability rule broken, with the offending passage and a rewrite.
- Frontmatter: missing excerpt, more than one category, a body heading at the first level, a date the content contradicts.
- The site-level blockers seen on the way (noindex, no sitemap, no structured data), named once with their owner story, not counted against the article.
- A verdict: citable, to rewrite (with the 3 changes that matter most), or to drop from the register.

## Report

End every mode with the files written (full path) and the open points that need Nicolas: a missing fact, a cover to produce, an article to publish, a question to check by hand in the engines.
