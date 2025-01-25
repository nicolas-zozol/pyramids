---
title: "Quel second langage pour un jeune développeur ?"
tags: ["langages"]
lang: "en"
date: "2020-12-13"
image: ../images/all-langages.png
category: theory
published: false
author: Nicolas Zozol
---

Vous avez travaillé quelques années avec un langage principal que vous maitrisez correctement.
Quel serait le suivant, et pourquoi ? 

---

# Objectifs

Les objectifs pour apprendre un nouveau langages sont nombreux:

- S'ouvrir des portes sur le marché du travail
- Apprendre des nouveaux concepts pour se perfectionner
- Réaliser une application utile: la bonne techno pour le bon outil
- S'amuser

Cet article sera plus orienté sur les deux premiers points. C'est de toute façon difficile
de savoir quel est la techno qu'il vous faut ou ce qui vous amuse. Mais gardez ces deux derniers 
en tête lorsque vous continuerez votre lecture 

## Une note sur Javascript

La plupart des developeurs Backend ou Mobile ont fait du Javascript. Quand je parle d'apprendre
Javascript, je vais plus loin que maintenir une application Angular.

Je parle de savoir faire un `reduce`, renvoyer une fonction, destructurer, comprendre 
 la plateforme Node...   

# Tour d'horizon

## La Java Virtual Machine

La JVM est le moteur de Java et d'autre langages. C'est essentiel de pouvoir travailler
dessus car elle est excellente pour :

* La vitesse: la JVM est super méga rapide
* Le taux d'utilisation
* Les outils pour analyser les performances de la prod

Je déteste la "prod", et je n'y connais rien. Mais si je dois m'en occuper un jour,
je serai rassuré d'être sur la JVM.

La JVM supporte plusieurs langages. Java évidemment, mais aussi Kotlin, Groovy, Scala ou des implémentations
d'autres langages tels que Jython (Python), Clojure(Lisp), JRuby (Ruby), etc...  

### Java

Java est le langage objet le plus utilisé. C'est aussi le langage par défaut de la JVM, et il a donc
 toutes
 les qualités associées.
 
Par rapport aux autres langages, Java a le plus d'outils et une meillleure lecture des stacktrace
. Un bug n'est pas toujours bienvenu. Avec une stacktrace contenant surtout des méta-informations
 générées par Groovy, c'est vite énervant.

![Stacktrace générée par Groovy](./images/stacktrace-groovy)   

Par contre il est assez verbeux pour un langage moderne. Une seule classe par fichier, des getter
/setter qui prennent toute la page... Toutefois depuis Java 11, il y a l'inférence des variables
 ce qui simplifie un peu l'écriture
 
```java
// pre Java 11
List<Merchant> merchants = getMerchants()

// since Java 11 : type is guessed by the compiler, if possible
var merchants = getMerchants()
```

The best tool for coding in Java is Intellij Idea. There is a good free version, but if you work
 on servers or with Javascript, you will probably end up paying more. Eclipse is free and correct, 
 but not as good as IntelliJ. Don't even try VScode java plugins, you will loose precious time.

### Kotlin

Kotlin is one of the modern recent languages, along with Go and Rust. It has been created by
 Jetbrains, authors of IntelliJ. They needed it to make a better IDE, and of course it's a great
  advertisement if you want to code with Kotlin.
   
Kotlin is a great language, but difficultIt's on the
  java platform
 and made 


 


 
















