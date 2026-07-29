# Architecture: imagine

**Last updated:** 2026-04-28

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/imagine` is the AI + browser-automation utility package. It bundles
two largely independent subsystems under one workspace: a thin **OpenAI**
wrapper (image generation, haiku demo) and a **Puppeteer-based**
"PuppetAI" runner that drives a real Chromium, performs DOM extraction
through pluggable transforms, and accumulates results in a shared
`ExecutionContext`. Both are CLI-style entry points (`vite-node`), not
library APIs — apps don't import this package, you run its scripts.

**⚠️ Token-cost rule:** never run anything in `src/script/` automatically.
Each invocation calls a paid OpenAI endpoint (DALL·E 3, gpt-4o-mini).
The repository's CLAUDE policy forbids agents from executing these scripts.

## Diagram

```
┌──────────────────────────────── @robusta/imagine ────────────────────────────────┐
│                                                                                  │
│   ┌──────────── AI subsystem ────────────┐  ┌──────── Puppets subsystem ──────┐  │
│   │                                      │  │                                 │  │
│   │  src/api/get-open-ai-key.ts          │  │  src/puppets/index.ts (CLI)     │  │
│   │     │                                │  │       │                         │  │
│   │     ▼                                │  │       ▼                         │  │
│   │  OpenAI client                       │  │  ActionFactory ─► SearchAction  │  │
│   │     │                                │  │                  OpenAction     │  │
│   │     ▼                                │  │                  SetAction      │  │
│   │  src/api/easy/create-image.ts        │  │       │                         │  │
│   │  (DALL·E 3, 256×256)                 │  │       ▼                         │  │
│   │                                      │  │  BrowserManager (puppeteer)     │  │
│   │  src/script/hello-ai.ts              │  │       │                         │  │
│   │  (gpt-4o-mini haiku)                 │  │       ▼                         │  │
│   │  src/script/run-script.ts (entry)    │  │  ExecutionContext (state bag)   │  │
│   │                                      │  │       │                         │  │
│   └──────────────────────────────────────┘  │       ▼                         │  │
│                                             │  PluginStore  ◄─ initBuiltIn    │  │
│                                             │  (text/currency/regex/         │  │
│                                             │   attr/slice plugins)          │  │
│                                             └─────────────────────────────────┘  │
│                                                                                  │
│   CLI entry points (yarn scripts):                                               │
│      yarn haiku    → vite-node src/script/run-script.ts                          │
│      yarn puppets  → vite-node src/puppets/index.ts                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    openai · puppeteer · dotenv · zod
```

## Key Components

### AI subsystem (`src/api`, `src/script`)

| Component                | File                                  | Responsibility                                        |
|--------------------------|---------------------------------------|-------------------------------------------------------|
| `getOpenAiKey` / `getOpenAi` | `src/api/get-open-ai-key.ts`      | Reads `OPENAI_API_KEY` (or `_PROD`), throws if absent; returns shared `OpenAI` client. |
| `createImage(prompt)`    | `src/api/easy/create-image.ts`        | `dall-e-3`, `256x256`, n=1. Returns the image URL.    |
| `generateHaiku()`        | `src/script/hello-ai.ts`              | `gpt-4o-mini` chat completion — demo / smoke test.    |
| `run-script.ts`          | `src/script/run-script.ts`            | CLI entry. Loads `.env` via `dotenv`, calls `generateHaiku`. **Do not invoke.** |

### Puppets subsystem (`src/puppets`, `src/puppets-plugin`, `src/execution-context`)

| Component               | File                                              | Responsibility                                                                |
|-------------------------|---------------------------------------------------|-------------------------------------------------------------------------------|
| CLI entry               | `src/puppets/index.ts`                            | `parseArgs` → `ActionFactory.create(action)` → execute. Supports `--keep-open`.|
| `BrowserManager`        | `src/puppets/browser/index.ts`                    | Wraps a Puppeteer `Browser`/`Page`. Sets a Chrome UA, 10 s default timeout.   |
| `ActionFactory`         | `src/puppets/actions/factory.ts`                  | Maps `'search' \| 'open'` to handler classes; carries per-action `defaultKeepOpen`. |
| `SearchAction`          | `src/puppets/actions/search.ts`                   | Google Search with cookie-consent flow, scrapes suggestions.                  |
| `OpenAction`            | `src/puppets/actions/open.ts`                     | Navigate to a URL.                                                            |
| `SetAction`             | `src/puppets/actions/SetAction.ts`                | Selects an element, runs a plugin transform, writes value into `context.data` via `setIn`. |
| `BaseAction`            | `src/puppets/actions/base.ts`                     | Shared base class for all actions.                                            |
| `ExecutionContext`      | `src/execution-context/execution-context.ts`      | Open-shape state bag: `data`, `meta.history` (`ActionLog[]`), `errors`, `warnings`, plus per-tool namespaces. |
| `PluginStore`           | `src/puppets-plugin/plugin-store.ts`              | `Map<name, PuppetsPlugin>` — `registerPlugin` / `getPlugin`.                  |
| `initBuiltInPlugins`    | `src/puppets-plugin/init-built-in-plugins.ts`     | Dynamically imports `text-content` and `currency` plugins and registers them. |
| Built-in plugins        | `text-content-plugin`, `currency-plugin`, `regex-plugin`, `attribute-plugin`, `slice-plugin` | Each implements `PuppetsPlugin<T>` — `transform(el, args?) → T \| null`. Args validated with Zod. |

## Data Flow — PuppetAI

```
yarn puppets search "café dakar"
        │
        ▼
parseArgs(argv)  ──► { action: 'search', params: ['café','dakar'], options }
        │
        ▼
ActionFactory.createAction('search', options)
        │                                           ┌─────────────────────────────┐
        ▼                                           │ ExecutionContext (shared)   │
new SearchAction(browserManager, opts, config)      │  ├ data: any                │
        │                                           │  └ meta:                    │
        ▼                                           │      ├ history: ActionLog[] │
browserManager.launch()                             │      ├ errors: string[]    │
        │                                           │      └ warnings: string[]  │
        ▼                                           └─────────────────────────────┘
SearchAction.execute(params, opts)                                   ▲
        │                                                            │
        ├─► page.goto(google), accept cookies, type, scrape          │
        ├─► (when SetAction is used)                                 │
        │       parseSelector("#price@currency[USD]")                │
        │       getPlugin('currency')                                │
        │       plugin.transform(el, ['USD'])                        │
        │       setIn(context.data, contextKey, value)  ─────────────┘
        │
        └─► return / keep browser open per --keep-open
```

### `SetAction` selector grammar

```
<css-selector> @ <pluginName> [ <arg1>, <arg2>, ... ]
   │              │             │
   │              │             └── optional, comma-separated, parsed into pluginArgs[]
   │              └────────────── PluginStore key (defaults to 'textContent')
   └───────────────────────────── any standard CSS selector
```

Examples (from `ActionLog` doc-comments):
- `.product-title` → uses default `textContent` plugin.
- `.price@currency` → currency plugin extracts a number.
- `.price@[data-currency]` → attribute plugin returns the attribute.

## Public API

There is **no library export surface**. `package.json` declares
`main: dist/index.js`, but no `src/index.ts` exists. This package is run via
yarn scripts (`yarn haiku`, `yarn puppets`) or imported directly from another
script, not consumed as a library.

## Interfaces

```
┌──────────────────────────────────────────────────────────────────┐
│ PuppetsPlugin<T>                                                 │
├──────────────────────────────────────────────────────────────────┤
│ name: string                                                     │
│ transform(el: ElementHandle<Element>, args?: string[])           │
│   → Promise<T | null>                                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ExecutionContext                                                 │
├──────────────────────────────────────────────────────────────────┤
│ data: any                                                        │
│ meta: {                                                          │
│   tool?: string                                                  │
│   history: ActionLog[]                                           │
│   errors: string[]                                               │
│   warnings: string[]                                             │
│   [k: string]: any                                               │
│ }                                                                │
│ [namespace: string]: any   // e.g. context.puppet                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Action / ActionHandler                                           │
├──────────────────────────────────────────────────────────────────┤
│ Action = 'search' | 'open'                                       │
│ ActionOptions = { keepOpen?: boolean }                           │
│ ActionConfig  = { defaultKeepOpen: boolean; description: string }│
│ ActionHandler.execute(params: string[], options: ActionOptions)  │
│   → Promise<void>                                                │
└──────────────────────────────────────────────────────────────────┘
```

## Dependencies

- **Depends on:**
  - `openai@^4.93.0`
  - `puppeteer@^21.7.0`
  - `dotenv@^16.4.7`
  - `zod` (peer-implicit — used by selector plugins; not declared in `package.json`)
- **Used by:** _no other workspace_. Standalone toolbox.
- **Build:** `tsc` → `dist/`. Not part of `yarn build:deps` (none of the apps consume it).

## Notes / Gotchas

- **🔥 Never run anything under `src/script/`** — `run-script.ts` invokes
  `gpt-4o-mini` and `create-image.ts` invokes DALL·E 3. Both bill the
  user's OpenAI account on every call. The root `.cursor/rules/monorepo.mdc`
  and `CLAUDE.md` enforce this.
- **No public library API.** `package.json` lists `main: dist/index.js` but
  there is no `src/index.ts`. Treat the workspace as CLI-only.
- **`zod` is used but not declared** in `package.json` (regex/attr/slice
  plugins import it). It resolves through hoisting from the workspace root
  but should arguably be added to dependencies.
- **`.js` extension rule applies here too:** local imports use `.js`
  (e.g. `./hello-ai.js`, `../utils/set-in.js`). A few files (`browser/index.ts`,
  `factory.ts`, `currency-plugin.ts`) miss the `.js` on local imports — flag,
  do not auto-rewrite (project policy).
- **`createImage` returns `response.data[0].url`** — DALL·E URLs expire after
  ~1 hour; download immediately if persistence is needed.
- **`BrowserManager.launch()` reads `browserConfig` from `puppets/config`**, which is
  not exported through the package's public surface — the configuration lives
  inline in the puppets module.
- **`ExecutionContext.data` is intentionally `any`** — the design favours a
  free-form key-path written via `setIn(context.data, "user.profile.name", value)`.
