---
title: "The source of Yield Farming profits"
tags: ["blockchain", "DeFi"]
lang: "fr"
date: "2021-11-30"
image: ./images/aave-small.png
category: blockchain
author: Nicolas Zozol
featured: true
---

The Blockchain is not just a Ponzi scheme. This article explains where the money that fuels DeFi actually comes from.

---

This article provides information, not financial advice. Only invest your *fun money*: the amount you can afford to lose without worry!

# Yield Farming in cryptocurrencies: where does the “magical DeFi money” come from?

Yield farming is a process that aims to generate more assets from an initial portfolio. This process can use very aggressive strategies or more passive ones.

Why call it *Yield Farming*? In my vegetable garden, I can combine plants, rotate crops, replant, or simply throw seeds around.

Yield farming offers the same logic, producing more or less revenue. Some strategies are designed to increase expected returns, others reduce complexity or minimize risk.

There is an entire realm of DeFi (**De**centralized **Fi**nance), which offers many free tools to extract as much value as possible in the short or medium term.

This article is not a tutorial showing you how to always win, nor is it a technical dictionary. Instead, I want to show that crypto is not merely a Ponzi scheme, by highlighting where the money comes from. Why would some people give you money without doing real work?

(For this French version, once I define these terms, I will keep the English words as is, because that is how you will encounter them if you delve deeper into DeFi.)

### Staking for security

By holding 32 ethers and running a good computer, we can help secure the Ethereum 2.0 network and earn income from it. You might earn around 5% per year (0.05 x 32 = 1.6 ETH) if there are already many validators doing the same work, or up to 20% if the number of validators is low. Currently, the yield is about 7%, and you shouldn’t expect to earn much more than that. However, it is also possible—but not guaranteed!—that the dollar value of the ETH earned could increase during that year.

You can also secure other blockchains that use Proof of Stake, such as Fantom, Solana, Avalanche, Terra, etc. Each will have different yields and different hardware and configuration requirements. Be prepared for the challenge of running a [Solana validator](https://docs.solana.com/running-validator/validator-reqs)!

*Staking* means holding your ETH (or other tokens) locked in a *smart contract* so they can play their defined role in the contract’s code.

Technically, you transfer your tokens to the address of this smart contract, hoping the code is well-written enough that you can recover your tokens whenever you decide to.

In Ethereum 2.0 staking, the reason you earn money is straightforward. The network needs well-configured computers to create a secure chain for everyone. The users of the blockchain pay transaction fees, and new ETH is created at each block, creating slight inflation. If you secure the network, you earn your share. Otherwise—if, for example, you’re offline or order the blocks incorrectly—you lose part of your stake.

### Participating in a Liquidity Pool

In *traditional* finance, liquidity represents money that’s immediately available to be exchanged for a good, a service, or another currency. It is extremely important: the subprime crisis turned into a liquidity crisis that took down Lehman Brothers in 2008—an event that gave birth to the Bitcoin myth. Central bankers are currently competing to see who can create the most liquidity.

In DeFi, you can earn income by providing liquidity. With a token called `$A` and another token called `$B`, you create a token called `LP A/B` (LP stands for *Liquidity Pool*) and provide a *Farm* with this *LP token*. You may see the terms *Pool*, *Vault*, or *Farm*—each platform has its own vocabulary and nuances.

You can now *harvest* from this farm, either when you withdraw the LP tokens or by clicking a Harvest button. This can be automated in *auto-compound farms*, such as Autofarm, although that adds extra layers of trust and risk of bugs.

Some people click; others write code. The blockchain is open, so you can call the Web3 layer yourself with your own code to retrieve the `$A` and `$B` tokens. No-code platforms will likely soon let you manage these operations in a more refined manner without writing code.

The leading centralized platform, Binance, recreates liquidity sharing off-chain. Its core exchange system doesn’t rely on a blockchain because that would be too slow and expensive. But since Binance also needs liquidity for its markets, its users’ liquidity is welcome. Unlike your bank, Binance does compensate its users for providing liquidity.

In that example, the *staker* makes money from Binance users who swap `$MATIC` into `$USDT` or vice versa. These users might pay them 0.2% in transaction fees plus 0.1% to the platform. These figures vary greatly depending on the platform, but it’s important to note that in many cases, *liquidity providers* collectively can earn more than the platform. In a **D**ecentralized **EX**change (*DEX*) like Uniswap, users also pay transaction fees to Ethereum 2.0 stakers.

The second part of the income is rewards. They might be 4.11% in the example above, and in many cases can exceed what is earned from swap fees. For instance, consider the pair `AAVE/ETH` on Binance:

These rewards are often paid in the protocol’s own token—`$SUSHI` on SushiSwap, `$CAKE` on PancakeSwap, etc. It might seem cheap for protocol owners to distribute these tokens, but it creates strong inflation. Once the hype dies down, there may be millions of tokens with no obvious utility.

Developers and investors are also compensated through these tokens, so it’s in everyone’s best interest for the market to find a use for the token and for it to maintain value. A common way to satisfy everyone is to distribute *fees* to token holders. If you swap `$DAI` for `$ETH` on SushiSwap, you might pay 0.2% in fees to liquidity providers of `LP DAI/ETH` and 0.1% to `$SUSHI` stakers.

Hence, on one side, you earn fees by staking `LP DAI/ETH` while also earning `$SUSHI` tokens every day, which you can then stake to earn even more fees. Everyone is happy…assuming there is any interest for end users to swap `$DAI` into `$ETH`!

You can seek better opportunities within the DeFi spectrum. On SushiSwap’s Polygon network, for example, I can earn about 35% APY on `LP USDC/ETH`, which are likely two of the three safest tokens alongside `$DAI` (not financial advice!).

Since the blockchain is an open, real-time database, large amounts of assets can be moved from one protocol to another to capture even just a few extra percentage points at any given moment.

This doesn’t guarantee success: a complicated concept known as *Impermanent Loss* can spoil the party. By providing liquidity, you give up your `$USDC` in exchange for ETH at times when people want fewer ETH—so the value of your ETH drops. You’re always on the losing side of the market! You must enter at the right price, hope for sufficient trading volume and oscillations, and stay in for the medium term.

### Farms with huge yields: the example of Exchanges

Sometimes, farms offer huge yields. The very legitimate blockchain [Elrond](https://coinmarketcap.com/currencies/elrond-egld/) provides yields above 2000% APR (and even higher when compounded—APY) through its new exchange, [Maiar](https://maiar.exchange/).

In this example, Elrond allocated more than a billion dollars in `$MEX` tokens to users of **M**aiar **EX**change. The catch is that these valuations are declared in `$MEX` tokens—Elrond did not put a single actual dollar on the table.

Every **hour**, 2493$ invested earns 11$ in interest, day and night, weekends included. After one year, the total of `$MEX` earned *would* be more than a million dollars—not financial advice, read on!

Unfortunately—or logically—the more `$MEX` that gets issued, the lower its value tends to go. The value of staked `LP EGLD-MEX` can drop far more quickly than the rewards you collect in `$MEX`.

The initial one-billion-dollar value in `$MEX` might be worth peanuts a year later. This pattern has already been seen with Goose Finance, PolyWhale (token `$KRILL`), and many others.

If there are no actual users swapping assets on the platform, these tokens have no value. Yet some exchanges survive very well: UniSwap (13B USD on Ethereum), SushiSwap, PancakeSwap, Quickswap (100M USD on Polygon)… Those who collect the tokens also collect the daily fees.

After distributing most of the Maiar Exchange tokens for free, Elrond can sell the remaining `$MEX` for a profit. More importantly, Elrond builds a community strongly incentivized to kick-start the ecosystem around its blockchain.

### Lending and borrowing

Borrowing in the crypto world has little in common with borrowing in the *real* world. Honestly, I don’t see much point in it.

In the real world, a bank lends you money because it believes you will make enough to pay it back. If you run off with the borrowed money, the bank trusts law enforcement to make your life difficult.

DeFi is a trustless world. It’s not that the protocols trust you; rather, they *don’t need to*. To borrow a million dollars, you have to deposit—or *stake—two million. If you fail to repay, the protocol will seize 1.1 million from your stake.

So why do it if you already have the funds? You can achieve leverage. If you have two million dollars in ETH, you can lock it up while borrowing one million to do other things. The benefit still isn’t obvious…

In some real or future jurisdictions, you might prefer to hold on to your tokens for tax reasons and, by using such a maneuver, acquire new tokens without paying capital gains taxes on what you already hold. This is just a hypothetical scenario, and I’ll have another article explaining who really owns what in crypto.

There can also be an immediate trading opportunity. For example, on the leading platform Aave:

Suppose I have 8k$ in `$USDT`, while ETH is priced at 4k$. I deposit 8k$ in `$USDT` and earn (16.12+4.6) = 20.7% annually (about $1656). The 16.1% comes from fees paid by `$USDT` borrowers, and the extra 4.6% is the Aave reward.

I can then immediately borrow 1 ETH. If I’m clever, I might swap it for `$USDT` and redeposit that `$USDT` for additional earnings.

However, I must repay 1 ETH plus 2.03% interest, while getting back 1.19% in rewards. Thanks to these rewards, I remain well in the black if I also lend out what I’ve just borrowed. As previously explained, this also shows the value of the blockchain: with so few intermediaries, the system’s cost is very low.

As a developer, I naturally tried creating an infinite loop, but collateral rules don’t allow it. More concerning, if the price of ETH quickly rises, I end up owing more than I can manage before being *liquidated*.

If I’m a robot or a smart contract, that’s fine: I can react instantly if the code anticipates the scenario. Indeed, most Aave transactions are actually made by smart contracts belonging to other protocols. Though I personally have little motivation to lend or borrow, the fact that robots are the main borrowers shows there’s a real use for such a service.

Clearly, the market cap of a protocol shouldn’t be assessed in the same way as a stock market capitalization. Still, Aave is valued at around $5B and is by far the leader in this domain. By comparison, Bank of America is worth $385B, and Société Générale around $30B.

### Initial Farm Offering

An Initial Farm Offering (**IFO**) is a way for a company’s founders to quickly and publicly sell their shares. It’s like an IPO on steroids, at a very early stage. The exact IFO process depends on each platform.

Let’s say the founders of ACME Inc. deposit their `$ACME` tokens into a farm, and users invest ETH there. At the end of the IFO, the initial price of `$ACME` is determined by the total amount of ETH deposited. The founders get the ETH—enriching themselves but also continuing development and marketing—while the users receive tokens in return. Some will sell them immediately, others might expect a higher future price, and enthusiasts hope these tokens will have genuine utility if the project is successfully developed.

The founders also want the token to spread to a wider audience than typical startup investors. The more buzz around the IFO, the more people hear about the token and can set its price.

Consider the current [IFO by the FC Porto soccer club](https://pancakeswap.finance/ifo) on PancakeSwap, for example.

In this case, 250,000 `$PORTO` tokens are sold at a fixed price of $2, for a total of $500k. Hundreds of millions have already been raised by the crowd, so not everyone will get as many tokens as they want. Some of them may try to buy `$PORTO` on the secondary market, potentially at a price higher than $2.

For a regular person, it’s nearly impossible to invest in Y Combinator’s next batch of startups—the crème de la crème. You can invest in other startups through a club, but the entry ticket is usually around $10k.

With farming, and especially IFOs, anyone with internet can invest very early in a blockchain startup for just a few dollars.

### Combining strategies and conclusion

We’ve described ways to earn virtual money. It takes technical knowledge, and there are many ways to lose money: poor choices, scams, smart contract bugs, or simply losing your keys.

You could also be greedy (which can be a virtue here!) and try to earn a bit more by borrowing as much as possible, collecting rewards, then depositing them in a Liquidity Pool. Repay the loan, take the profit, repeat. Automate everything, or even write your own smart contract to do it.

Or more simply, stake on [Yearn Finance](https://yearn.finance/#/vaults), which has already coded similar systems for you.

In any case, always ask yourself: what is the actual purpose of this token? Why would people keep paying me more for it?