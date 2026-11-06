# CLAUDE.md

Repères pour Claude Code dans ce dépôt.

## Dépôt

`@robusta/pyramids` est un monorepo yarn qui construit plusieurs sites de contenu SEO sur une base commune. Le travail nouveau va dans `apps/robusta-build`.

Documents de référence :

- `README.md` : vue d'ensemble et démarrage
- `root.archi.md` : architecture ; chaque app et module a son `<nom>.archi.md`
- `ubiquitous-language.md` : le vocabulaire à employer
- `business-rules.md` : les règles métier (BR-)
- `ROADMAP.md` et `features/` : ce qui reste à faire, et les documents Compound

## Apps et modules

- `apps/robusta-build` (`@robusta/robusta-build`) : robusta.build v2. TanStack Start sur Vite 8, chaque page prérendue au build, servie par Netlify ; seule la build de production ouvre ses pages indexables, tout le reste est `noindex`. Trois Locales : `en` par défaut, sans préfixe, `fr` et `es` sous le leur. Contenu, routing, commandes et déploiement : son `README.md` et `robusta-build.archi.md`.
- `apps/robusta` (`@robusta/build`) : robusta.build v1, Next.js sur Vercel. En retrait : n'y rien ajouter, ne pas le refactorer. Son README décrit le routing v1.
- `apps/dakar` (`@robusta/dakar`) : dakar.surf, Next.js sur Vercel. Hors du périmètre v2.
- `packages/robusta-design-system` (`@robusta/pyramids-design-system`) : le design system de robusta.build v2.
- `packages/helpers`, `themes`, `layouts`, `links`, `ctas` : la base des sites v1 et dakar, sur DaisyUI.

Chaque site déclare sa configuration dans `src/seopyramids.config.ts`.

## Vocabulaire des composants

- workspace : l'ensemble du code et de la documentation du projet
- app : du code qui s'exécute, dont aucune autre app ne dépend ; elle a son propre manifeste de build (`package.json`). Ici dans `./apps`
- module : il a son propre manifeste de build, et des apps ou d'autres modules en dépendent. Ici dans `./packages`
- package : un dossier à l'intérieur d'une app ou d'un module, autour d'une responsabilité. À ne pas confondre avec le dossier `./packages` de yarn

## Commandes

Depuis la racine. Node 22.18 ou plus (`.nvmrc`) et yarn 4.17.1, dont le binaire est commité (`yarnPath` dans `.yarnrc.yml`). Corepack est inutile, et un cache corepack dans le dépôt casse l'install : voir « Yarn on a build agent » dans `apps/robusta-build/README.md`.

```bash
yarn install
yarn build:deps        # helpers → themes → design-system → layouts → links → ctas
yarn build:robusta     # v2
yarn build:robusta-v1
yarn build:dakar
yarn dev:robusta       # ou dev:robusta-v1, dev:dakar
yarn lint              # eslint sur packages/**/src
yarn workspace @robusta/robusta-build run lint
yarn workspace @robusta/robusta-build run test           # vitest
yarn workspace @robusta/pyramids-design-system run test  # node --test
```

- Un site consomme le `dist/` des modules : quand on modifie un module pendant que le site tourne, garder son watcher (`yarn w:<module>`, ou `yarn dev:dev` pour v1).
- Aucun build ne lance eslint : le lint est une étape à part.
- Pas de `yarn test` à la racine. Vitest est aussi installé, sans script, dans `apps/robusta` et `packages/helpers` : `yarn workspace <nom> exec vitest run`.
- Prettier : `prettier.config.js`.

### Netlify CLI

netlify-cli n'est pas une dépendance du dépôt et `netlify` n'est pas dans le PATH : `npx netlify-cli <commande>`. npx le garde dans `~/.npm/_npx` ; le jeton de login est dans `~/Library/Preferences/netlify/config.json`. Un déploiement depuis le CLI est un draft deploy : jamais `--prod`.

## Conventions

### Imports TypeScript

Dans `apps/robusta-build` et `packages/robusta-design-system`, un import local, alias `@/` compris, nomme l'extension du fichier importé, `.ts` ou `.tsx`, et un import de dossier son `index.ts`. Un import en `.js`, sans extension ou à extension fausse fait échouer le build du site (`check:source`) ou les tests du design system.

Dans `apps/robusta`, `apps/dakar` et les autres modules de `packages/`, un import local finit par `.js`, même si la source est `.ts` ou `.tsx`. Un import sans `.js` rencontré en passant se signale, il ne se corrige pas en silence.

```ts
import dotenv from 'dotenv';                            // dépendance : pas d'extension
import { SiteLink } from '../components/SiteLink.tsx';  // v2 et design system : extension du fichier
import { getOpenAiKey } from '../api/get-key.js';       // v1, dakar, autres modules : .js
```

### React et TypeScript

- Composants fonctionnels, jamais `React.FC` : une `interface FooProps` et une fonction.
- Exports nommés ; le fichier porte le nom du composant en PascalCase ; dossiers en minuscules avec tirets.
- `apps/robusta-build` n'a aucun composant serveur : `check:source` fait échouer son build sur un `'use client'` ou `'use server'` sous `src`. Sur v1 et dakar, préférer RSC et ISR aux composants client.
- Pas de `any` : `unknown` ou un type précis. Une interface plutôt qu'un `type` pour un objet.
- Ne pas refactorer du code existant pour le style ou le lint : seulement ce que la tâche demande.

### Styles

- `apps/robusta-build` : couleurs, typographie, espacements et rayons viennent du design system et de nulle part ailleurs (BR-PYRAMID-6). `src/styles/globals.css` ne contient que des alias vers ses tokens. Composants shadcn sur Tailwind 4, sans DaisyUI ni `pyramids-layouts`, `pyramids-links` ou `pyramids-ctas`.
- v1 et dakar : tokens sémantiques DaisyUI (`primary`, `secondary`, `accent`, `neutral`, `base-100/200/300`), jamais de couleur Tailwind brute ; un `bg-*` va avec son `text-*-content`. Un composant non trivial expose `extraClasses?: string`, fusionné par `twCss(...)` de `pyramids-helpers`.

### Images

- `apps/robusta-build` : une couverture d'article est un `<img>` simple qui remplit sa boîte 16:9, sans optimiseur. Le corps d'un article est du markdown rendu par `remark-html`, qui assainit le HTML, injecté par `dangerouslySetInnerHTML` avec un CSS Module. Détail : `features/pyramid-v2-epic/__done/article-page/article-page.design.md`.
- v1 et dakar : `next/image` avec un `alt` descriptif. `sizes` seulement sur une image `fill` ou responsive. Une image importée porte déjà `width`, `height` et `blurDataURL` : ne pas les réécrire. Les sources restent en PNG ou JPEG, le WebP vient de l'optimiseur.
- Une image propre à un composant vit à côté de lui ; `public/` ne contient que de vrais assets publics.

## Documents Compound

Tous les fichiers Compound sont en français : stories, brainstorms, designs, epics, bulks, fix, `decisions-and-questions.md`, `ROADMAP.md`, `business-rules.md`, les définitions de `ubiquitous-language.md` et les `*.archi.md`.

Restent en anglais : le code et ses commentaires, les identifiants, les chemins, les clés R- et AC, les termes de `ubiquitous-language.md` et les citations. Un fichier Compound écrit en anglais avant le 2026-10-06 se traduit quand un agent le réécrit.

## Git

- Branche par défaut : `main`. Le travail se fait sur `epic/<epic>` ou `feat/<story>`.
- Messages : `type(scope): description` (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`).
- Ne jamais commiter ni pousser sans demande explicite.
