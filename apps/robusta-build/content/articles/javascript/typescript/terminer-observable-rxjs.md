---
title: 'Terminer un Observable RxJS avec un autre'
tags: ['javascript', 'rxjs', 'back', 'front']
locale: 'fr'
date: '2021-05-23'
image: ../images/stop.png
category: typescript
published: false
author: Nicolas Zozol
featured: true
translationId: completes-with
---

Comment terminer un observable quand un autre se termine ?

---

## Quand utiliser RxJS ?

Je travaille sur des données temps réel en ce moment, et je commence à être plutôt bon en **RxJS**.
J'ai pesté pendant des années contre RxJS parce qu'il était livré avec Angular, et
je ne vois pas l'intérêt d'utiliser un Observable pour une requête REST, quand une **Promise** fait
parfaitement l'affaire.

De plus, l'API de RxJS évoluait vite, ce qui agaçait quand on ne suivait pas
ce projet de près.

Avec des données temps réel, c'est une autre histoire. RxJS excelle, et son
intégration avec **Typescript** est parfaite.

## Terminer un observable

RxJS inclut de nombreux opérateurs, et au fil du temps certains ont été retirés pour limiter
la surface de l'API, ce qui est une bonne chose. Écrire son propre opérateur est très facile :
si votre code utilise souvent une même combinaison d'opérateurs avec une logique récurrente,
n'hésitez pas à la factoriser dans votre **opérateur personnalisé**.

Dans mon projet, j'ai souvent besoin de terminer un `Observable` quand un autre se termine. Les
deux finissent alors en même temps. J'ai d'abord supposé que le cas était courant et qu'un
opérateur existait donc déjà, mais `takeUntil(other$)` termine votre observable
quand `other$` démarre.

Terminer un `Subject` est facile aussi, avec `subject.completes()`, mais je préfère
travailler avec des observables.

## Mon opérateur personnalisé

Je veux que mon `stream$` se termine avec le flux `other$`. Je souhaite l'utiliser ainsi :

```typescript
stream$.pipe(completeWith(other$));
```

Ma fonction `completesWith` tient en 4 lignes de code :

```typescript
export const completesWith =
  (other$: Observable<any>) => (o: Observable<number>) => {
    const terminator$ = new Subject();
    other$.subscribe().add(() => {
      terminator$.next('terminate');
    });
    return o.pipe(takeUntil(terminator$));
  };
```

Quand other$ se termine, un Subject terminator$ émet une valeur quelconque, et grâce à
takeUntil, notre observable se termine à son tour.

## Remplacer le Subject par un Observable

Comme je le disais, je préfère éviter les Subjects. La façon dont les Subjects stockent leurs listeners peut provoquer
des fuites mémoire. Le style fonctionnel offre bien plus de garanties.

```typescript
export const completesWith =
  (end$: Observable<any>) => (o: Observable<number>) => {
    const terminator$ = new Observable((subscriber) => {
      end$.subscribe().add(() => {
        // Will officially start the observable
        subscriber.next('FUNCTIONAL terminate');
      });
    });

    return o.pipe(takeUntil(terminator$));
  };
```

C'est plus un exercice qu'une réalité, car mon projet est plein de Subjects, mais ce sont toujours des objets privés,
aux pouvoirs très limités. Je les utilise simplement parce que c'est pratique et plus lisible. Bien qu'un peu dangereux...

Si vous ne pouvez pas remplacer votre `Subject` par un `Observable`, le mal est probablement déjà fait. Votre Subject
est peut-être lié à d'autres objets, avec une complexité qui met votre mémoire en danger.
