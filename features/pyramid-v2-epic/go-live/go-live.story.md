# Story : Ouvrir robusta.build à l'indexation

**Dernière mise à jour :** 2026-11-04
**Feature :** go-live
**Infix :** GOLIVE
**Status :** ACTIVE

## Story

**En tant qu'**éditeur de robusta.build, **je veux** ouvrir à l'indexation les pages que le site déclare indexables, et elles seules, **afin que** les moteurs de recherche trouvent le site v2 sans jamais indexer une page vide ou la 404.

## Contexte & objectif

Le domaine sert déjà la v2 depuis la bascule DNS du 2026-10-06 (tanstack-start-migration), production sur la branche `main` de Netlify, mais la route racine déclare `robots: noindex, nofollow` sur chaque page. seo-excellence fait déclarer à chaque page son indexabilité, écrit le sitemap et `robots.txt`, et garde tout fermé jusqu'à go-live. go-live est l'ouverture : la racine garde `noindex` par défaut, chaque page que seo-excellence déclare indexable s'ouvre, et rien d'autre. C'est la décision de l'epic du 2026-10-06, OQ-LANDING-12 et OQ-SEOEXCELLENCE-19 répondues `lgtm`.

Une page ne s'ouvre que si deux conditions sont réunies : seo-excellence la déclare indexable, et la build est celle de la production. Netlify n'ajoute `X-Robots-Tag: noindex` qu'aux deploy previews et aux anciens déploiements de branche : le dernier déploiement de `epic/robusta-v2` est public et sans cet en-tête, il s'ouvrirait dès le commit de go-live. La build se sait production par la variable `CONTEXT` de Netlify, ouverte seulement sur `production` ; une build locale ne la porte pas et reste fermée. La condition est fixée au build, et le head recalculé dans le navigateur dit la même chose que le HTML prérendu.

La production sert aussi `robusta-build.netlify.app`, en 200 : go-live le renvoie en 301 vers la même page sous `https://www.robusta.build`, pour qu'aucune copie ouverte ne vive sous un second hôte. L'apex `robusta.build` renvoie déjà vers `www`.

L'ordre compte : ouvert avant seo-excellence, le site serait indexé avec des pages sans titre propre ni sitemap. Le travail reste sur `epic/robusta-v2` ; rien n'est indexé avant que Nicolas merge sur `main`. Une production ouverte attire les crawlers, d'où l'offre Netlify Personal avec recharge automatique décidée le même jour, le plafond de l'offre Free mettant les sites de l'équipe en pause.

Hors périmètre : ce que chaque page déclare, le sitemap, `robots.txt`, les canonical URLs et l'audit de la build (seo-excellence) ; les adresses v1, qui répondent 404 (restore-v1-urls) ; le DNS, déjà basculé ; la protection par mot de passe des déploiements hors production.

## Acceptance Criteria

- AC-GOLIVE-1 : Given la build de production de robusta.build, When un crawler lit une page que seo-excellence déclare indexable, qu'il exécute les scripts ou y arrive par une navigation dans le site, Then la page se déclare indexable et ses liens peuvent être suivis.
- AC-GOLIVE-2 : Given la build de production, When un crawler lit une page que seo-excellence ne déclare pas indexable (la 404, qu'une adresse v1 sert aussi, une page sans contenu propre, une page ajoutée sans rien déclarer), Then elle garde le `noindex` de la racine.
- AC-GOLIVE-3 : Given une build qui n'est pas celle de la production Netlify, le déploiement de branche de `epic/robusta-v2`, une deploy preview, une build locale ou un draft deploy du CLI, When un crawler la lit, scripts exécutés ou non, Then aucune page ne s'y déclare indexable, go-live y étant déjà commité, et son `robots.txt` ne bloque rien, pour que le crawler lise le `noindex` de chaque page.
- AC-GOLIVE-4 : Given go-live mergé sur `main` et déployé, When Nicolas soumet `/sitemap.xml` dans la console webmaster où robusta.build est une propriété vérifiée, Then la console lit le sitemap, et aucune URL qu'il liste n'est signalée bloquée par `noindex` ou par `robots.txt`. Vérifié après le merge, à `storyman done`.
- AC-GOLIVE-5 : Given la production ouverte, When elle revient à un déploiement d'avant go-live, Then tout le site se referme.
- AC-GOLIVE-6 : Given la production ouverte, When une page indexable perd son contenu propre, Then elle se referme à la build suivante, sans retouche de go-live.
- AC-GOLIVE-7 : Given la production ouverte, When un crawler lit une page sous `robusta-build.netlify.app`, Then il est renvoyé en 301 vers la même page sous `https://www.robusta.build`, et `www` n'est pas redirigé.

## Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Nothing points into an app, no loop.

  Netlify build (sets CONTEXT)         crawlers
      │                                   │
      │ CLI                               │ HTTP
      ↓                                   ↓
  app `@robusta/robusta-build` [modified]
```

### CLI API of app `@robusta/robusta-build` — modified

Client code : la build Netlify, et une build locale.

- `yarn build:robusta` · modifié — lit `CONTEXT` ; `production` ouvre les pages indexables, toute autre valeur ou son absence garde tout fermé. Codes de sortie inchangés.

### HTTP API of app `@robusta/robusta-build` — modified

Client code : crawlers.

- `GET` sur une page indexable, build de production · modifié — 200, son head la déclare indexable · était `noindex, nofollow`, la directive de la racine. Toute autre page, et toute page d'une build hors production, garde cette directive.
- `GET https://robusta-build.netlify.app/{path}` · modifié — 301 vers `https://www.robusta.build/{path}`, règle forcée limitée à cet hôte · était 200.

`/sitemap.xml` et `/robots.txt` sont livrés par seo-excellence ; go-live n'y change rien.

## Documentation updates

- change la section Netlify de `apps/robusta-build/README.md` — why: elle dit l'équipe en offre Free à 300 crédits, et ne dit ni que seule la build de production s'ouvre, ni que `robusta-build.netlify.app` renvoie vers `www`.
- change la ligne robusta.build de `README.md` et celle de `apps/robusta-build` dans `CLAUDE.md` — why: toutes deux disent `noindex` sur chaque page.
- change la ligne go-live de `.claude/skills/geo-article/SKILL.md` — why: elle dit chaque page v2 `noindex` et aucun article citable.

## Dependencies

- Dep 1: seo-excellence, B2 — la déclaration d'indexabilité de chaque page, le sitemap, `robots.txt` et l'audit de la build ; go-live n'ouvre que ce qu'elle déclare. Story ACTIVE.
- Dep 2: l'équipe Netlify passe en offre Personal avec recharge automatique avant le merge sur `main` (décision du 2026-10-06) — action de Nicolas hors dépôt ; le README la dit encore en Free.
- Levées : tanstack-start-migration (DNS vers Netlify le 2026-10-06), robusta-landing-page (`79b4eb0`), blog-rolls (`bc568f7`, plus aucune page de listing en placeholder).
