---
title: "Hyperledger Blockchain"
tags: ["blockchain", "hard", "back", "architecture"]
lang: "en"
date: "2018-11-07"
author: "Nicolas Zozol"
image: ../images/javascript.jpg
category: blockchain
---

HyperLedger, powered by IBM, is a set of tools for creating your own blockchain.

<!-- end -->

Code
===

* model
    - namespace
    - participant
    - asset
    - concept
    - event
    - query
* lib/logic.js


Test and learn
=====


generate .bna file

Customize `npm run prepublish`

        "seeds": "mkdirp ./dist && composer archive \
                create  --sourceType dir --sourceName . 
                -a ./dist/seeds.bna",
                
                

Use composer-playground ; deploy seeds.bna                

        # execute fabric script
        ./fabric-tools/startFabric.sh
        
        # Go to http://composer-playground.mybluemix.net/
                
Runtime
====

Create a top PeerAdminCard

        ./fabric-tools/createPeerAdminCard.sh
        composer card list  #PeerAdmin@hlfv1
        
        cd ~/.composer/cards/
        # check there is PeerAdmin@hlfv1 directory
        # with credentials and private key inside
        

Create a runtime

        # composer runtime with card and network name
        # OLD: composer runtime install -c PeerAdmin@hlfv1 -n seeds
        
        composer network install -c PeerAdmin@hlfv1 -a dist/seeds.bna


!info : in case of trouble, stop the fabric, tearDown, and restart        
            
     
    
        # Get some informations
        composer archive list -a dist/seeds.bna
        # > Identifier:seed-network@0.2.6
        # > Name:seed-network
        # > Version:0.2.6

        # Create a network and a certificate for accessing
        composer network start \
            -c PeerAdmin@hlfv1 -n seed-network -V 0.2.6 \
            -A nicolas -S password -f robusta.card 
                
        # ... Pretty long !
        # >Successfully created business network card:
        # >	Filename: robusta.card
        
        cat robusta.card
        # > display the card on this directory
        
Importer robusta dans le network
        
        composer card list
        # shows only PeerAdmin@hlfv1
        
        
        composer card import -f robusta.card 
        # > Successfully imported business network card
        # > Card file: robusta.card
        # > Card name: nicolas@seed-network


Now we have access

        composer network ping -c nicolas@seed-network -v 0.2.6
        # > v0.20.0















                
