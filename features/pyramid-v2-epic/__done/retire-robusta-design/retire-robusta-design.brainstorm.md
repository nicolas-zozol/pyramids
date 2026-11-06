# Brainstorm : Retirer le prototype v0 `apps/robusta-design`

**Date :** 2026-11-06
**Participants :** bsman (autonomous)
**Source :** [retire-robusta-design.story.md](retire-robusta-design.story.md)
**Infix :** RETIREDESIGN

> **Note:** All axes completed autonomously by bsman. Decisions are flagged with **Décision (autonome):** for review.

Le brainstorm suit la Proposition d'OQ-RETIREDESIGN-1 de la story, encore ouverte : tout le dossier est supprimé, brief compris. Il suit aussi OQ-RETIREDESIGN-2, signée `lgtm (storyman)` : le test de la règle de build Netlify prend `apps/intel-demo` comme exemple de dossier sans manifeste.

## Ce que le code dit

Relevé du 2026-11-06 sur `epic/robusta-v2` (6571829), hors `__done/` :

- Fichiers suivis : les onze de la story ; le `.DS_Store` n'est pas suivi (`.gitignore`, ligne 33).
- Mentions de `apps/robusta-design` : `CLAUDE.md` (ligne 22), `root.archi.md` (lignes 30, 58 et 110), `ROADMAP.md` (item 10), `pyramid-v2.epic.md` (À faire, ligne 241, et une décision datée du 2026-10-31), `apps/robusta-build/scripts/netlify-ignore.spec.ts` (lignes 98 et 132). Aucun README, aucun fichier de `.claude/`, aucun `package.json`.
- Configurations sans effet : le glob `apps/*` des workspaces ignore un dossier sans `package.json` ; `.eslintignore` ne le nomme pas et `yarn lint` ne lit que `packages/**/src` ; pas de `.prettierignore` ; pas de `tsconfig.json` racine ; `netlify.toml` ne le nomme pas.
- Règle `ignore` de Netlify : `netlify-ignore.mjs` lit les arbres git, ne surveille que le site, les modules qu'il atteint et les fichiers d'install racine. Un commit qui ne toucherait que `apps/robusta-design` donne `skip` ; celui de la livraison touche aussi `apps/robusta-build/scripts`, donc `build`. La production construit toujours.
- `packages/robusta-design-system/ui_kits/marketing/tweaks-panel.jsx` porte le même nom qu'un fichier de la v0, mais c'est une copie propre au design system, chargée par un chemin relatif à son dossier. Rien ne change de ce côté.
- Dernier commit qui modifie le dossier : d58e879 (« add Claude design system »), déjà sur `main`. `git diff d58e879 HEAD -- apps/robusta-design` est vide : son arbre porte le dossier tel qu'il sera supprimé.

## Acceptance Criteria challenge

- AC-RETIREDESIGN-1 : testable et suffisant. Netlify installe avec `--immutable` (`YARN_FLAGS` de `netlify.toml`) : la vérification gagne à rejouer ce drapeau, qui échoue si `yarn.lock` bouge.
  - Proposé à storyman : Given le dépôt après la livraison, When on lance `yarn install --immutable`, Then l'install réussit et `yarn.lock` est inchangé.
- AC-RETIREDESIGN-2 : testable par recherche, mais son périmètre est flou. `ROADMAP.md` et l'À faire de l'epic nomment aussi le dossier ; `storyman submit` les retire (skill `roadmap`, `epicman update`). Le journal de l'epic, la story livrée, ce brainstorm et le design doc le nomment forcément, hors de `__done/`.
  - Proposé à storyman : Given la livraison soumise, When on cherche `apps/robusta-design` dans `CLAUDE.md`, `root.archi.md`, les README, `ROADMAP.md` et l'À faire de l'epic, Then rien ne le nomme ; le journal daté de l'epic et les documents Compound de cette feature gardent leurs mentions.
- AC-RETIREDESIGN-3 : testable, mais fragile. Le dernier commit qui porte le dossier, parent du commit de suppression, vit sur `epic/robusta-v2` : un squash ou un rebase à la fusion le fait disparaître de `main`. d58e879 porte le même contenu et est déjà sur `main`.
  - Proposé à storyman : Given l'epic fusionnée dans `main` par squash ou rebase, When un lecteur lance depuis `main` `git show d58e879:apps/robusta-design/prompt.md`, Then le brief s'affiche ; la story livrée cite d58e879.
- AC-RETIREDESIGN-4 : non testable tel qu'écrit (« Given les cas limites, When on les rejoue ») et porte trois vérifications. À découper.
  - Proposé à storyman : Given le diff de la livraison, When on liste ses fichiers, Then aucun n'est sous `packages/robusta-design-system` ni sous `apps/robusta-build/src`.
  - Proposé à storyman : Given la suite de tests du site, When on lance `yarn workspace @robusta/robusta-build run test`, Then elle est verte et un changement sous `apps/intel-demo`, dossier sans manifeste, donne toujours `skip`.
  - Proposé à storyman : Given le checkout local avec son `.DS_Store` non suivi, When la suppression est faite, Then `apps/robusta-design` n'existe plus sur le disque. Un `git rm -r` seul laisse le dossier avec son `.DS_Store`.

Cas limite écarté : un autre clone garde après `git pull` un `apps/robusta-design/` réduit à son `.DS_Store`. Sans effet : yarn ignore un dossier sans `package.json`, la règle Netlify lit git.

Business Rules : aucune créée ni modifiée. AC-RETIREDESIGN-1 rejoue BR-PYRAMID-5.

---

## 1. Product Role

Une suppression de dossier mort et la mise à jour de la documentation qui le décrit. Ce n'est ni une refonte du design system, ni un archivage dans le dépôt, ni une reprise du contenu biographique du brief.

**Décision (autonome):** suppression complète, sans copie ni déplacement.

**Rationale:** git garde le dossier, d58e879 le rend en une commande.

---

## 2. Target Audience

Le mainteneur du dépôt, et les agents Compound qui lisent `CLAUDE.md` et `root.archi.md` pour se repérer. Aucun visiteur du site n'est concerné.

**Décision (autonome):** aucun autre public.

**Rationale:** rien de servi par Netlify ou Vercel ne dépend du dossier.

---

## 3. Core Problem

**Problème :** la documentation décrit un prototype dont la direction visuelle est abandonnée, et un agent qui lit `CLAUDE.md` peut le prendre pour une référence de design.

**Décision (autonome):** retirer le dossier et toutes ses mentions en vigueur, en une livraison.

**Rationale:** retirer l'un sans l'autre laisse soit un lien mort, soit un dossier non documenté.

---

## 4. Unique Value Proposition

Le dépôt ne décrit plus que ce qui existe ; le design system reste la seule source de design de v2 (BR-PYRAMID-6).

**Décision (autonome):** pas d'alternative retenue.

**Rationale:** garder le dossier « pour mémoire » duplique ce que git fait déjà.

---

## 5. Functional Scope

Dedans :

- suppression des onze fichiers suivis et du dossier sur le disque, `.DS_Store` compris ;
- fixture du test `netlify-ignore.spec.ts` déplacée vers `apps/intel-demo` (OQ-RETIREDESIGN-2) ;
- `CLAUDE.md` et les trois mentions de `root.archi.md` ;
- `ROADMAP.md` et l'epic, par `storyman submit`.

Dehors :

- le journal daté de l'epic et les documents sous `__done/`, historiques ;
- `apps/intel-demo` et `services/scribe-intel-backend`, autres dossiers sans manifeste ;
- `apps/robusta` et son `resume.html`, du ressort de retire-robusta-v1.

**Décision (autonome):** ce périmètre.

**Rationale:** c'est la liste complète des mentions relevées, sans rien de plus.

---

## 6. Core Features

### Feature : Suppression du dossier

**Capability :** `apps/robusta-design` n'existe plus, ni dans git ni sur le disque du checkout.

**Acceptance Criteria :** AC-RETIREDESIGN-1, AC-RETIREDESIGN-4 (story)
- Proposé à storyman : `yarn install --immutable` et le dossier absent du disque (voir le challenge).

**Test Approach :** `git ls-files apps/robusta-design` vide, `test ! -e apps/robusta-design`, puis le green set (BR-PYRAMID-5) avec `yarn install --immutable` et `yarn build:robusta`.

---

### Feature : Fixture du test de la règle Netlify

**Capability :** le cas « a directory without manifest » prend `apps/intel-demo`, dossier réel sans `package.json` à sa racine.

**Acceptance Criteria :** AC-RETIREDESIGN-4 (story)
- Proposé à storyman : le cas garde le verdict `skip` (voir le challenge).

**Test Approach :** `yarn workspace @robusta/robusta-build run test`, vitest ; le nombre de dossiers surveillés du premier test reste 2.

---

### Feature : Documentation en vigueur

**Capability :** `CLAUDE.md` et `root.archi.md` ne nomment plus le dossier ; la story livrée cite d58e879.

**Acceptance Criteria :** AC-RETIREDESIGN-2, AC-RETIREDESIGN-3 (story)
- Proposé à storyman : périmètre élargi à `ROADMAP.md` et à l'À faire de l'epic, et citation de d58e879 (voir le challenge).

**Test Approach :** `git grep -P "robusta-design(?!-system)"` hors `__done/`, dont les seules lignes restantes sont le journal de l'epic et les documents de la feature ; `git show d58e879:apps/robusta-design/prompt.md` depuis `main`.

---

## 7. Critical Edge Cases

- La fusion de l'epic par squash ou rebase : traitée par la citation de d58e879 (AC-RETIREDESIGN-3).
- Le `.DS_Store` non suivi : `git rm -r` laisse le dossier sur le disque (AC-RETIREDESIGN-4).
- Une recherche du nom qui attrape `robusta-design-system` : la vérification exclut ce suffixe.
- `tweaks-panel.jsx` du design system : homonyme, indépendant, intact.

**Décision (autonome):** ces quatre cas, proposés à storyman dans le challenge.

**Rationale:** ce sont les seuls où la livraison peut échouer ou être mal vérifiée.

---

## 8. Non-Functional Constraints

Aucun coût, aucune donnée, aucune performance en jeu. Seule contrainte : le green set reste vert (BR-PYRAMID-5), et le lockfile ne bouge pas sous `--immutable`.

**Décision (autonome):** aucune contrainte ajoutée.

**Rationale:** le dossier n'entre dans aucune build.

---

## 9. External Dependencies

Netlify seulement, par sa règle `ignore` : le commit de livraison touche `apps/robusta-build/scripts`, un branch deploy le construit donc ; la production construit toujours. Vercel (v1, dakar) ne lit pas le dossier.

**Décision (autonome):** aucune action sur Netlify ni Vercel.

**Rationale:** aucun des deux ne référence le chemin.

---

## 10. Major Risks

- Perte du brief, seul endroit v2 où figurent le parcours et Masala Parser : faible, git le garde (OQ-RETIREDESIGN-1 de la story).
- Lien de restauration mort après un squash : levé par d58e879.
- Mention oubliée : faible, la recherche du chemin est exhaustive et rejouable.

**Décision (autonome):** aucun risque bloquant.

**Rationale:** chaque risque a sa parade dans les AC proposés.

---

## 11. Boundaries

Aucune API nouvelle ni modifiée. `apps/robusta-design` n'est ni une app ni un module au sens du dépôt : pas de manifeste, aucune dépendance entrante ni sortante. Le graphe des workspaces yarn ne change pas. La fixture de `netlify-ignore.spec.ts` est du code interne du package `scripts` de l'app `robusta-build`, hors de toute API.

**Décision (autonome):** aucun bloc Boundaries.

**Rationale:** le skill `boundaries` ne liste que les API nouvelles ou modifiées.

---

## Next Steps

- `storyman update retire-robusta-design avec brainstorm` : reprendre les AC proposés (AC-1 `--immutable`, périmètre d'AC-2, d58e879 dans AC-3, découpage d'AC-4).
- OQ-RETIREDESIGN-1 reste à trancher dans la story ; ce brainstorm suit sa Proposition.
- `designman` : le design doc peut partir de ce brainstorm sans attendre l'update.
