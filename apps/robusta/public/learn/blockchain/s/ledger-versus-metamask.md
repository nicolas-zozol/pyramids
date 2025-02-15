---
title: "Ledger versus Metamask"
tags: ["blockchain", "security"]
lang: "en"
date: "2021-01-20"
image: ./images/ledger-vs-metamask.png
category: blockchain
author: Nicolas Zozol
featured: true
---

Thought Metamask is the standard application to discover the real web3, 
 there is a major security issue that could destroy all your funds. Ledger resolves this.

-----


Note: This is not an advertisement to Ledger, nor a paid article. You can replace Ledger by [Trezor](https://trezor.io/).

## Steps of crypto discovery

The first step of discovering cryptocurrencies is to buy some on a centralized exchange like Binance or Kraken.
But you will understand the power of the blockchain only when you will have some tokens in a wallet like Metamask. 
If you still didn’t do it, try it !

## Dangers for your filesystem

If you have a good amount of money, then it’s time to have a hard wallet. Why ?

If an attacker has access to the filesystem of Metamask, then he will get your private keys and you will loose all your funds ☠️.

I often say that the web is the safest place, and that you don’t need an antivirus. If you don’t do anything stupid, you are probably ok.

Well, that’s not totally true. First you may be more stupid than me 😁 and I was once stupid enough to give my credit card number to a fishing web page. 

If you are a coder or if you use a professional tool, a vicious plugin or an open source dependency can have an extended access to the filesystem. This happens sometimes when an open source developer gives its project to a nice contributor. This gentle contributor is the attacker. He will create an vicious update, and you will trust it.

It’s also possible for a chrome extension to [read your filesystem](https://stackoverflow.com/a/44948662/968988). Do you know all the permissions of your chrome extensions ?

For example permissions for my VPN extension are quite generous :

![VPN permissions](content/blog/blockchain/images/vpn.png)

### The right protection : Moving to Ledger

If your file system is exploited, private keys in Metamask will be stolen and your assets gone.

There are two major benefits of using Ledger :

- It keeps your private key away from Internet
- There is a very very low surface of attack, which is very important

Through the last few years, Ledger had [some minor security problems](https://donjon.ledger.com/lsb/) only. Some would say that it’s so uncomfortable that it reduces attacks because you won’t use much of the DeFi capabilities. That’s not totally false.

### When will you use Ledger ?

Keep Metamask as a purse for daily stuff, experiments, and Ledger account for your mid-long term savings. You don’t want to touch the Ledger too much because it needs some boring clicks on the device. 

For example I use Metamask for my 400% APY farming on Elrond that I harvest almost daily. I farm on my Ledger account a stronger amount on 20% USDC/USDT that I can harvest quarterly. I have also put on Ledger my [Index Coop ETFs](https://www.indexcoop.com/dpi.html) and [StakeDAO](https://app.stakedao.org/0x452c075125F04582771C0A420B80218894754991/strategies) native tokens - there is only to wait. 

![DeFi Pulse Index](content/blog/blockchain/images/dpi.png)

### Ledger with Metamask and DeFi

Metamask was not designed for DeFi, but for receiving and storing native tokens. Before interacting with smart contracts, you have to allow Blind Signing for each tokens you play with.

![Blind signing](content/blog/blockchain/images/blind-signing.png)

This must be done again each time there is an update 😐.

Also there is a real annoying **problem with other EVM**, such as Polygon or Celo. You can’t see your assets if you have not linked your Ledger with Metamask

![Connect hardware wallet](content/blog/blockchain/images/connect-hardware-waller.png)

Ledger will give you the same address for all EVM link chains, such as Ethereum, Polygon, Fantom, Celo, Avalanche... But as early 2022, you will only see tokens on Ethereum chain.

![on ethereum chain](content/blog/blockchain/images/ethereum-chain.png)

That’s not good ! It’s on ethereum chain.

The documentation is really not good, and you can find on YouTube some tutorial [sending matics](https://youtu.be/TaFjuk1rQa0?t=148) on Ethereum chain for 20$ transaction 😕

What you must do is **connect your Ledger as an hardware wallet to a regular Metamask**. This will give you another account on Metamask with your Ledger address. Then on Metamask, you can easily switch to Polygon and see your money on the Ledger account.

![connection](content/blog/blockchain/images/connection.png)

### Next step : Put your Ledger in a bank

If you have 20k$+ in your ledger, please give us all some security and put your Ledger in a bank. Some [brutal kidnapping](https://coconuts.co/hongkong/news/crypto-trader-kidnapped-beat-by-gang-demanding-hk30-million-ransom/) have been reported here and there and we don’t want this to be common. Let them know there is not much to earn. 

My personal rule is to have less than 5k$ in Metamask. If it goes up, I send it to the bank.

A bank chest cost around 100$ a year. It will be even less easy to use your Ledger, but for most of your long term asset, it should be ok.

With the magic of smart contracts with proxys, the ledger account could farm, and benefits can go to the Metamask account. This is still to be developed but it will surely come soon 😊