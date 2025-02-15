---
title: "Starting Redux"
tags: ["javascript", "hard", "front", "react"]
lang: "en"
date: "2018-11-17"
image: ../images/redux.png
category: javascript
---

3 principles in Redux
----


Starting Redux
=====

3 Principles
----

### State tree

* All the state is one single object: the state tree
* You NEVER mutate directly State tree: you must pass an **Action** 
    - keep track of every mutation
* Read-only    

### Actions


* You can't change directly the state tree
    - you need to **dispatch** an **Action**
* Action is a single object with a name and data
    - it MUST have a **type** property
    - it may have additional data
    - represents how to change which data
* Just like a function with parameters


### Reducer

* You modify a state by giving an **Action** and a **Reducer**
* **Action** is a *Interface signature*
    - where state is missing
* **Reducer** is the *method implementation* that changes the state
    - where state is given

### pure function

* A reducer is a pure function
* params are currentState & action (with its own params)
* a reducer returns the new state

### Time travel 

* A given sequence of reducers will always put the app in the same state
* Hot code reload will restart app with the reducer sequence
 
 ### reducer conventions
 
 By convention: 
 
 * If the first state is undefined, return *initialState*
    - and not *previousState* !
    - usually gives a initial value to param
 * If the action is unknown , return *previousState*
    - or not relevant for this reducer
    
### Example

        export function playerFilter(state = '', action = {}) {
          switch (action.type) {
            case SET_PLAYER_FILTER:
              return action.text || '';
            default:
              return state;
          }
        }
        

The Store
---


### Principles

The Store binds the 3 principles:

* holds the state
* lets you dispatch actions
* need to tell the reducers that will change state


        import {createStore} from 'redux'
        const reducer = () => ....
        const store = createStore(reducer);


### API

* Stores the application state
* `store.createStore(reducer)`: Create a store registering reducers 
* `store.getState()`: read current State
* `store.dispatch(ACTION)`: modifies current State
* `store.subscribe(callback)`: react on state modification
    - will print new state on the UI

### Listener

* A store has some `listeners`
* `store.subscribe(listener)` adds a listener to the store


Connect
----

#### react-redux

* `react-redux` is independant from redux
* It helps using redux with react logic
    - but it's not mandatory
        
### Pure components and Container components

* Pure components are describe with pure functions
    - easy unit test
    - most of components
* Container components fetch data and/or change the state
    - higher order component
    - needs usually integration tests
    - fewer components

### Higher Order Component

> A higher-order component is just a **function** that takes an existing component and returns another component that wraps it.

### connect()


[Connect explained](http://www.sohamkamani.com/blog/2017/03/31/react-redux-connect-explained/)


### mappings

        export default connect(
          mapStateToProps,
          mapDispatchToProps
        )(TodoItem)

* We export an higher order component
    - higher than TodoItem
* `mapStateToProps`: how to read the store
* `mapDispatchToProps`: how to change the store

    
Conclusion
---

* Redux is dead-simple
* `connect` is more complex to understand
* Code is much more maintanable
* No need to trace the props flow
* Better performances
    - [No need to  re-renders of middle-level components](https://github.com/reactjs/redux/issues/419#issuecomment-129188175)









