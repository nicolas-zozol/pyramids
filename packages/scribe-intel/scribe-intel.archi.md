# Architecture: scribe-intel

**Last updated:** 2026-04-28

## Parent

- [root](../../root.archi.md)

## Children

_None._

## Overview

`@robusta/scribe-intel` is the home-grown observability + product-analytics
SDK. Two largely separate subsystems live in the same package:

1. **Telemetry** — a thin wrapper around OpenTelemetry exposing a
   `Telemetry` class (logs + spans + helpers) and a structured `Logger`
   that emits one-line JSON to stdout/stderr. This is the part the apps
   actually use today.
2. **Intel** — a product-analytics framework around the concept of an
   **Intent** (a named, hierarchical, lifecycle-tracked user action).
   Two concrete implementations exist side-by-side, both stubs that
   `console.log` instead of sending: `GarboIntelClient` and `HoriIntelClient`.
   Code names borrow WW2 (Garbo) and Pharaonic-era (Hori) **spies** — the
   "scribe-intel" naming theme.

The package is **published only partially**: `src/index.ts` exports
`Telemetry`, `Tracer`, `setupTelemetry`, `Logger`, `IntelLog`,
`intelLogSchema`, `IntelMetrics`. The **entire intel/intent subsystem is
private** to the workspace today (consumed only by the in-package tests
and presumably the demo app `apps/intel-demo`).

## Diagram

```
┌──────────────────────────── @robusta/scribe-intel ─────────────────────────────┐
│                                                                                │
│   ┌──────── Telemetry subsystem (PUBLIC) ────────┐                              │
│   │                                              │                              │
│   │  src/telemetry/setup.ts   setupTelemetry()   │                              │
│   │  src/telemetry/index.ts   Telemetry class    │                              │
│   │       │                       │              │                              │
│   │       ▼                       ▼              │                              │
│   │   Tracer (OTel API)     Logger (JSON stdout) │                              │
│   │       │                       │              │                              │
│   │       └─── @opentelemetry/api ┘              │                              │
│   │                                              │                              │
│   └──────────────────────────────────────────────┘                              │
│                                                                                 │
│   ┌──────── Intel subsystem (mostly INTERNAL) ──────────────────────────────┐   │
│   │                                                                         │   │
│   │   src/intel/intent.ts                                                   │   │
│   │     IntelInterface, IntentInterface, EmptyIntent                        │   │
│   │     PageIntent, IntentSender, mainIntelInstance singleton               │   │
│   │            │                                                            │   │
│   │            │                                                            │   │
│   │  ┌─────────┴────────┐                                                   │   │
│   │  ▼                  ▼                                                   │   │
│   │ Garbo impl         Hori impl  ◄──── newer, split per concern            │   │
│   │ (intel-impl/       (intel-impl/hori/                                    │   │
│   │  garbo-intel.ts)    intel-client.hori.ts                                │   │
│   │                     intent.hori.ts                                      │   │
│   │                     identifier.hori.ts (Identifier)                     │   │
│   │                     locator.hori.ts    (Locator via data-page-name)     │   │
│   │                     visitor.hori.ts    (Visitor — empty stub))          │   │
│   │            │                  │                                         │   │
│   │            └────► IntentSender.send(payload)                            │   │
│   │                       │                                                 │   │
│   │                       ▼                                                 │   │
│   │                 fetch(collectorUrl)  → services/scribe-intel-collector  │   │
│   │                                                                         │   │
│   │   src/intel/intent-tracker.ts  (parent/child node tree, 30 s cleanup)   │   │
│   │   src/intel/intent-decorator.ts  @intent(name) / withIntent(name, fn)   │   │
│   │   src/intel/identity-manager.ts  (legacy — pre-Hori IdentityManager)    │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   ┌──────── Cross-cutting ────────────────────────────────────────────────┐     │
│   │  src/visitor/visitor.ts          Visitor / Identifier / Locator IFs   │     │
│   │  src/metrics/intel-metrics.ts    IntelMetrics (Zod schema)            │     │
│   │  src/logger/intel-logger.ts      Alt IntelLogger interface (parallel) │     │
│   │  src/utils/obfuscator.ts         XOR + base64 + hex obfuscation       │     │
│   │  src/utils/localstorage/*        Browser/Node localStorage shim       │     │
│   └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### Telemetry (public)

| Component         | File                              | Responsibility                                                                |
|-------------------|-----------------------------------|-------------------------------------------------------------------------------|
| `Telemetry`       | `src/telemetry/index.ts`          | High-level façade. Per-instance: `log/warn/error/debug` + span helpers. Static: `factory(type, name)`, `withSpan`, `setAttribute`, `recordError`. |
| `Logger`          | `src/telemetry/logger.ts`         | Static class — emits one-line JSON via `console.{error/warn/debug}`. `info` is currently a no-op (commented). |
| `Tracer`          | `src/telemetry/tracer.ts`         | Wraps `@opentelemetry/api` — `startSpan/endSpan/addEvent/setAttribute/recordError/withSpan`. `TRACER_NAME = 'robusta-telemetry-app'`. |
| `setupTelemetry`  | `src/telemetry/setup.ts`          | **Placeholder** — early-return today. `setupMockTelemetry` injects a window-level OTel mock in dev. |
| `intelLogSchema`  | `src/telemetry/logger.ts`         | Zod schema — what a structured log looks like (`timestamp`, `timestampNS`, `receivedAtNS`, level, message, component, labels, data). |
| `IntelMetrics`    | `src/metrics/intel-metrics.ts`    | Zod schema — counter/gauge (name, value?, labels?, timestamps).               |

### Intel — types & singletons (private)

| Component                              | File                                | Responsibility                                                                |
|----------------------------------------|-------------------------------------|-------------------------------------------------------------------------------|
| `IntelInterface`                       | `src/intel/intent.ts`               | Top-level analytics façade: `identify`, `page`, `instantIntent`, `log/error/warning`, `createIntent`. |
| `IntentInterface`                      | `src/intel/intent.ts`               | Lifecycle of one tracked action: `start`/`continue`/`end`, plus `instant`/`cancel`/`fail`, plus `sub(name)` for hierarchy. |
| `EmptyIntent`                          | `src/intel/intent.ts`               | No-op base class implementing every method. Concrete intents extend this.    |
| `IntentSender`                         | `src/intel/intent.ts`               | `{ send(payload): void }` — the transport seam.                              |
| `getIntelInstance` / `setMainIntelInstance` | `src/intel/intent.ts`          | Module-level singleton accessor for the active `IntelInterface` (warns on overwrite). |
| `intentTracker`                        | `src/intel/intent-tracker.ts`       | In-memory tree of `IntentNode`s. Tracks status (`active`/`completed`/`failed`/`cancelled`), cascades `fail`/`cancel` to children, GCs completed nodes after 30 s. |

### Intel — implementations (private, parallel)

The two implementations are functionally equivalent (both `console.log`
TODOs); they exist as parallel evolutions of the same idea.

#### Garbo (older, single-file)

| File                                     | What it has                                                                |
|------------------------------------------|----------------------------------------------------------------------------|
| `src/intel/intel-impl/garbo-intel.ts`    | `GarboIntent` (`extends EmptyIntent`), `GarboIntelClient`, `createIntelInstance(collectorUrl)` factory. The factory builds a fetch-backed `IntentSender`. |

#### Hori (newer, split per concern)

| File                                              | What it has                                                       |
|---------------------------------------------------|-------------------------------------------------------------------|
| `intel-impl/hori/intel-client.hori.ts`            | `HoriIntelClient`, `createIntelInstance(collectorUrl)` (same shape as Garbo). |
| `intel-impl/hori/intent.hori.ts`                  | `HoriIntent` lifecycle methods.                                   |
| `intel-impl/hori/identifier.hori.ts`              | `HoriIdentifier` — uuid + obfuscated user-id in localStorage.     |
| `intel-impl/hori/locator.hori.ts`                 | `LocatorHori` — reads/writes `data-page-name` on a target DOM element. |
| `intel-impl/hori/visitor.hori.ts`                 | `VisitorHori` — currently empty (`implements Visitor {}` only). |

### Decorators

| Component                | File                              | Responsibility                                                                |
|--------------------------|-----------------------------------|-------------------------------------------------------------------------------|
| `intent(name)`           | `src/intel/intent-decorator.ts`   | TypeScript method decorator. Wraps the method: `start('decorator-start')` → run → `end` or `fail` (with the error). Always returns a `Promise`, even for sync methods. |
| `withIntent(name, fn)`   | `src/intel/intent-decorator.ts`   | Higher-order function variant of `@intent` for plain functions.               |

### Visitor / Identifier / Locator (interfaces)

| Component       | File                                  | Responsibility                                                                |
|-----------------|---------------------------------------|-------------------------------------------------------------------------------|
| `Visitor`       | `src/visitor/visitor.ts`              | `extends Identifier, Locator`.                                                |
| `Identifier`    | `src/visitor/visitor.ts`              | `identify(key, user, data?)`, `getUserId()`.                                  |
| `Locator`       | `src/visitor/visitor.ts`              | `visit(pageName)`, `getCurrentPage(): { page, url }`. Browser-only.           |

### Utilities

| Component                  | File                                              | Notes                                                          |
|----------------------------|---------------------------------------------------|----------------------------------------------------------------|
| `obfuscateData`/`deobfuscateData` | `src/utils/obfuscator.ts`                  | Base64 → XOR with `PYRAMIDS_OBFUSCATION_KEY` (default `DefaultObfuscationKey123`) → hex. Not crypto; just makes the user-id less greppable. |
| `getSafeLocalStorage`      | `src/utils/localstorage/safe-local-storage.ts`    | Returns `window.localStorage` in browser, otherwise a `NodeLocalStorage` shim. |
| `encodeBase64`/`decodeBase64` | `src/utils/base-64.ts`                         | Cross-runtime base64.                                          |
| `IdentityManager`          | `src/intel/identity-manager.ts`                   | Older identity handler — duplicated by `HoriIdentifier`.       |

## Data Flow

### Telemetry call

```
const t = Telemetry.factory('Component', 'LoginForm');
t.log('user clicked submit', { email });
        │
        ▼
Logger.log(message, 'Component', { email })
  ─► (info is a no-op today)

t.error('submit failed', err);
        │
        ▼
Logger.error → console.error(JSON.stringify({ts, level, message, component, error, stack}))
```

### Intent lifecycle

```
const intel = createIntelInstance('https://collector.example.com/intel');
// → setMainIntelInstance(intel)  — module-level singleton

const checkout = intel.createIntent('checkout');     // GarboIntent or HoriIntent
checkout.start('clicked', { cartTotal: 49 });        // → sender.send({...})  (TODO today: console.log)
const payment = checkout.sub('payment');             // hierarchical: 'checkout.payment'
payment.continue('3ds-challenge');
…
checkout.end('paid', { method: 'card' });

@intent('saveProfile')
class ProfileApi { update(form) { … } }              // start → run → end | fail
```

`intentTracker` tracks the tree separately (parent/child IDs, lifecycle
state) — used for cascade failure semantics: failing a parent cancels all
active children.

### Identity flow (Hori)

```
HoriIdentifier  ──► getUserId()
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
       localStorage hit?       no → uuidv4()
       deobfuscate(value)           obfuscate(value), persist, return
```

## Public API (`src/index.ts`)

```
export { Telemetry, Tracer } from './telemetry/index.js';
export { setupTelemetry }    from './telemetry/setup.js';
export { Logger }            from './telemetry/logger.js';
export { IntelLog,
         intelLogSchema }    from './telemetry/logger.js';
export { IntelMetrics }      from './metrics/intel-metrics.js';
```

Everything in `src/intel/`, `src/visitor/`, `src/utils/` is **internal** — not
re-exported from the package barrel. The `apps/intel-demo` workspace likely
imports them via deep paths.

## Interfaces (key)

```
┌──────────────────────────────────────────────────────────────────┐
│ IntelInterface                                                   │
├──────────────────────────────────────────────────────────────────┤
│ identify(key, user, data?)                                       │
│ page(name, data?)                                                │
│ instantIntent(name, value?, data?)                               │
│ log/error/warning(name, component, data?)                        │
│ createIntent(name) → IntentInterface                             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ IntentInterface                                                  │
├──────────────────────────────────────────────────────────────────┤
│ getName()                                                        │
│ start(valueOrComment?, data?)                                    │
│ continue(valueOrComment?, data?)                                 │
│ end(valueOrComment?, data?)                                      │
│ instant(valueOrComment?, data?)                                  │
│ cancel(valueOrComment?, data?)                                   │
│ fail(valueOrComment?, data?)                                     │
│ sub(name): this   // hierarchical name 'parent.child'            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ Visitor extends Identifier, Locator                              │
├──────────────────────────────────────────────────────────────────┤
│ identify(key, user, data?)                                       │
│ getUserId(): string                                              │
│ visit(pageName): void                                            │
│ getCurrentPage(): { page: string|null, url: string|undefined }   │
└──────────────────────────────────────────────────────────────────┘
```

## Tests

Vitest lives next to source:

- `src/intel/intent.spec.ts`
- `src/intel/intel-impl/hori/identifier.hori.spec.ts`
- `src/intel/intel-impl/hori/locator.hori.spec.ts`
- `src/utils/obfuscator.spec.ts`

Run via `yarn workspace @robusta/scribe-intel test`. JSDOM is available for
DOM-touching specs (`Locator`).

## Dependencies

- **Depends on:**
  - `@opentelemetry/api`, `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/resources`, `@opentelemetry/semantic-conventions`
  - `uuid` — anonymous user IDs (Hori, IdentityManager)
  - `zod` — log/metric schemas
- **Used by:**
  - `services/scribe-intel-collector` (declares it as a dep — the collector consumes the same `intelLogSchema` / `IntelMetrics`)
  - `apps/intel-demo` (presumed — the demo of this SDK)
- **Build:** `tsc` → `dist/`. Not part of `yarn build:deps` (the public sites don't consume it yet).

## Notes / Gotchas

- **`setupTelemetry` is a stub.** It returns immediately; no SDK is wired
  up despite the OTel SDK packages being declared. Logging works
  (`Logger.error/warn/debug` go straight to `console`); spans go to whatever
  global tracer is configured by the host process. Don't expect end-to-end
  OTel until this is finished.
- **`Logger.log` is a no-op.** The `console.info` line is commented out —
  info-level logs **disappear** today. Only error/warn/debug surface.
- **Two parallel intel implementations.** `GarboIntelClient` and
  `HoriIntelClient` are functionally identical; both have TODOs in every
  method. The Hori impl is split into `identifier`/`locator`/`visitor`
  files and looks like the intended successor — but it isn't wired up.
  Pick one before adding behaviour.
- **Singleton dance.** `setMainIntelInstance` warns and overwrites; both
  `Garbo.createIntelInstance` and `Hori.createIntelInstance` call it.
  Calling both from the same process leaves only the second one active.
- **Obfuscation ≠ encryption.** `obfuscateData` is XOR-with-shared-key over
  base64 and hex-encoded. The key is `PYRAMIDS_OBFUSCATION_KEY` or the
  literal default `DefaultObfuscationKey123`. It only deters casual
  inspection of `localStorage`; do not store secrets in it.
- **Two `IdentityManager`s.** `src/intel/identity-manager.ts` and the newer
  `src/intel/intel-impl/hori/identifier.hori.ts` overlap — both write
  `saas_intel_user_id` in localStorage with the same obfuscation. Pick one;
  they will fight over the same key.
- **`@intent` always returns a Promise.** The decorator awaits sync results
  too — wrapping a sync method changes its return type. Callers must
  `await`, or assume `Promise<T>`.
- **`VisitorHori` is empty.** It declares `implements Visitor {}` with no
  methods, which only compiles because the interface members are met by
  *inheritance* not declared on the class — but no inheritance is set up.
  Likely a TODO placeholder.
- **`createIntelInstance` checks for a prior instance with `if
  (getIntelInstance())`** — but `getIntelInstance` *throws* when no
  instance exists. So the first call always crashes the truthiness check
  before `setMainIntelInstance` can run. Latent bug.
