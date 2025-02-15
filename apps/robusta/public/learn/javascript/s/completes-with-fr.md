---
title: "Completing a RxJs Observable with another"
tags: ["javascript", "rxjs", "back", "front"]
lang: "fr"
enVersion: "/javascript/completing-a-rxjs-observable-with-another"
date: "2021-08-23"
image: ./images/stop.png
category: javascript
author: Nicolas Zozol
---

How to complete an observable when the other completes ?

---

When to use RxJs ?
----

I'm working on real time data these days, and now I'm getting pretty good with **RxJS**.
I have ranted many years against RxJS because it was packed with Angular, and
I don't see the point of using an Observable for a rest request, when a **Promise** is
perfect for that.

Moreover, RxJs api was moving fast, causing displeasure when you don't follow that much this
project.

When dealing with real time data, it's another story. RxJs nails it, and its
integration with **Typescript** is perfect.


Completing an observable
----

There are many operators included with RxJs, and over the time, they removed some to limit
the api surface, which is good. It's very easy to make your own operator,
so if your code often use a certain combination of operators with recurrent logic,
don't hesitate to factorize your code with your **customized operator**.

In my project, I often need to terminate an `Observable` when another finish. They
both finish at the same time. I first supposed that this is common and therefore an
operator already exists, but `takeUntil(other$)` terminates your observable
when the `other$` starts.

It's also easy to complete a `Subject`, with `subject.completes()`, but I prefer to
work with observables.


My customized operator
----

I want my `stream$` to complete with `other$` stream. I wish to use it like this:

```typescript
stream$.pipe(completeWith(other$))
```

My `completesWith` function uses 4 lines of code:

```typescript
export const completesWith = (other$: Observable<any>) => (o: Observable<number>) => {
  const terminator$ = new Subject()
  other$.subscribe().add(() => {
    terminator$.next('terminate')
  })
  return o.pipe(takeUntil(terminator$))
}
```

When other$ completes, a terminator$ Subject will emit any value, and using
takeUntil, it will then complete our observable.

Replace Subject by an Observable
-----

As I said before, I prefer to avoid Subjects. The way Subjects store listeners could provoke
memory leaks. Functional style has much more guarantees.

```typescript
export const completesWith = (end$: Observable<any>) => (o: Observable<number>) => {
  const terminator$ = new Observable(subscriber => {
    end$.subscribe().add(() => {
      // Will officially start the observable
      subscriber.next('FUNCTIONAL terminate')
    })
  })

  return o.pipe(takeUntil(terminator$))
}
```

This is more an exercise than a reality, as my project is full of Subjects, but they are always private object,
with very limited power. I just use them because it's convenient, more readable. Thought a bit dangerous...

If you can't replace your `Subject` by an `Observable`, probably harm is already done. Your Subject
may be linked to other objects, with complexity that puts your memory at risk. 
