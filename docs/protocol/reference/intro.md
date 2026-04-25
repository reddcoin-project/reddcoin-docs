# Introduction

The Developer Reference aims to provide technical details and API information to help you start building Reddcoin-based applications, but it is [not a specification](../reference/intro.html#not-a-specification). To make the best use of this documentation, you may want to install the current version of Reddcoin Core, either from [source](https://github.com/reddcoin-project/reddcoin) or from a [pre-compiled executable](https://github.com/reddcoin-project/reddcoin/releases).

Questions about Reddcoin development are best asked on the [Reddcoin subreddit](https://www.reddit.com/r/reddcoin/) or [Telegram](https://t.me/ReddcoinOfficial). Errors or suggestions related to this documentation can be [submitted as an issue](https://github.com/reddcoin-project/developer.reddcoin.com/issues).

In the following documentation, some strings have been shortened or wrapped: “[…]” indicates extra data was removed, and lines ending in a single backslash “\\” are continued below. If you hover your mouse over a paragraph, cross-reference links will be shown in blue. If you hover over a cross-reference link, a brief definition of the term will be displayed in a tooltip.

## Not A Specification

The Reddcoin.org Developer Documentation describes how Reddcoin works to help educate new Reddcoin developers, but it is not a specification—and it never will be.

Reddcoin security depends on consensus. Should your program diverge from consensus, its security is weakened or destroyed. The cause of the divergence doesn’t matter: it could be a bug in your program, it could be an [error in this documentation](https://github.com/reddcoin-project/developer.reddcoin.com/issues) which you implemented as described, or it could be you do everything right but other software on the [network](../devguide/p2p_network.html) [behaves unexpectedly](https://github.com/reddcoin-project/reddcoin/releases). The specific cause will not matter to the users of your software whose wealth is lost.

The only correct specification of consensus behavior is the actual behavior of programs on the [network](../devguide/p2p_network.html) which maintain consensus. As that behavior is subject to arbitrary inputs in a large variety of unique environments, it cannot ever be fully documented here or anywhere else.

However, the Reddcoin Core developers are working on making their consensus code portable so other implementations can use it. [Reddcoin Core 0.10.0](https://github.com/reddcoin-project/reddcoin/releases) provided `libreddcoinconsensus`, as the first attempt at exporting some consensus code. Future versions of Reddcoin Core also provided consensus code that is more complete, more portable, and more consistent in diverse environments.

In addition, we also warn you that this documentation has not been extensively reviewed by Reddcoin experts and so likely contains numerous errors. At the bottom of the menu on the left, you will find links that allow you to report an issue or to edit the documentation on GitHub. Please use those links if you find any errors or important missing information.

