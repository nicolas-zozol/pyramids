# Story : Le français devient la Locale par défaut de robusta.build

**Dernière mise à jour :** 2026-10-08
**Feature :** default-locale-fr
**Infix :** DEFAULTLOCALE
**Status :** LANDED (2026-10-08, implémentation non commitée, dans le working tree)

## Story

En tant qu'éditeur de robusta.build, je veux que `fr` soit la Locale par défaut du site, sans marqueur dans l'URL, afin que les pages d'un site entièrement français aient leur adresse définitive avant que go-live n'ouvre l'indexation.

## Contexte & objectif

Le 2026-10-06, robusta.build est passé entièrement en français, mais son schéma et sa Site configuration déclaraient encore `en` par défaut : chaque page française portait le marqueur `/l/fr`. OQ-PYRAMID-1 a tranché pour `fr` par défaut et `en` seule autre Locale, première des deux étapes vers BR-PYRAMID-11, pendant que le site est encore en `noindex` et sans redirection. Livré dans le working tree, prouvé par les 110 tests de robusta-build, le lint et `yarn build:robusta` : 21 URL de contenu, 7 sans marqueur et 14 sous `/l/en`, rien sous `/l/fr`, v1 map à 82 lignes dont seules les destinations ont changé.

## Livré

### Requirements

- R-DEFAULTLOCALE-01 : `urlScheme` déclare `defaultLocale: 'fr'` et `otherLocales: ['en']`, première étape vers BR-PYRAMID-11. Ce qui lit le schéma suit sans autre code : table de routes et prerender (`contentUrls`), `<html lang>` (`__root.tsx`), flux de notes de `/` et son lien « all articles », `articleUrl`, `blogConfig`.
- R-DEFAULTLOCALE-02 : la racine de la Site configuration lit `defaultLocale` et `otherLocales` de `urlScheme`, comme `blogConfig` ; `seopyramids.config.ts` n'écrit plus aucune Locale.
- R-DEFAULTLOCALE-03 : les specs qui lisent le corpus réel ou la Locale par défaut prennent leurs attentes des AC : `migrated-corpus` (les 21 URL), `article-page` (paire yield farming, category URL), `notes-feed`, `NotesSection` (son cas « Locale donnée » passe à `en`, vers `/l/en/articles`). Les chaînes `/l/fr/…` qui ne passent pas par le schéma restent : `SiteLink`, `reloadOnce`, `urlOfHtmlFile`, les payloads de fixture d'`ArticleView`.
- R-DEFAULTLOCALE-21 : `v1-url-map.ts` exporte `V1_LOCALES` à côté des trois constantes d'inventaire v1, et `v1UrlMap` calcule chaque `from` avec elle seule. Les commentaires du module qui disent « non-default locale » nomment la Locale de v1.
- R-DEFAULTLOCALE-22 : chaque ligne mène à une page dans la langue de la page v1 : une adresse v1 sans marqueur vise `en` tant qu'elle est publiée, `/learn/fr/…` vise `fr`, une ligne d'article la Locale de l'article, une ligne de tag `en`.
- R-DEFAULTLOCALE-23 : `v1-url-map.generated.json` est régénéré par `scripts/emit-v1-map.mjs` et commité dans le même changement. Son diff ne touche que des `to` et les deux Locales de l'en-tête, qui restent celles de `urlScheme`, le schéma des destinations.
- R-DEFAULTLOCALE-24 : une spec fige les 82 paires (`from`, `destination.kind`) dans l'ordre, extraites une fois de la map commitée à HEAD (`git show HEAD:apps/robusta-build/src/routing/v1-url-map.generated.json`), et exige que `v1UrlMap(urlScheme, index)` les reproduise. La spec « only the French ones twice » reste telle quelle.
- R-DEFAULTLOCALE-25 : une spec exige que chaque destination permanente soit une URL que le site construit, `buildUrl(urlScheme, …)` sur `urlSet(urlScheme, index)`.
- R-DEFAULTLOCALE-41 : `NotFoundPage` est rédigée en français : « page introuvable », « Aucune page n'est publiée à cette adresse. », lien « retour à l'accueil » vers `/`.
- R-DEFAULTLOCALE-42 : l'état d'échec de navigation est rédigé en français : « cette page n'a pas pu se charger », liens « réessayer cette adresse » et « revenir à l'accueil ». Il est rendu par un composant sans état du package `components`, `FailedNavigationPage({ href }: { href: string })`, que `NavigationFailure` rend quand `reloadOnce` abandonne ; `reloadOnce` ne change pas.
- R-DEFAULTLOCALE-43 : le `<nav>` de fin d'`ArticleView` porte `lang="fr"` et un texte constant, quelle que soit la Locale de l'article : `aria-label` « Pour continuer la lecture », « Classé dans » devant la category, « Autre langue : » devant le lien de traduction. Ce lien garde `translation.label`, écrit dans sa propre langue, avec ses `lang` et `hrefLang`.

### Acceptance Criteria

- AC-DEFAULTLOCALE-1 : Given les trois articles français publiés, When le site est construit, Then eux, le blog roll français et leurs pages de category sont servis sans marqueur de Locale : `/articles` est le blog roll français, `/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain` répond 200, et l'ancienne adresse marquée `/l/fr/articles/c/blockchain` répond 404 avec la page 404, sans redirection.
- AC-DEFAULTLOCALE-2 : Given les huit articles anglais encore publiés, When le site est construit, Then eux, leur blog roll et leurs pages de category sont servis sous `/l/en`, `/l/en/articles/c/privacy/leaving-gmail` répond 200, et le site compte toujours 21 URL de contenu, 7 sans marqueur et 14 sous `/l/en`.
- AC-DEFAULTLOCALE-3 : Given une page sans marqueur de Locale, `/` et la page 404 comprises, When un visiteur l'ouvre, Then son document déclare `lang="fr"`, et une page sous `/l/en` déclare `lang="en"` ; la page 404, servie aussi pour une adresse inconnue sous `/l/en`, et l'état d'erreur d'une navigation échouée sont rédigés en français.
- AC-DEFAULTLOCALE-4 : Given trois articles français publiés et une section de notes de quatre places, When un visiteur ouvre `/`, Then elle liste ces trois articles, aucun article anglais ni aucune traduction non publiée, et son lien vers tous les articles mène à `/articles`.
- AC-DEFAULTLOCALE-5 : Given la v1 map régénérée dans le même changement, When on la compare à celle d'aujourd'hui, Then elle liste les mêmes adresses v1 dans le même ordre, avec la même issue chacune (82 lignes : 66 permanentes, 6 Gone, 10 sans destination), et seules les destinations changent, chacune étant une URL que le site construit, dans la langue de la page v1 : `/learn/fr/blockchain` mène à `/articles/c/blockchain`, `/learn` à `/l/en/articles`, `/learn/tag/web` à `/l/en/articles/c/web`.
- AC-DEFAULTLOCALE-6 : Given les cas limites, When le site est construit, Then une category revendiquée par une seule Locale n'a de page que dans celle-ci : `web`, que seuls des articles anglais publiés revendiquent, existe sous `/l/en` et `/articles/c/web` répond 404 ; `theory`, que seul un article français revendique, existe sans marqueur et `/l/en/articles/c/theory` répond 404 ; aucune des six traductions françaises non publiées n'a d'adresse.
- AC-DEFAULTLOCALE-7 : Given une page article, anglaise sous `/l/en` comprise, When un visiteur en lit la fin, Then elle est rédigée en français et se déclare `lang="fr"`, le nom de langue du lien de traduction restant dans sa propre langue ; l'article français sur le yield farming et sa version anglaise se lient l'un à l'autre à leurs nouvelles adresses, et `leaving-gmail`, dont la traduction n'est pas publiée, n'a aucun lien de traduction.

## Boundaries

Le contrat de référence est la section Boundaries de [`default-locale-fr.design.md`](default-locale-fr.design.md).

### HTTP API of app `@robusta/robusta-build` — modified

Client code : navigateurs et crawlers.

- `GET /articles…` sans marqueur de Locale — 200, les pages de la Locale `fr`, `<html lang="fr">` · avant : celles de `en`
- `GET /l/en/articles…` — 200, les pages des articles anglais, `<html lang="en">`, jusqu'à translate-english-articles · avant : 404, Locale par défaut marquée
- `GET /l/fr/articles…` — 404, `404.html` · avant : 200
- `GET /` et la page 404 — `<html lang="fr">`, la page 404 rédigée en français · avant : `en`, en anglais
- `GET` une page article, sous `/l/en` comprise — sa fin de page en français, déclarée `lang="fr"` · avant : en anglais

### library API of package `routing` in app `@robusta/robusta-build` — modified

Client code : les routes, `page-data`, `landing`, la Site configuration et `scripts/emit-v1-map.mjs`.

- `urlScheme` — `defaultLocale: 'fr'`, `otherLocales: ['en']`, forme inchangée
- `V1_LOCALES` — nouveau, les Locales que v1 publiait, `en` par défaut puis `fr`, figées avec l'inventaire v1
- `v1UrlMap(scheme, articles)` — même signature ; chaque `from` vient de `V1_LOCALES`, chaque `to` de `scheme`, dans la langue de la page v1

Les library API de `@robusta/pyramids-routing` et de `@robusta/pyramids-content` ne changent pas.

## Décisions

- 2026-10-06 — `fr` devient la Locale par défaut et `en` la seule autre, jusqu'à ce que translate-english-articles vide `otherLocales`. Pourquoi : OQ-PYRAMID-1 (`lgtm`) ; retirer ici les articles anglais les dépublierait, ce qu'OQ-PYRAMID-2 a écarté.
- 2026-10-08 — La v1 map calcule ses adresses v1 avec les Locales de v1, figées dans `V1_LOCALES` ; seules les destinations lisent le schéma du site. Pourquoi : régénérée avec les Locales du site, elle inventait 24 adresses `/learn/en/…` et en perdait 19 `/learn/fr/…`.
- 2026-10-08 — Une ligne de la v1 map mène à une page dans la langue de la page v1, et une ligne de tag prend `en`, Locale par défaut de v1. Pourquoi : `/learn` et `/learn/tag/web` menaient à des pages anglaises encore publiées ; restore-v1-urls réexaminera ces destinations.
- 2026-10-08 — La page 404, l'état d'échec de navigation et la fin de page article passent en français, avec un texte constant, pages anglaises comprises ; le bloc de fin porte `lang="fr"`. Pourquoi : une page déclarée `fr` qui affiche « page not found » est un défaut (OQ-DEFAULTLOCALE-2 et 3, `lgtm (boss)`).
- 2026-10-08 — L'état d'échec de navigation est rendu par un composant sans état, `FailedNavigationPage({ href })`. Pourquoi : vitest tourne sans DOM, et un rendu sans effet suffit à le tester.
- 2026-10-08 — Pipeline mené par boss de la story au land, design APPROVED par boss, aucun commit : Nicolas commite lui-même. Journal dans `decisions-and-questions.md`.

## Documentation updates

- changed la ligne `locale` de §Articles dans `apps/robusta-build/README.md` : `fr` est la Locale par défaut, sans marqueur, `en` l'autre.
- changed §Routing de `apps/robusta-build/README.md` : la Locale par défaut marquée qui répond 404 est `/l/fr/…`, les 21 URL de contenu se répartissent en 7 sans marqueur et 14 sous `/l/en`, `scheme.ts` écrit aussi les deux Locales que la Site configuration lit, et l'état d'échec de navigation est `FailedNavigationPage`.
- changed §The v1 mapping de `apps/robusta-build/README.md` : les adresses v1 suivent `V1_LOCALES`, et chaque destination est une page dans la langue de la page v1.
- changed `apps/robusta-build/robusta-build.archi.md` : Locale par défaut `fr`, texte français de la 404, de l'échec de navigation et de la fin d'article, packages `article`, `components` et `routing`, ligne 404 du bloc HTTP ; l'en-tête de package de `src/routing/v1-url-map.ts` cite aussi seo-url-scheme et migrate-learn-content.

## Dependencies

Aucune en amont. Ce que la story débloquait :

- translate-english-articles — publie chaque traduction à son adresse finale, sans marqueur, et vide `otherLocales`. Chaque traduction publiée ajoute à la v1 map deux adresses que v1 n'a jamais publiées : la spec de R-DEFAULTLOCALE-24 échoue alors, et le sort de ces lignes lui revient ou revient à restore-v1-urls.
- robusta-landing-page (Dep 3 de sa story), seo-excellence (Dep 2 de sa story), go-live — levée.
- restore-v1-urls — prend en entrée la v1 map régénérée ici ; les lignes qui mènent sous `/l/en` perdent leur destination quand translate-english-articles vide `otherLocales`.
