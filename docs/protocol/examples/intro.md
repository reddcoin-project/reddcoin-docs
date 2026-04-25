# Introduction

The following guide aims to provide examples to help you start building Reddcoin-based applications. To make the best use of this document, you may want to install the current version of Reddcoin Core, either from [source](https://github.com/reddcoin-project/reddcoin) or from a [pre-compiled executable](https://github.com/reddcoin-project/reddcoin/releases).

Once installed, you’ll have access to three programs: `reddcoind`, `reddcoin-qt`, and `reddcoin-cli`.

- `reddcoin-qt` provides a combination full Reddcoin peer and wallet frontend. From the Help menu, you can access a console where you can enter the [RPC](../reference/rpc/index) commands used throughout this document.
- `reddcoind` is more useful for programming: it provides a full peer which you can interact with through [RPCs](../reference/rpc/index) to port 45445 (or 55445 for testnet).
- `reddcoin-cli` allows you to send [RPC](../reference/rpc/index) commands to `reddcoind` from the command line. For example, `reddcoin-cli help`

All three programs get settings from `reddcoin.conf` in the `Reddcoin` application directory:

- Windows: `%APPDATA%\Reddcoin\`
- OSX: `$HOME/Library/Application Support/Reddcoin/`
- Linux: `$HOME/.reddcoin/`

To use `reddcoind` and `reddcoin-cli`, you will need to add a [RPC](../reference/rpc/index) password to your `reddcoin.conf` file. Both programs will read from the same file if both run on the same system as the same user, so any long random password will work:

```
rpcpassword=change_this_to_a_long_random_password
```

You should also make the `reddcoin.conf` file only readable to its owner. On Linux, Mac OSX, and other Unix-like systems, this can be accomplished by running the following command in the Reddcoin application directory:

```
chmod 0600 reddcoin.conf
```

For development, it’s safer and cheaper to use Reddcoin’s test [network](../devguide/p2p_network) (testnet) or regression test mode (regtest) described below.

Questions about Reddcoin use are best sent to the [Reddcoin subreddit](https://www.reddit.com/r/reddcoin/) or [Telegram](https://t.me/ReddcoinOfficial). Errors or suggestions related to this documentation can be [submitted as an issue](https://github.com/reddcoin-project/developer.reddcoin.com/issues).

In the following documentation, some strings have been shortened or wrapped: “[…]” indicates extra data was removed, and lines ending in a single backslash “\\” are continued below. If you hover your mouse over a paragraph, cross-reference links will be shown in blue. If you hover over a cross-reference link, a brief definition of the term will be displayed in a tooltip.

