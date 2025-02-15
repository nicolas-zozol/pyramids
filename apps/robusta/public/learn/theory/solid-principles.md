---
title: "Solid Principles"
tags: ["theory", "hard", "clean-code", "architecture", "java"]
lang: fr
date: "2016-11-07"
image: ../images/javascript.jpg
category: theory
---

Solid principles are important for writing maintainable code.

<!-- end -->

SOLID
=====

Solid Principles
----


* S : Single responsibility principle
* O : Open/Close
* L : Liskov substitution principle
    - Design by Contract
* I : Interface segregation principle
    - Designer ses API par Cohésion Forte
* D : Dependency inversion principle
    - Bien réfléchir à l'*ownership* des association



Open/Close
----

### Full open

        // Using Opened abstractions : Parser, Response
        function string(s) {
            return new Parser((input, index = 0) => {
                if (input.subStreamAt(s.split(''), index)) 
                    return response.accept(s, input, index + s.length, true);
                else {
                    return response.reject(input.location(index), false);
                }
            });
        }        
        export default { char, string ...} // export Char bundle
        

        // Outside module        
        // pseudocode
        assert C.string('Hello').parse('Hello').isAccepted()
                

### Using closed functions

        // refactoring with closed little functions
        const subStream = (length)  => any().occurrence(length);
                
        const subString = (length)=> subStream(length).map((s) => s.join(""));
        
        function string(s) {
            return doTry(subString(s.lenght).filter((r) => r === s));
        }
        
* `string` parle à `substring()` 
* `substring` parle à `substream`
*  Malheureusement... 10x plus lent


Liskov Substitution Principle
----

*objects in a program should be replaceable with instances of their subtypes
 without altering the correctness of that program*



### Violation

        
        User getUser(){ return john;}        
        Premium getPremiumUser(){ return john;}
        void doUserStuff(User u){};
        void doPremiumStuff(Premium u);
        
        // then :        
        Premium john = getPremiumUser();
        work(john);
        function work(User u){        
            if (john.isInstanceOf(Premium)){
                doPremiumStuff( (Premium)u )
            }else{
                doUserStuff(u)
            }
        }
        
### Pourquoi ?
        
* Risques d'erreur
* Risque de devoir faire un *méchant* cast
* Peu de place à l'évolution des différents Users
* Il faut changer la fonction work

### Exemple

        User implements Stuffable{
            doStuff();
        }
        
         Premium extends User{
            override doStuff();
         }
        
        // then
        function work(User u){      
            u.doStuff();
        }


        

### Autre Violation

Liskov aka **Design by Contract**


        class Rectangle (height:int, width:int ){};
        class Square extends Rectangle (){};
        
        Rectangle r = new Square();
        r.height = 5;
        r.height = 6; // !!!!! a square IS a rectangle, but contract is NOT


### Contrats et Domain
        
* User
* Admin extends User
* Premium extends User
* Trois contrats différents
    - Strategies
    - Association plutôt qu'héritage



Dependency inversion principle
----


* Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. 
    - Les deux doivent dépendre d'abstractions.
* Les abstractions ne doivent pas dépendre des détails
    - Les détails doivent dépendre des abstractions.


Il faut donc coder en ayant en tête:

* Qu'est-ce qu'une abstraction ?
* Je code du haut-niveau ou du bas-niveau
    - ou les deux ? (middleware...)
* Qu'est qu'un détail ?

### Abstraction

From Clean Code : *Hiding implementation is about abstractions*

* Une Abstraction est un process qui définit une chose
    - peu importe comment cela est réalisée



### Classic:
        
        class HighLogger{
            
            private $lowLevel;        
            
            function doStuff(){
                return $this->lowLevel->doStuff()
            }
            $this->lowLevel.warn(message)        
        }


### Dependency Inversion

        class HighLevel{
            
            private $openedLogger = OpenedLogger.factory()            
            doStuff(){
                return $this->openedLogger->warn()
            }
        }

        class OpenedLogger{
            
            static factory(){ // or independant class OpenedLoggerFactory
                return new LowLevel();
            }        
            abstract log()
            abstract warn()        
        }

        final class LowLevel extends OpenedLogger{            
            override log()
            abstract warn()        
        }

### Important

* Dependency Injection != Dependency Inversion
* Mais les deux patterns se combinent très bien 




### Conclusions

* Oh non ! Il faut coder !
* Principe d'isolation: *Talk to friends, do not talk to strangers*
    - Loi de Demeter
* Haut niveau et bas niveau ne sont pas amis
    - Il faut passer par une abstraction
* Le couplage n'est pas réduit mais déplacé
    - vers des zones moins réutilisées




TP Logger
----

        
        # Low level lib
        Define Appender : info(), warn(), error()
        Create FileAppender, ConsoleAppender 
        
        # High level client
        Create HighLogger.disaster()
        
        # Create with high coupling
        HighLogger -> Appender 
        
        # Create FacadeLogger interface
            - and FileFacade implementation
        
        
        
        
        
        
        
