---
name: robusta-build-design
description: Use this skill to generate well-branded interfaces and assets for Robusta Build, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# Robusta Build Design Skill

Robusta Build is an independent senior engineering practice. Its identity is a **hand-drawn sketchnote** — like an engineer explaining a hard system on a napkin. Lowercase handwriting on warm off-white paper, ink strokes, three small accent colors (blue, green, pink), and a recurring penguin mascot called Crystal Tux.

## Where things live

- `README.md` — full system reference: tone, content rules, visual foundations, iconography, don'ts.
- `colors_and_type.css` — CSS vars for color, type scale, semantic styles, and paper textures.
- `sketch.css` — hand-drawn primitives: rough boxes, callouts, buttons, inputs, tags, arrows, dividers, scribbles.
- `assets/` — logo (3 variants), Crystal Tux mascot (4 poses).
- `preview/*.html` — design-system specimen cards.
- `ui_kits/marketing/` — full marketing site recreation, factored into JSX components.

## How to use

1. **Read `README.md` first.** The voice and don'ts matter more than any token.
2. **Always import both stylesheets** when building a surface:
   ```html
   <link rel="stylesheet" href="colors_and_type.css">
   <link rel="stylesheet" href="sketch.css">
   ```
3. **Compose with the `.sk-*` primitives** instead of inventing borders or shadows. The wobble is what the brand is.
4. **Use lowercase** for headlines and most UI labels. Proper nouns and acronyms keep their casing.
5. **Use color sparingly** — accents only, never as background fills. Highlighter washes (`.highlight-blue/green/pink/yellow`) for emphasis.
6. **Use Crystal Tux sparingly.** Hero, empty state, footer, occasional inline annotation. Not on every screen.

## When invoked

If the user invokes this skill without other guidance: ask what they want to build, ask 4–6 clarifying questions (audience, surface, tone level, needs Crystal Tux?, single page or flow?), then act as an expert designer. Output static HTML artifacts unless they explicitly want production code.

## Caveats

- All fonts are Google Fonts substitutions (Caveat, Kalam, Architects Daughter, JetBrains Mono). If brand-licensed alternatives exist, swap them in `colors_and_type.css`.
- This system was built from a written brief alone — no canonical codebase or Figma. Re-derive against real source if/when available.
