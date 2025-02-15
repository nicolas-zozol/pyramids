---
title: "Javascript Build"
tags: ["javascript", "hard", "back", "front"]
lang: "fr"
date: "2018-05-07"
image: ../images/javascript.jpg
category: javascript
---

Javascript Build is a pack of technologies working together to make your code available as a product

---

Javascript Build
=====

Objectifs
-----

* Gestion des dépendances : jQuery, angular...
* Eviter l'import de 50 `<script>` dans une page
    - performance
    - ordre des scripts
* Faire des opérations courantes
    - déplacer des fichiers
    - concaténer, minifer
* Résoudre plusieurs problèmes courants
    - Transpiler sass, coffeescript, typescript, haml
    - chargement de template
    - Linters, lancement de tests
    


Node JS
----

* Execute du code Javascript
	- node myFile.js
	- utilise V8
* Créer un serveur d'application
	- Node
	- Connect : serveur
	- Express :framework
	- Mongoose : ORM
	- MongoDB

Gestion des dépendances
---

#### NPM 

* NodeJS est packagé avec NPM
* Necessite un fichier `package.json`
* NPM gère des modules de type CommonJS
	- `npm install myModule`
	- `require("myModule")`
* NPM regroupe les dépendances d'un projet dans `package.json`
	- `npm install --save myModule`

### Bower

* NPM gère les dépendances du serveur
* Creation d'un fichier `bower.json` equivalent
* Bower gère les dépendances du navigateuur
    - jamais du server node
* Obsolète aujourd'hui

### Graphe de dépendance

Les outils moderne :

- Construisent un graphe des libs utilisées
- Piochent dans `package.json`


        // Building a graph with JS or Html
        var userModule = require('./user-module');
        var template = require('./customer-optional-template.html');
        
        function DisplayUserModule(){
            // Module code
        }
        
        //Creating a module for current file
        module.exports = DisplayUserModule;




L'ecosystème
---


#### Modules


* AMD : RequireJS ; obsolète
* CommonJS : NodeJS, Browserify sur browser
* ES 2015
* SystemJS : AMD + CommonJS + ES 2015
* ES2015 est disponible sur Node JS 4
    - Common JS tend aussi à être obsolète
    
    
### Exemple de modules : Common JS


Création du premier module :

        // salute.js
        var MySalute = "Hello";
        module.exports = MySalute;
        
Création d'un deuxième module appelant le premier :
        
        // world.js
        var MySalute = require("./salute");
        var Result = MySalute + " world!";
        module.exports = Result;

!info : Utilisation de mots *non-clés* `module` et `exports`
 
### Exemple de modules : ES 2015



Création du premier module :

        // salute.js
        var MySalute = "Hello";
        // 'default' means we export only one object
        export default MySalute;
        
Création d'un deuxième module appelant le premier :
        
        // world.js
        import MySalute from './salute';
        var Result = MySalute + " world!";
        var OtherResult = MySalute + " guy!";
        export Result;
        export OtherResult;

### Transpilers

* CoffeeScript : mode Ruby ; précureur
* TypedScript : 
    - typé, proche de Java
    - Surcouche de ES2015 (dont les modules)
* Sass, Less : 
    - Simplifie les CSS : variables, nesting
    - Sass est top pour le responsive
    
Build
----

* Grunt / Gulp : automatise les tâches (tranpile, minification, tests)
    - grunt : declaratif (json)
    - gulp : pure code javascript
* Webpack : Alternative à gulp + browserify
* JSPM + SystemJS : Alternative à npm + gulp + browerify


### exemple Gulp

        // gulpfile.js
        var gulp = require('gulp');
        var tsify =  require('tsify'); //... need all npm dev-dependencies
        
        function bundle() {
            browserify({debug:true})
                    .transform(stringify, {
                        appliesTo: { includeExtensions: ['.hjs', '.html', '.txt'] }
                    })
                    .add('index.ts')
                    .plugin(tsify)
                    .bundle()
                    .on('error', function (error) { console.error(error.toString()); })
                    .pipe(exorcist('./dist/app-build.js.map'))
                    .pipe(vinylSourceStream('./dist/app-build.js'))
                    .pipe(gulp.dest('./'));
        }
        gulp.task('by', bundle);
        
        
Execute : `$> gulp by   
            

Autres outils
----

* Jasmine, Karma : outils de tests unitaires automatique
* Selenium, Protractor : tests d'intégration
* PhoneGap : HTML5 sur mobile
* JS Lint & JS Hint : Equivalent de checkstyle
