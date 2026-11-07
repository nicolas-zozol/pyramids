# Architecture: root (@robusta/pyramids)

**Last updated:** 2026-11-06
**Kind:** project

## Children

- [helpers](packages/helpers/helpers.archi.md)
- [themes](packages/themes/themes.archi.md)
- [layouts](packages/layouts/layouts.archi.md)
- [links](packages/links/links.archi.md)
- [ctas](packages/ctas/ctas.archi.md)
- [design-system](packages/robusta-design-system/design-system.archi.md)
- [robusta-build](apps/robusta-build/robusta-build.archi.md)
- `apps/dakar` n'a pas de `.archi.md`

## Overview

Pyramids est un monorepo yarn workspaces qui construit plusieurs sites de contenu SEO sur une base commune, au lieu de réécrire un site à chaque fois. La base commune est un ensemble de petits modules, et ce qu'un seul site utilise appartient à ce site (BR-PYRAMID-12). `apps/dakar` est un site Next.js App Router, en React Server Components et ISR, déployé sur Vercel ; `apps/robusta-build`, le site robusta v2, est TanStack Start sur Vite, prérendu au build et servi en fichiers par Netlify. Chaque site porte son contenu et un design system, que plusieurs sites peuvent partager (BR-PYRAMID-3). Deux sites sont en ligne, robusta.build, servi par `apps/robusta-build` et ouvert à l'indexation sur sa seule build de production, et dakar.surf.

Le site robusta est la v2 de `features/pyramid-v2-epic/pyramid-v2.epic.md` : reconstruit de zéro, il reprend le contenu markdown du site v1, un schéma d'URL SEO simplifié et un design system généré avec Claude Design. Le site v1 se relit au commit 6c57bc3, par `git show 6c57bc3:apps/robusta/<chemin>`, son schéma de routing dans `6c57bc3:apps/robusta/README.md`. Seul le site robusta est dans le périmètre de la v2.

## Apps, modules, packages

- apps/robusta-build (`@robusta/robusta-build`) — robusta.build version 2, servi sous `www.robusta.build` par le projet Netlify `robusta-build`, en trois Locales, `en` par défaut, `fr` et `es` (BR-ROBUSTA-1) : une page `en` ne porte aucun préfixe de Locale, une page `fr` ou `es` est sous le préfixe de sa Locale (BR-PYRAMID-14). TanStack Start sur Vite 8 : `vite build` prérend dans `dist/client` la landing page de chaque Locale, celle de `en` à `/`, une page 404 et chaque URL que le schéma v2 dérive du corpus, et Netlify publie ce dossier en fichiers, sans fonction, avec les règles v1 de `dist/client/_redirects`, que la build écrit depuis la correspondance v1, en 301, 410 ou 404 selon la ligne, puis trois règles de redirection en 301 de `netlify.toml` : `robusta-build.netlify.app` vers la même adresse sous `www.robusta.build`, `/en` vers `/` et `/en/*` vers le même chemin sans préfixe. Une page prérendue s'hydrate et navigue côté client, sur des fichiers de données que cinq server functions statiques écrivent au build. Tailwind 4 avec un pont de tokens, trois polices auto-hébergées depuis Fontsource. Chaque page déclare son head par le package `seo` du site : titre, description, canonical URL, hreflang et aperçu de partage, plus des données structurées sur les pages article, les rolls de Category et les landing pages ; la build écrit `sitemap.xml` et `robots.txt` et audite les heads. Une page indexable porte `index, follow` sur la build de production que Netlify exécute, `INDEXING_OPEN` vrai, et toute autre page, et chaque page de toute autre build, `noindex, nofollow`. `/`, `/fr` et `/es` sont les landing pages, des sections du design system nourries de la page copy de leur Locale dans la Site configuration ; les dix-sept articles, onze migrés de v1 et six traductions françaises, s'affichent en pages article ; l'accueil du blog et les rolls de Category de chaque Locale s'affichent en pages de listing. Un en-tête et un pied de page, du package `chrome` du site, encadrent chaque page ; l'en-tête mène à la même page dans chaque autre Locale, ou à la landing page de cette Locale, et le pied de page à l'accueil du blog et aux Categories de la Locale. Le schéma d'URL v2 et le lecteur de corpus sont des packages du site, `url-scheme` et `corpus-reader`, et sa seule dépendance workspace est le design system.
- apps/dakar (`@robusta/dakar`) — dakar.surf, le guide de surf. Next.js sur Vercel avec un segment `[locale]`, des pages de spots et des cartes MapLibre, sur `pyramids-layouts`, `pyramids-links` et `pyramids-ctas`. Hors du périmètre v2.
- packages/helpers — utilitaires transverses (style/`twCss`, router, thème, react, temps, tableaux, debug). `pyramids-layouts`, `pyramids-links` et `pyramids-ctas` en dépendent.
- packages/themes — tokens de design côté JS (`pyramidsColors`, `PyramidsTheme`, surcharges par site). Distinct de la palette DaisyUI/Tailwind de `apps/dakar`.
- packages/layouts, packages/links, packages/ctas — les bibliothèques de présentation partagées : primitives de structure, wrappers de `next/link` avec navigateurs serveur et client, widgets d'appel à l'action.
- packages/robusta-design-system (`@robusta/pyramids-design-system`) — le design system de robusta.build, un module que d'autres sites peuvent partager (BR-PYRAMID-3, BR-PYRAMID-13) : tokens CSS (`colors_and_type.css`, `sketch.css`), assets de marque, aperçus HTML, 6 primitives React et 8 sections marketing. Les sections rendent leurs liens internes par le `linkComponent` que fournit le site, et le module ne dépend d'aucun router.

## Diagram

```
  Arrow = depends on, through a library API. Nothing points into an app.

  app robusta-build            app dakar
  TanStack Start, Vite 8       Next 15, RSC + ISR, MapLibre
  Netlify, static files        Vercel
     │                            │
     ↓                            ↓
  module design-system         module layouts · links · ctas
                               DaisyUI classes, deprecated
                                  │
                                  ↓
                               module themes · helpers
```

Les modules se construisent dans `dist/`, et les apps consomment les artefacts construits, jamais les sources TS.

## Data Flow — un site de contenu

```
  content markdown
    Next  apps/dakar/content
    v2    apps/robusta-build/content/articles
        │
        ↓
  build-time read   Next: the site's own parser
        │           v2: the site's package corpus-reader, one traversal
        │               per corpus root per process; the images the
        │               articles reference mirrored into public/
        ↓
  render  ←── src/seopyramids.config.ts: domain, siteName, locales, roll
        │ ←── modules: design system; layouts · links · ctas on Next
        │
        ├──→ Next: apps/dakar
        │    App Router, RSC, static generation + ISR      ──→ Vercel
        │    segment [locale]
        │
        └──→ v2: apps/robusta-build
             TanStack Start prerender in vite build, then hydration
             data files from the static server functions
             v2: Locale prefix except en, then c, p, t     ──→ Netlify
```

Chaque site porte sa configuration propre dans `src/seopyramids.config.ts` : domaine, `siteName`, logo, Locale par défaut et autres Locales, et la configuration du blog (roll size, auteur). Le site Next y ajoute `siteTitle`, `mission` et, dans la configuration du blog, des mots-clés obligatoires et un résolveur de Categories ; le site v2 y ajoute le content root dans la configuration du blog, `contact` et la page copy de chaque Locale.

## Data Flow — chaîne de build

```
  yarn build:deps, tsc, each module to dist/, in this order:
    helpers → themes → design-system → layouts → links → ctas
        │
        ├──→ yarn build:robusta      vite build, every page prerendered
        │                            into dist/client, then the
        │                            route-table check, sitemap.xml and
        │                            robots.txt, _redirects, the SEO check
        └──→ yarn build:dakar        next build
```

Les apps résolvent les modules par leur `dist/` compilé. Une modification de module est invisible d'une app qui tourne tant qu'il n'est pas reconstruit ; `yarn w:<module>` lance son watcher.

Le green set, ce qui doit se construire depuis un checkout propre, dans cet ordre : `yarn install`, `yarn build:deps`, `yarn build:dakar`, `yarn build:robusta` (BR-PYRAMID-5). `apps/dakar` produit 23/23 pages statiques. `apps/robusta-build` écrit 34 fichiers HTML, les 3 landing pages, celle de `en` en `index.html` à la racine, les 30 URL de contenu que dérivent les dix-sept articles et `404.html`, et 69 fichiers de données : un par article, un flux de notes par landing page, un fichier de contreparties par landing page et par URL de contenu, une page de roll par page d'accueil du blog et de Category et une liste de rolls par Locale, plus `sitemap.xml`, `robots.txt` et `_redirects`. Un second `yarn install` laisse `yarn.lock` identique à l'octet.

## Dependencies

- Depends on : React 19 et TypeScript partout ; Next.js 15 App Router, Tailwind 3 + DaisyUI et Vercel pour `apps/dakar` ; TanStack Start sur Vite 8, Tailwind 4 et Netlify pour `apps/robusta-build` ; MapLibre pour dakar.
- Used by : les sites déployés robusta.build et dakar.surf.
- Build : yarn 4 workspaces, `tsc` par module, `next build` pour `apps/dakar`, `vite build` avec le prérendu pour `apps/robusta-build`. Pas de script de test à la racine : chaque workspace lance le sien, vitest ou, pour le design system, `node --test`.
- Toolchain : le manifeste racine déclare `packageManager: "yarn@4.17.1"` et `engines.node: "22.x"`, et les scripts de build de `@robusta/robusta-build` exigent 22.18 ou plus, pour le type stripping de Node ; `.yarnrc.yml` déclare `nodeLinker: node-modules`, sans Plug'n'Play, car `tsc`, `next build`, Vite et vitest lisent l'arborescence sur disque et la build Netlify l'exige, plus `enableGlobalCache` (pas de zero-install, le cache reste hors de git), `enableScripts` (sharp, esbuild et @parcel/watcher construisent des binaires natifs à l'install), `yarnPath` et `packageExtensions`. `.nvmrc` porte la même version majeure de Node pour les humains. L'install est `yarn install`, et le yarn qui l'exécute est le binaire commité `.yarn/releases/yarn-4.17.1.cjs`, que nomme `yarnPath` : tout yarn du PATH lui délègue. Corepack est inutile, et un cache corepack dans le dépôt casse l'install : le `"type": "module"` de la racine fait charger à Node le bundle CommonJS de yarn comme module ES. Le corepack de Vercel met son cache là ; l'image de build Netlify active corepack avec un cache hors du dépôt (`apps/robusta-build/README.md`, Yarn on a build agent). `packageManager` reste la version déclarée, lue par un shim corepack ou un éditeur ; `yarnPath` décide du binaire.
- Deux versions majeures de Vite : la racine hisse le Vite 6.4.3 du vitest 3 de `packages/helpers`, et le Vite 8.3.2 du site v2 est sous `apps/robusta-build/node_modules`. `packageExtensions` déclare le peer `vite` que `@tanstack/react-start-rsc` omet : sans lui, `@tanstack/start-plugin-core` hissé lierait le Vite 6 de la racine. Les plugins TanStack et la build du site lient le Vite 8, jamais celui hissé.
- Les références croisées entre workspaces suivent le protocole workspace (`"@robusta/pyramids-helpers": "workspace:*"`). Ces modules ne sont publiés nulle part : une dépendance interne au monorepo que le résolveur pourrait chercher dans le registre fait échouer un checkout propre sur un 404 au lieu de se résoudre localement.

## Notes / Gotchas

- Les apps consomment les artefacts construits, pas les sources. Toute modification d'un module demande une reconstruction ou un watcher en marche.
- Dans `apps/robusta-build` et `packages/robusta-design-system`, un import TypeScript local, alias `@/` compris, nomme le fichier `.ts` ou `.tsx` lui-même, et un import de dossier son `index.ts` ; les configurations `tsc` qui émettent réécrivent ces chemins en `.js` (`rewriteRelativeImportExtensions`). Un import en `.js`, sans extension ou à extension fausse fait échouer la build du site (`scripts/check-source.mjs`) ou les tests du design system (`src/import-specifiers.spec.ts`).
- Dans `apps/dakar` et les autres modules, un import TypeScript local finit par `.js`, même si la source est `.ts`/`.tsx`. Un import non conforme se signale, il ne se réécrit pas en silence. `apps/dakar` les résout sous webpack par `experimental.extensionAlias` dans son `next.config.ts`.
- Aucune build de site ne lance eslint : `eslint.ignoreDuringBuilds: true` dans le `next.config.ts` de `apps/dakar`, et `apps/robusta-build` lint hors de sa build. Une build verte ne dit rien du lint : lancer `yarn lint` explicitement.
- `packages/robusta-design-system` est arrivé sur `dev` le 2026-07-30 par le merge `c0f98fe`, item 1 de l'epic pyramid-v2. La sortie brute de Claude Design, CSS, assets, aperçus, y était déjà ; le merge a ajouté ce qui fait du dossier un workspace : `package.json` avec ses exports de sous-chemins CSS et assets, `src/`, `tsconfig.json` et son archi. Il se construit dans `yarn build:deps`, entre `pyramids-themes` et `pyramids-layouts`.
- Deux systèmes de couleurs parallèles coexistent : `pyramids-themes` (tokens JS) et la palette DaisyUI du `tailwind.config.ts` de `apps/dakar`. Changer l'un ne bouge pas l'autre, et le design system en ajoute un troisième, en variables CSS.
- DaisyUI reste hors du site v2 : `apps/robusta-build` ne déclare ni `daisyui` ni `pyramids-layouts`, `pyramids-links` et `pyramids-ctas`, qui rendent des classes DaisyUI, et ses composants viennent de shadcn sur Tailwind 4. `apps/dakar` reste sur DaisyUI.
- `Next.js build worker exited with code: 1 and signal: null` ne nomme aucune cause : lire l'erreur de prérendu imprimée au-dessus, jamais la ligne de sortie du worker. Une `TypeError: Cannot read properties of null (reading 'useContext')` à cet endroit signale deux copies de React dans le graphe : `useContext` tourne sur le React qui ne pilote pas le rendu. Chercher d'abord une copie dupliquée d'un package à état global au processus, React en premier. Chaque workspace déclare React 19.1.1 stable, et une install propre n'en résout qu'un.
- La règle, à appliquer en premier : un package qui importe quelque chose le déclare, et un package à état global au processus se résout en une seule copie par graphe. `pyramids-links` et `pyramids-ctas` importent `next/*` ; `pyramids-layouts` et `pyramids-ctas` importent `@robusta/pyramids-helpers`. Tous le déclarent, en peer quand la copie doit venir de l'hôte, et aucun résolveur ne peut en placer une seconde dans un sous-arbre.
