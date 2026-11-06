# Brainstorm : restore-v1-urls

**Date :** 2026-11-06
**Participants :** bsman (autonomous)
**Infix :** RESTOREV1
**Source :** `features/pyramid-v2-epic/restore-v1-urls/restore-v1-urls.story.md`

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Ce brainstorm suit les Propositions des deux entrées encore ouvertes de la story : OQ-RESTOREV1-1 (les adresses v1 reviennent, 67 en 301 et 5 Gone en 410, par des règles Netlify que la build génère depuis la v1 map) et OQ-RESTOREV1-2 (rattrapage de v1 seulement, aucune règle pour tout le site). Ses propres entrées commencent à 3.

---

## Challenge des Acceptance Criteria

Verdict par AC :

- AC-RESTOREV1-1 : testable sur un draft deploy, en langage métier ; « un seul saut » est le bon critère. Ne couvre que `www.robusta.build` : sur `robusta-build.netlify.app`, la règle v1 passe avant la règle de l'hôte et l'adresse fait deux sauts (E4).
- AC-RESTOREV1-2 : testable, mais repose sur un 410 que Netlify ne documente pas pour une règle statique (OQ-RESTOREV1-3). Sous `/learn`, « sans destination → 404 » entre en collision avec la règle Gone qui prend tout autre `/learn/…` : sans règle 404 placée avant elle, les images v1 et les pages de roll v1 répondraient 410 (E1, OQ-RESTOREV1-4).
- AC-RESTOREV1-3 : testable, suffisant. Aucune règle n'est forcée : un fichier construit au chemin demandé gagne toujours sur une règle v1.
- AC-RESTOREV1-4 : testable au build, suffisant pour un changement de category. Ne dit pas ce que devient l'adresse v1 d'un article que le corpus ne publie plus (E2).
- AC-RESTOREV1-5 : testable sur un draft deploy. La barre finale est satisfaite sans règle de plus : l'hébergeur retire la barre avant d'évaluer les règles. La casse ne l'est que si la règle porte `DeFi` tel quel : les chemins des règles Netlify sont sensibles à la casse, et `/learn/tag/defi`, que v1 n'a jamais publié, tombe sur la règle Gone.

Cas limites métier proposés à storyman :

- E1, une adresse v1 sans destination sous `/learn` : Given une image v1 (`/learn/blockchain/s/images/{fichier}`) ou une page de roll v1 (`/learn/page/2`, `/learn/tag/web/page/2`), When on la demande, Then elle répond 404 avec la page introuvable, et non 410.
- E2, un article v1 que le site ne publie plus : Given un article v1 passé à `published: false`, When le site est construit, Then la build aboutit, et son adresse v1 comme son fichier markdown brut répondent 410.
- E3, un article v1 renommé : Given un article v1 dont le slug v2 change, When le site est construit, Then son ancienne adresse v1 répond 410 ; aucune redirection n'est écrite vers le nouveau slug (OQ-RESTOREV1-2 de la story).
- E4, l'ancien sous-domaine : Given une adresse v1 demandée sur `robusta-build.netlify.app`, When on la suit, Then elle aboutit en 200 à sa page v2 sur `www.robusta.build`, en deux redirections permanentes.
- E5, le développement : Given le site sous `vite dev`, When on ouvre une adresse v1, Then elle répond par la page 404 : les règles n'existent que chez l'hébergeur.

Aucune Business Rule nouvelle, OQ-RESTOREV1-2 de la story suivie. La story respecte BR-PYRAMID-7 (aucune lecture du corpus à la requête) et BR-PYRAMID-14 (destinations `en` sans préfixe).

---

## 1. Rôle du produit

Une table de redirections statiques que la build dérive de la v1 map et que Netlify sert. Ce n'est ni un mécanisme de redirection général pour les futurs renommages, ni une fonction, ni un changement de page v2.

**Décision (autonome):** le périmètre est la v1 map servie, telle qu'elle est calculée, plus les règles 404 qu'exige la règle Gone sous `/learn`.

**Rationale:** la map est écrite, testée et régénérée à chaque build ; il ne manque que son service.

---

## 2. Public cible

- Les robots des moteurs, qui gardent des adresses `/learn…` de v1 dans leur index ou leurs liens connus.
- Les visiteurs venant d'un lien externe ou d'un favori vers une adresse v1.
- L'éditeur (Nicolas), seul à lire dans la Search Console ce que ces adresses rapportent encore.

**Décision (autonome):** les robots sont le persona décisif : un 301 transfère l'adresse indexée, un 410 la retire.

**Rationale:** un visiteur humain se contenterait d'une 404 lisible ; c'est l'index qui perd quelque chose.

---

## 3. Problème central

**Problème :** depuis le 2026-10-06, toute adresse `/learn…` répond 404. Ce qu'une adresse v1 indexée ou liée apportait ne mène plus à rien, alors que sa page existe en v2.

**Décision (autonome):** rendre chaque adresse v1 connue de la map à sa page v2, et retirer explicitement le reste de `/learn`.

**Rationale:** la correspondance est déjà calculée ; le coût restant est le service sur l'hôte.

---

## 4. Proposition de valeur

**Options considérées :**

- Règles statiques Netlify générées depuis la map : gratuites sur Free, sans exécution, suivent le corpus.
- Pages HTML à redirection meta : écartées par la story, moins bien lues qu'un 301.
- Edge function ou function : contraire au parti « aucune fonction » du site.
- Laisser en 404 : la branche de refus d'OQ-RESTOREV1-1, hors de ce brainstorm.

**Décision (autonome):** règles statiques générées.

**Rationale:** c'est la seule option qui donne un vrai 301 sans exécuter de code à la requête.

---

## 5. Périmètre fonctionnel

Dans le périmètre :

- les 67 lignes permanentes en 301, les 5 Gone en 410 ;
- les lignes sans destination situées sous `/learn` (trois patterns de roll, les images), servies en 404 explicite avant la règle Gone ;
- la garde de build sur les destinations ;
- la mise à jour du README et de l'archi.

Hors périmètre :

- les lignes sans destination hors `/learn` (`/`, `/portfolio`, `/fr/portfolio`, restes de développement) : aucune règle, elles répondent déjà 404 ou par leur page v2 ;
- toute redirection d'une adresse v2 renommée (OQ-RESTOREV1-2 de la story) ;
- les images v1 redirigées vers `article-images` ;
- la mesure du trafic récupéré.

Ordre dans lequel Netlify répond, une fois les règles générées :

```
  How Netlify answers a request: rules top to bottom, first match wins.
  An unforced rule is skipped when a file exists at the requested path.

  request
    │
    ↓
  _redirects in dist/client, written by the build from the v1 map
    1. v1 permanent rows            → 301, v2 page
    2. v1 none rows under /learn    → 404, 404.html
    3. v1 gone rows, /learn/* last  → 410, 404.html
    │ no match
    ↓
  netlify.toml, hand-written, unchanged
    4. robusta-build.netlify.app/*  → 301, same path on www (forced)
    5. /en, /en/*                   → 301, unprefixed page
    │ no match
    ↓
  file at the path → 200, else 404.html → 404
```

**Décision (autonome):** les règles générées vont dans un fichier `_redirects` écrit dans `dist/client` après `vite build` ; `netlify.toml` et ses trois règles ne changent pas (OQ-RESTOREV1-5).

**Rationale:** `_redirects` est le format que Netlify prévoit pour des règles produites par la build et il s'applique par deploy ; `netlify.toml` est une source commitée que la build n'a pas à réécrire.

---

## 6. Fonctionnalités essentielles

### Feature : les règles générées depuis la v1 map

**Capability :** la build traduit chaque ligne de la map en règle Netlify, dans l'ordre de la map, qui est déjà l'ordre de priorité : permanentes en 301, Gone en 410 vers `/404.html`, sans destination sous `/learn` en 404 vers `/404.html`. La syntaxe de la map se traduit telle quelle (`:n`, `:tag` restent des placeholders, `:path*` final devient `*`). Aucune règle n'est forcée.

**Acceptance Criteria :** AC-RESTOREV1-1, AC-RESTOREV1-5 (testables ; E4 proposé)
- Proposed to storyman : E4.

**Test Approach :** spec vitest du script sur la map réelle (une règle par ligne servie, ordre conservé, `DeFi` intact, `/learn/*` en dernier) ; sur un draft deploy (`npx netlify-cli deploy`, jamais `--prod`), un passage `curl -I` sur chaque source de la map : statut, `Location`, puis 200 sur la destination.

---

### Feature : les adresses retirées et sans destination

**Capability :** les quatre fichiers markdown sans contenu et tout autre `/learn/…` répondent 410 ; les images v1 et les pages de roll v1 répondent 404 avec la page introuvable, parce que leurs règles précèdent la règle Gone.

**Acceptance Criteria :** AC-RESTOREV1-2 (410 non documenté : OQ-RESTOREV1-3 ; collision sous `/learn` : OQ-RESTOREV1-4)
- Proposed to storyman : E1, E5.

**Test Approach :** spec du script (les lignes 404 précèdent `/learn/*`) ; sur le draft deploy, une adresse de chaque classe : `.md` Gone, `/learn/n-importe-quoi`, `/learn/page/2`, une image v1.

---

### Feature : la garde de build sur les destinations

**Capability :** la build échoue, une ligne par défaut, quand une destination de la map n'est pas une page construite dans `dist/client`. Elle garantit aussi le saut unique : une destination construite n'est jamais elle-même une source de redirection.

**Acceptance Criteria :** AC-RESTOREV1-4 (testable, suffisant pour un changement de category)
- Proposed to storyman : E2, E3.

**Test Approach :** spec du script sur un `dist/client` de fixture privé d'une page destination ; `yarn build:robusta` vert sur le corpus réel.

---

### Feature : les adresses v2 inchangées

**Capability :** aucune source de la map ne désigne une page construite ; une règle non forcée céderait de toute façon au fichier.

**Acceptance Criteria :** AC-RESTOREV1-3 (testable, suffisant)

**Test Approach :** l'audit `check-seo` existant reste vert ; sur le draft deploy, `/`, `/articles`, `/fr/articles/c/blockchain`, `/en/articles` gardent leur réponse.

---

## 7. Cas limites critiques

- Barre finale : normalisée par l'hôte avant les règles, une règle par adresse suffit (AC-RESTOREV1-5).
- Casse : règles sensibles à la casse ; la règle porte la casse publiée par v1.
- Article v1 dépublié : sa ligne d'article disparaît de la map, sa ligne markdown passe Gone, l'adresse tombe sur `/learn/*` en 410 (E2).
- Article v1 renommé : même issue, 410, en suivant OQ-RESTOREV1-2 de la story (E3).
- Sous-domaine Netlify : deux sauts, la règle v1 d'abord sur le même hôte, puis la règle forcée vers `www` (E4). v1 était servi sous `www.robusta.build`, l'adresse que liens et index connaissent.
- Paramètres de requête : Netlify les transmet à la destination d'un 301.
- `vite dev` : aucune règle, 404 (E5).

**Décision (autonome):** aucun de ces cas n'appelle de règle supplémentaire, sauf les 404 sous `/learn`.

**Rationale:** l'hôte et la map en couvrent déjà le comportement voulu.

---

## 8. Contraintes non fonctionnelles

- Coût : `_redirects` est inclus dans l'offre Free ; environ 77 règles, loin de toute limite de taille documentée.
- Performance : servi par le CDN, aucune exécution (BR-PYRAMID-7).
- Build depuis un clean checkout (BR-PYRAMID-5) : le script lit la map et `dist/client`, rien d'externe.
- SEO : aucune adresse v2 ne change ; les destinations sont déjà canoniques.

**Décision (autonome):** aucune contrainte nouvelle au-delà de celles du site.

**Rationale:** la story n'ajoute qu'un fichier statique au deploy.

---

## 9. Dépendances externes

- Netlify, offre Free : `_redirects` dans le dossier publié, lu avant `netlify.toml`, première règle qui correspond, chemins sensibles à la casse, barre finale retirée avant évaluation, `!` ou `force` pour passer outre un fichier existant. Statuts documentés : 200, 301, 302, 404. Le 410 n'y figure pas ; deux fils du forum de 2026 rapportent l'un un 404 servi à la place, l'autre un 410 obtenu avec une cible `/410.html`. Sources : docs.netlify.com/manage/routing/redirects/overview, docs.netlify.com/manage/routing/redirects/redirect-options, answers.netlify.com/t/410-redirects-served-as-404/161825, answers.netlify.com/t/creating-410-response-that-function-the-same-as-404-responses/165490.
- La Search Console, lue par Nicolas seul, pour décider (OQ-RESTOREV1-1 de la story) puis constater.

**Décision (autonome):** la règle Gone vise `/404.html`, une page construite, comme dans le cas rapporté qui fonctionne ; son comportement est constaté sur le draft deploy avant livraison.

**Rationale:** un statut non documenté se vérifie sur l'hôte réel, pas dans la documentation.

---

## 10. Risques majeurs

- Le 410 servi en 404 par Netlify : les adresses Gone répondraient comme aujourd'hui (OQ-RESTOREV1-3).
- Un article v1 renommé ou dépublié perd silencieusement son adresse v1 en 410 : accepté par OQ-RESTOREV1-2 de la story.
- Un comportement de l'hôte sur la casse différent de sa documentation : constaté sur le draft deploy par AC-RESTOREV1-5.
- Valeur incertaine : ce que les adresses v1 rapportent ne se lit que dans la Search Console.

**Décision (autonome):** chaque risque d'hôte se lève sur un draft deploy avant le merge.

**Rationale:** les règles sont identiques d'un deploy à l'autre : un draft les éprouve toutes.

---

## 11. Boundaries

```
  Arrow = depends on, from client code to the API it uses.
  Packages of app `@robusta/robusta-build`. No loop.

  package `scripts` [modified: emit-redirects]
      │                          │
      │ library                  │ library
      ↓                          ↓
  package `routing`  ──library──→  package `content`
  [modified: v1 map image rows]

  Netlify reads the file dist/client/_redirects that `scripts` writes.
```

### HTTP API of app `@robusta/robusta-build` — modified

```
GET <v1 permanent address>[/]          → 301, Location: v2 page of the map
GET /learn/tag/DeFi                    → 301, the v1 case only
GET <v1 gone .md address>              → 410, body 404.html
GET /learn/page/:n, /learn/fr/page/:n,
    /learn/tag/:tag/page/:n,
    /learn/images/:file,
    /learn/:category/s/images/:file    → 404, 404.html
GET /learn/<anything else>             → 410, body 404.html
GET robusta-build.netlify.app/<v1>     → 301 on that host, then 301 to www
GET <any v2 address>, /en…             → unchanged
```

Query string forwarded on a 301. Served by the host alone, from `dist/client/_redirects`.

### CLI API of package `scripts` — new: `emit-redirects.mjs`

```
node scripts/emit-redirects.mjs     run by `yarn build` after `vite build`
  reads    v1UrlMap(urlScheme, getArticleIndex()), the pages of dist/client
  writes   dist/client/_redirects, one rule per served row, in map order
  stdout   redirects: <n> rules (<p> permanent, <g> gone, <x> not found)
  exit 1   one line per defect: <from>: destination <to> is not a built page
```

`v1UrlMap`, `V1MappingRow` et `V1Destination` gardent leur forme. Seul le contenu change : la ligne image `/learn/:path*/images/:file`, inexprimable chez Netlify (aucun joker au milieu d'un chemin), devient `/learn/images/:file` et `/learn/:category/s/images/:file`, les deux formes des dossiers d'images de v1 ; la map passe de 82 à 83 lignes, dont 11 sans destination (OQ-RESTOREV1-4). `scripts` dépend de `routing` et de `content`, comme `emit-v1-map.mjs` ; rien ne dépend de `scripts`.

---

## Open Questions & Gaps

- OQ-RESTOREV1-3 : Si Netlify Free sert en 404 la règle 410 des adresses v1 retirées, ces adresses restent-elles en 404, sans fonction ni page dédiée ?
- Proposition : oui. La règle Gone vise `/404.html` avec le statut 410 ; le draft deploy constate le statut servi. Si c'est 404, les cinq adresses Gone répondent 404 et le critère des adresses retirées dit 404.
- Rationale : Netlify ne documente pas le 410 et le forum rapporte les deux issues ; la seule alternative sur l'hôte est une fonction, que le site exclut, pour un gain faible, un moteur retirant aussi une adresse en 404.
- Resolution:

---

## Next Steps

- Nicolas : trancher OQ-RESTOREV1-1 de la story après lecture de la Search Console, puis OQ-RESTOREV1-3.
- `storyman update restore-v1-urls avec brainstorm` : plier E1 à E5 dans les AC, OQ-RESTOREV1-4 et 5. Étendre le plan Documentation updates : `robusta-build.archi.md` dit aussi « trois règles de redirection » et « le site ne sert pas les adresses v1 » dans sa présentation, « lue par rien » dans le package `routing`, et la ligne Hébergement ; le README compte 82 lignes de map.
- `designman` : la traduction ligne à ligne de la map en règles, la résolution d'une destination en page construite (celle de `check-seo` pour les liens internes), la place du script dans `build`, la scission de la ligne image dans `v1-url-map.ts` et sa spec.
- Après livraison, Nicolas suit les adresses `/learn` dans la Search Console.
