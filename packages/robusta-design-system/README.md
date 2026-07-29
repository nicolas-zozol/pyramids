# Robusta Build — Design System

> independent senior engineering for high-stakes software projects, where architecture, reliability, and maintainability matter.

This design system gives Robusta Build a distinctive, **hand-drawn sketchnote** voice — like a senior engineer explaining a hard problem on a napkin or a sheet of printer paper. White paper. Imperfect black ink. Lowercase handwriting. Small touches of color where it earns the emphasis.

---

## Sources

This system was built **from the brief alone** — no codebase, Figma file, or existing decks were attached. As a result, all visual assets (logo, mascot, components) are originals interpreted from the written direction. If a real codebase or Figma exists, re-attach it and we'll re-derive the system to match.

**Brand inputs used:**
- written direction document ("Robusta Build — Design System Direction")
- aesthetic references: hand-drawn sketchnotes, napkin diagrams, [Wizard Zines](https://wizardzines.com) by Julia Evans
- mascot brief: "Crystal Tux" — a cross-eyed Linux penguin

---

## Index — what's in this folder

```
README.md                  — you are here
SKILL.md                   — agent skill manifest (Claude Code compatible)
colors_and_type.css        — css vars: color, type scale, semantic styles, paper textures
sketch.css                 — hand-drawn primitives: rough boxes, arrows, buttons, callouts

assets/
  crystal-tux.svg          — full body, standing
  crystal-tux-head.svg     — head only, for inline annotations
  crystal-tux-waving.svg   — waving with "hi there!" speech bubble
  crystal-tux-thinking.svg — thinking pose with thought cloud

ui_kits/
  marketing/
    BrandLogo.jsx          — logo component (💪 + 🏗 robusta\build), inline so emoji glyphs render
    index.html             — full clickable home page
    *.jsx                  — modular components
```

---

## Content fundamentals

The voice is the design. Get the writing right and the visuals follow.

### tone

- **first-person plural, casual.** "we ship," "we won't pretend," not "the team will deliver."
- **direct second-person.** "you have a system that needs to work in five years." not "users may find that…"
- **no hedging.** confident but not boastful. we say what we'll do and what we won't.
- **technically precise.** real terms (idempotency, backpressure, p99 latency) used correctly. assume the reader has read a postmortem before.

### casing

- **lowercase as default**, including headlines and most UI labels.
- **proper nouns keep their capitalization** — "Postgres," "Kafka," "Robusta Build." never "robusta build" mid-sentence.
- **acronyms stay caps** — SLO, AWS, gRPC.
- avoid Title Case In Buttons. it's `book a call`, not `Book A Call`.

### punctuation

- em dashes are fine — used as a thinking pause, like in handwritten notes.
- ellipses sparingly… they read tentative. we are not tentative.
- arrows in copy are encouraged: `request → queue → worker → db`.
- code voice in body is fine: `if it fails, retry with jitter.`

### emoji

- **no emoji in product copy.** they read consumer-friendly; we read engineering-serious.
- exception: terminal-style ascii (`->`, `~`, `[ok]`, `// todo`) is welcome — it's the same family as the rest of the system.
- one more exception, by design: the **logo itself** uses two emoji glyphs (💪 + 🏗) as its mark. it's a deliberate napkin-doodle gag, not decoration. don't repeat the pattern elsewhere.

### examples

> ✅ `we build software you can still maintain in five years.`
> ✅ `your stack has grown faster than your invariants. let's fix that.`
> ✅ `// note to self: this is the tricky part.`
> ❌ `🚀 Robusta Build is a Premier Engineering Solutions Provider!`
> ❌ `We empower teams to deliver excellence at scale.` *(generic SaaS)*
> ❌ `BOOK A CALL TODAY` *(shouty title case)*

---

## Visual foundations

### palette

A near-monochrome system with three accent hues used as **highlights, not fills**. Color appears on perhaps 5–10% of any composition.

| token | hex | role |
|---|---|---|
| `--paper`        | `#fafaf7` | primary background — warm off-white, like printer paper |
| `--paper-2`      | `#f3f1ea` | secondary panels |
| `--ink`          | `#1a1a1a` | every stroke, every body letter |
| `--ink-mute`     | `#6b6b66` | captions and side-notes |
| `--accent-blue`  | `#3b6ef0` | links, primary annotations |
| `--accent-green` | `#2e9c5e` | success, "yes", checkmarks |
| `--accent-pink`  | `#e94e8a` | accent, mascot beak, scribble underlines |

Soft variants (`--accent-blue-soft`, etc.) exist as **highlighter washes** — think of a light yellow marker swept under a word. Never as full backgrounds.

### typography

Hand-drawn means handwritten typography.

- **`--font-display`: Caveat** (Google Fonts) — flowing handwriting for h1/h2 and big quotes.
- **`--font-hand`: Kalam** — body copy. More legible, still handwritten.
- **`--font-annot`: Architects Daughter** — small annotations, captions, button labels.
- **`--font-mono`: JetBrains Mono** — code. The one piece of the system that should *not* look hand-drawn — code is precise, and we honor that.

> ⚠️ All four families ship via Google Fonts CDN. If you have brand-licensed alternatives (Shantell Sans, Caveat Brush, a custom hand), drop the `.woff2` files in `fonts/` and update `colors_and_type.css`.

Body type runs **larger than usual** (19px) because handwriting at small sizes is illegible. Don't push below 14px ever.

### spacing & layout

- a loose 4px-based scale (`--sp-1` through `--sp-9`) — but we **deliberately allow a few px of irregularity** between sibling elements when it sells the hand-drawn feel.
- **no perfect grids.** if a row of three things is laid out, allow ~6–10px of vertical jitter between them. CSS `transform: rotate(-0.6deg)` on a card is encouraged.
- generous whitespace. paper is allowed to breathe.

### backgrounds

- **default**: solid `--paper`.
- `.paper` adds a faint two-layer dot grain (~2% black) so it doesn't look like a sterile white screen.
- `.paper-grid` for diagrams: a 22px dotted bullet-journal grid.
- `.paper-ruled` for note-style content.
- **never** gradients. **never** glassmorphism. **never** photographic backgrounds.

### borders & "shadows"

- borders are **wobbly SVG paths**, not `border:`. See `.sk-box`, `.sk-callout`, `.sk-btn` in `sketch.css`.
- there are **no drop shadows** in this system. depth is conveyed by **offset stamps** — a solid black duplicate sitting 4px down-and-right behind a card. See `.sk-sticker` and the `::after` pattern on `.sk-btn`.
- corner radii are tiny (3–10px) because the wobbly stroke does the softening.

### animation

- **understated.** elements rarely bounce or zoom.
- preferred motion:
  - `transform: translate(2px, 2px)` on press (the sticker depresses into its shadow)
  - subtle `rotate` jitter on hover (–0.5° to +0.5°)
  - opacity fades 120–180ms `ease-out`
- **no parallax. no scroll-triggered choreography. no spring physics on UI.** an engineer's notebook doesn't bounce.

### hover & press states

- **hover**: shadow offset grows from 4px → 6px (the sticker "lifts"). optional 0.5° wobble.
- **press**: card depresses — `transform: translate(2px,2px)`, shadow inset to 0.
- **focus**: 2px dashed outline in `--accent-blue`, offset 4px. Visibly hand-drawn-feeling, never a clean rectangle.

### imagery

- no photography by default. if used, it should be **black-and-white, high-grain, half-tone** — dithered or screen-printed feel. never warm consumer photography.
- prefer hand-drawn diagrams over screenshots.
- the only "character" in the system is **Crystal Tux**, used sparingly.

### transparency & blur

- effectively **none**. paper is opaque. ink is opaque. no `backdrop-filter`, no glass.
- the one exception: highlighter washes (`--accent-*-soft`) which feel translucent because the color is light, not because of opacity.

---

## Iconography

This system **avoids icon fonts** — they look too geometric and clean. Icons should look hand-drawn, matching the rest of the system.

**Approach (in order of preference):**

1. **Inline hand-drawn SVGs** with `stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"` and slight path imperfections. The primitives in `sketch.css` (`.sk-arrow-right`, `.sk-check`, `.sk-circle`) are the seed of an icon set — extend it as needed.
2. **Lucide via CDN** as a fallback for utility icons (chevrons, x, search, etc.) **with `stroke-width="1.6"` and a `class` that applies a slight `transform: rotate(-1deg)`** to fight the cleanness. This is a substitution — flag it whenever it appears in a real surface.
3. **Unicode characters** are acceptable for terminal-style accents: `→ ← ↗ ✓ ✗ ~ //`.
4. **No emoji** in the product itself, with one exception: the brand logo uses 💪 + 🏗 as its mark (see `BrandLogo.jsx`). They break tone everywhere else.

**Crystal Tux** is the one exception — a recurring mascot, not a generic icon. Use sparingly: hero areas, empty states, footer, occasional inline annotation. Never decorative on every screen.

---

## Component vocabulary

The visual language is built from these motifs (all available as CSS classes in `sketch.css`):

- **rough boxes** — `.sk-box` — wobbly SVG-path rectangles for cards, panels, sections.
- **stickers** — `.sk-sticker` — boxes with a 4px solid offset behind, conveying weight without shadow.
- **callouts** — `.sk-callout` — speech-bubble framing for emphasized notes.
- **arrows** — `.sk-arrow-right` — hand-drawn arrows for flow diagrams and "go here next" UI.
- **scribbles** — `.sk-scribble` — pink under-squiggle for emphasized words.
- **separators** — `.sk-divider` — wavy section breaks.
- **highlighter washes** — `.highlight-blue/green/pink/yellow` on text spans.
- **circles** — `.sk-circle` — for diagram nodes, step indicators.
- **tags** — `.sk-tag` — small inline labels.
- **buttons** — `.sk-btn`, `.sk-btn--primary`, `.sk-btn--ghost`.
- **inputs** — `.sk-input` inside `.sk-input-wrap`.

---

## Don't

- ❌ glossy gradients, photo-realistic shading, 3D anything
- ❌ glassmorphism, frosted blur, neumorphism
- ❌ rounded-corners-with-colored-left-border cards
- ❌ generic SaaS hero templates ("hero on left, screenshot on right, gradient blob in corner")
- ❌ emoji in product copy
- ❌ Inter, Roboto, system-ui, SF Pro, or any clean geometric sans
- ❌ ruler-perfect alignment everywhere — the system *needs* a touch of irregularity
- ❌ an icon for every label

---

## Caveats

- **No source materials.** Built entirely from the written brief. Re-derive against real codebase/Figma when available.
- **Fonts are Google Fonts substitutions.** Caveat / Kalam / Architects Daughter / JetBrains Mono are all CDN-loaded. If brand fonts exist, swap them in.
- **One product surface only** (`ui_kits/marketing`). Robusta Build appears to be services-led — no app product was implied.
