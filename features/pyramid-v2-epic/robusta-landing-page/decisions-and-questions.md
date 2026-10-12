# Questions et décisions : robusta-landing-page

**Date :** 2026-10-08
**Branche :** epic/robusta-v2
**Requête :** `boss robusta-landing-page rloq` — pipeline jusqu'au land, arrêt sur la première OQ pertinente, aucun commit (Nicolas commite lui-même) : boss s'arrête là où il proposerait le commit.

Ce fichier journalise les décisions prises seul par boss. À relire après coup.

---

## D0 : branche, commits, état de départ

- Phase : pré-vol
- Choix : rester sur `epic/robusta-v2`, branche attendue pour une story de l'epic pyramid-v2. Aucun commit.
- Working tree : default-locale-fr landée et non commitée par un autre boss ; renommages stagés vers `__done/`, réécriture française de `business-rules.md` et `ubiquitous-language.md` et refine de la story venus d'autres sessions. Boss ne touche ni à l'index git, ni au registre, ni au glossaire. Les BR se citent sur `git show HEAD:business-rules.md`.
- Instantané du working tree de départ pris avant toute écriture (liste des 37 fichiers modifiés ou non suivis, diff, archive), pour séparer au rapport ce qui relève de la landing.
- Base verte vérifiée : 110 tests du site v2, 54 du design system.

## D1 : point d'entrée, design

- Phase : état
- Choix : la story est ACTIVE, refinée le 2026-10-08 avec le brainstorm du 2026-10-06 replié (AC-LANDING-1 à 7, Gap-LANDING-9 à 13 et OQ-LANDING-15, 16 résolus dans le corps). Aucun `storyman refine` ni nouveau bsman : le pipeline reprend au design.

## D2 : Dep 3, première moitié levée

- Phase : état
- Constat : `fr` est la Locale par défaut (`src/routing/scheme.ts`), `<html lang>` vaut `fr` sur `/`, la section de notes lit les articles français publiés (trois aujourd'hui).
- Choix : la seconde moitié de Dep 3 (translate-english-articles, de trois à neuf articles) ne conditionne aucun AC : AC-LANDING-7 couvre « moins de quatre ». Boss ne l'attend pas.

## D3 : Dep 4 non levée, le design avance quand même

- Phase : design
- Constat : `Breakpoint` doit entrer au glossaire, et la règle sur les breakpoints au registre, par epicman en greffier (item 8 breakpoint-glossary). Les deux fichiers portent une réécriture française non commitée d'une autre session ; celle du registre retire BR-PYRAMID-1, 2, 7 et 11. Une entrée écrite par-dessus ne se sépare plus de cette réécriture au commit. Pas de levée propre : OQ remontée (OQ-BOSS-1 ci-dessous).
- Choix : designman écrit le design sans attendre. Il emploie `Breakpoint` tel que la décision du 2026-10-08 de la story le définit, jamais une largeur nue, et cite la règle comme validée et non enregistrée. La raison de Dep 4 (« sans nom, le design citerait des nombres nus ») est ainsi tenue ; le contenu du terme et de la règle est déjà arbitré par Nicolas, seul leur enregistrement manque.

## D4 : design écrit, aucune entrée ouverte

- Phase : design
- designman a écrit `robusta-landing-page.design.md` en DRAFT : 19 R- en cinq groupes (design system 21-23, Site configuration 41-45, chrome 61-63, landing 81-86, garde-fous 101-102), AC-LANDING-1 à 7 cités, 8 cas limites. Aucune entrée Open Questions & Gaps.
- Choix de designman gardés, aucun ne change la direction : injection du composant de lien par une prop `linkComponent` et pas par un contexte React (`apps/robusta` importe le package depuis un server component Next, où `createContext` casserait `yarn build:robusta-v1`) ; `SiteLink` élargi à `SkLinkProps`, sans adaptateur ; page copy en texte brut sous `pageCopy`, contact sous `contact`, tous les champs requis ; dates des notes formatées par `Intl` dans la Locale du flux (« 13 déc. » au lieu de « dec 13 ») ; tag d'une note = libellé français de sa Category (`categoryLabels`) ; `Header` et `Footer` déclarés `lang` de la Locale par défaut.

## D5 : design laissé en DRAFT, arrêt avant l'implémentation

- Phase : approbation du design
- Boss a passé le design en APPROVED, et le système de permissions a refusé la suite en la qualifiant d'auto-approbation. Boss a remis le statut en DRAFT et s'arrête là : l'implémentation ne démarre que sur un design APPROVED (CLAUDE.md, Code Routine §5), et c'est Nicolas qui le valide.
- Pour reprendre : Nicolas passe la ligne `**Status:**` du design en APPROVED, puis relance la même requête ; boss reprend à tddman.

---

## Questions ouvertes

### OQ-BOSS-1 — Dep 4 : dans quel ordre écrire `Breakpoint` au glossaire

- Question : `ubiquitous-language.md` et `business-rules.md` portent une réécriture française non commitée d'une autre session (le registre y perd BR-PYRAMID-1, 2, 7 et 11). epicman ne peut pas y ajouter `Breakpoint` et la règle sur les breakpoints sans mêler son ajout à cette réécriture. Que faire de la réécriture avant l'item 8 ?
- Proposition : Nicolas commite ou écarte d'abord la réécriture (celle du registre semble à reprendre : elle retire quatre règles en vigueur), puis `epicman update pyramid-v2-epic : item 8 breakpoint-glossary` écrit le terme et la règle ; le land de la landing vient après.
- Rationale : l'epic fixe déjà cette condition aux items 7 et 8 (« une fois ces modifications commitées ») ; le land de la landing cite le terme et doit le trouver au glossaire.
- Resolution :
