# Marketing UI Kit — Robusta Build

A clickable, mostly-static recreation of the Robusta Build marketing site.

## What's here

`index.html` — the full home page.
Components, in render order from top of the page:

- `SiteHeader.jsx` — logo + nav + CTA
- `Hero.jsx` — headline, primary CTAs, mascot
- `ServicesGrid.jsx` — three service offerings as wobble-border cards
- `FlowDiagram.jsx` — five-step engagement flow on dotted-grid background
- `PrinciplesList.jsx` — values, written like a sketchnote bullet list
- `NotesPreview.jsx` — engineering blog preview
- `CTA.jsx` — closing pitch + email capture
- `SiteFooter.jsx` — link columns + colophon

## Visual rules baked in

- everything lowercase except proper nouns (Postgres, etc.)
- buttons are `.sk-btn` with sticker-offset shadows; never use real `box-shadow`
- cards rotate ±0.4° to fight ruler-perfect alignment
- color appears as **highlighter washes** and small accents, never fills
- backgrounds: paper grain by default, dotted bullet-journal for the flow section, secondary panel (`#f3f1ea`) for the notes section

## Caveats

- No real source for this site existed when the kit was built — content is plausible but invented. Replace copy, post titles, and step labels when real ones exist.
- Email field doesn't submit — it's a static demo.
