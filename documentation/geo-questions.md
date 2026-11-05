# Questions GEO — robusta.build

Les questions qu'un acheteur de RB Compound pose à ChatGPT, Perplexity, Gemini ou Claude, le format d'article que ces moteurs citent pour chacune, et l'article du site qui y répond. Tenu par le skill `geo-article` (mode `questions`).

Client visé, d'après la Site configuration (`apps/robusta-build/src/seopyramids.config.ts`) : « les équipes et les responsables techniques qui construisent du logiciel avec des agents ». RB Compound existe en deux versions : une version open source et gratuite, pas encore publiée, avec trois agents, epicman, storyman et designman ; une version complète, livrée seulement avec un accompagnement payant de l'équipe. L'expérience que montrent les articles repose sur le workflow Compound, qui a construit robusta.build v2, et sur les stories livrées de l'epic pyramid-v2.

Format d'une entrée : question — type, format — article — verdict.

## RB Compound

Chaque question tient en deux entrées, l'anglaise puis la française.

- « What is spec-driven development with AI coding agents? » — définition, guide — aucun — à écrire
- « Qu'est-ce que le spec-driven development avec des agents IA de codage ? » — définition, guide — aucun — à écrire
- « What are the best practices to build software with AI agents in a team? » — meilleur, listicle — aucun — à écrire
- « Quelles sont les meilleures pratiques pour développer un logiciel en équipe avec des agents IA ? » — meilleur, listicle — aucun — à écrire
- « Test-first or code-first with AI coding agents? » — versus, comparatif — aucun — à écrire
- « Écrire les tests d'abord ou le code d'abord avec des agents IA de codage ? » — versus, comparatif — aucun — à écrire
- « What are the alternatives to vibe coding for a software team? » — alternatives, listicle — aucun — à écrire
- « Quelles alternatives au vibe coding pour une équipe de développement ? » — alternatives, listicle — aucun — à écrire
- « How to make Claude Code write the tests before the code? » — comment, guide — aucun — à écrire ; attend extract-compound-plugin
- « Comment faire écrire les tests avant le code à Claude Code ? » — comment, guide — aucun — à écrire ; attend extract-compound-plugin
- « How to get a development team started with AI coding agents? » — comment, guide — aucun — à écrire
- « Comment démarrer une équipe de développement avec des agents IA de codage ? » — comment, guide — aucun — à écrire

## PME

Les questions des dirigeants de PME qu'un article du site, publié ou en brouillon, couvre déjà.

- « Agence web ou développeur freelance : que choisir pour une PME ? » — versus, comparatif — web/agence-web-ou-freelance.md — brouillon, non publié ; attend les tarifs de Nicolas, une anecdote réelle et une couverture
- « Quelles alternatives à Gmail pour une entreprise ? » — alternatives, listicle — privacy/quitter-gmail.md — à auditer

## Articles publiés sans question

Ils restent publiés et ne répondent à aucune question du registre. Une paire de traductions compte pour un article, nommé par son fichier français.

- bien-appliquer-classname-styled-components
- terminer-observable-rxjs
- pourquoi-migration-gatsby-next-js
- quel-second-langage
- domotique-facile-avec-sonoff
- ledger-contre-metamask — à auditer
- outillage-solidity — à réécrire : l'article recommande Truffle et Ganache, abandonnés par Consensys en 2023
- yield-farming-fr — à auditer

## Contrôle mensuel

Aucun contrôle n'est enregistré. Le contrôle est ouvert depuis le merge de `epic/robusta-v2` sur `main` : la build de production sert ses pages indexables depuis le 2026-11-05. Format d'un contrôle : la date, puis pour chaque question les moteurs qui citent robusta.build et les pages qu'ils citent à la place.
