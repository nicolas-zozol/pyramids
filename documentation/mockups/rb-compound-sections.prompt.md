# robusta.build — the three RB Compound sections, a prompt for Claude Design

## What I want from you

A better design for three consecutive sections of the robusta.build home page, right under the hero. They present RB Compound, my suite of agents for Claude Code, in three beats:

1. the agents: six agents, one job each, and an example run, command by command;
2. the open questions: the format every agent ends its document with, and why it makes a project better at each step;
3. boss: one agent that runs the six others in one command, so the same example takes two commands instead of seven.

The attached `rb-compound-sections.html` is the three sections as the site renders them today, with the real stylesheets inlined: `colors_and_type.css` (tokens) and `sketch.css` (primitives and section layouts). Start from it. Keep the hand-drawn sketchnote language: lowercase copy, ink on warm paper, wobbly borders, offset ink stamps, purple, gold and blue. Make it more striking and easier to read, not different.

For each section: one desktop frame at 1280 and one mobile frame at 360. Then propose two or three variants for the boss diagram, the part I care most about.

## The story the three sections must tell

A visitor who has never heard of RB Compound should leave with three ideas, in this order:

- each agent does one job and writes a file; the next agent starts from that file;
- between two steps, the agent asks instead of guessing, and a one-line answer, often just `lgtm`, moves the project forward;
- boss chains everything, so the work goes much faster: two commands instead of seven.

The contrast between the console of section 1 (seven lines) and the console of section 3 (two lines) is the punchline. Make it visible.

## Section 1 — the agents

- Title: "six agents, from the epic to the docs.", a one-paragraph intro, then the six agents as numbered steps joined by arrows: epicman, storyman, bsman, designman, tddman, docman, each with a micro-note of what it does.
- Under them, "for example, an epic that compares todo-list algorithms:", a console of seven commands, each with its note beside it.
- A small callout: license PolyForm Noncommercial 1.0.0, free for noncommercial use, and a link to the code on GitHub. Not "open source": the word must not appear.
- Keep the console exactly as it is: the night panel (`.sk-console`, `--night`) is the one dark surface of the system, kept for code. Nothing else goes dark.

## Section 2 — the open questions

- Title: "every step ends on questions." and an intro: an agent never guesses; when a document leaves a choice open, its agent writes an open question at the end of the file; you answer in a line; the next agent starts from your answer.
- Show the format as it is written in the files, field names in English in every language: the key and the question (`OQ-BENCH-2: how many items does the benchmark measure?`), `Proposition:` (the one answer the agent recommends), `Rationale:` (why), `Resolution:` (the answer).
- Two entries: one resolved with `lgtm`, one resolved in the reader's own words. Then the legend: lgtm, "looks good to me", means the proposition is taken as it is.
- Ideas to explore: show where the questions sit, between two steps of the flow of section 1; make `lgtm` feel like the fast path and a written answer like the steering wheel; show that answering is cheap (a line), not a meeting.

## Section 3 — boss

- Title: "one command, the whole pipeline." and an intro: boss runs the six agents in your place, story after story, answers the open questions their propositions settle, signs each answer, leaves you the ones that need you, stops where you tell it to, and logs every decision in one file.
- The diagram: boss surrounds the six agents, as the one who commands them. Today it is a purple frame around the same six steps, with a "boss" tab on its top edge. Each step's caption names the file it produces: the epic, the story, the questions, the design, the tests and the code, the docs.
- Then the console: "the same epic, with boss:", two commands only: `epicman create an epic…` and `boss atw todo-list-algorithms`.
- A callout: this version only comes with a paid, personalized accompaniment of your team.
- Variants I would like to see for the diagram: a frame or a bracket; boss as a conductor above the row, with lines down to each agent; boss as a loop that runs the row once per story; anything clearer you find.

## Hard constraints

- Every text is a slot that the site fills in English, French and Spanish. French runs about 20% longer. No text drawn into an image, no layout that breaks when a line wraps.
- Every page is prerendered: no JavaScript, no animation that needs a script. CSS animations are possible, but must stay discreet and respect `prefers-reduced-motion`.
- Only the tokens and primitives of the attached stylesheets. A new primitive is welcome if it is reusable, described in CSS, and built from the existing tokens.
- No dark mode, on purpose: the site stays cheerful. The only dark surface is the console.
- Readability first: body text at 4.5:1 or more, no pattern behind text (the dotted grid stays around text, never under it).
- From 360 to 1536 px wide. The six steps sit on one row from 1024 px; below that they wrap, and an arrow must never point at nothing.

## Deliverables

- The three sections, desktop 1280 and mobile 360, as HTML using the attached stylesheets.
- Two or three variants of the boss diagram.
- For each new class or token: its name, what it is for, its CSS.

We will iterate: say what you are unsure about and what you would test.
