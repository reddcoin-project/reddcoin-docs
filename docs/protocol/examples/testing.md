# Testing Applications

Reddcoin Core provides testing tools designed to let developers test their applications with reduced risks and limitations.

## Testnet

When run with no arguments, all Reddcoin Core programs default to Reddcoin’s main [network](../devguide/p2p_network) (mainnet). However, for development, it’s safer and cheaper to use Reddcoin’s test [network](../devguide/p2p_network) (testnet) where the reddoshis spent have no real-world value. Testnet also relaxes some restrictions (such as standard transaction checks) so you can test functions which might currently be disabled by default on mainnet.

To use testnet, use the argument `-testnet` with `reddcoin-cli`, `reddcoind` or `reddcoin-qt` or add `testnet=1` to your `reddcoin.conf` file as [described earlier](../examples). To get free reddoshis for testing, use [Piotr Piasecki’s testnet faucet](https://tpfaucet.appspot.com/). Testnet is a public resource provided for free by members of the community, so please don’t abuse it.

## Regtest Mode

For situations where interaction with random peers and blocks is unnecessary or unwanted, Reddcoin Core’s regression test mode (regtest mode) lets you instantly create a brand-new private block chain with the same basic rules as testnet—but one major difference: you choose when to create new blocks, so you have complete control over the environment.

Many developers consider regtest mode the preferred way to develop new applications. The following example will let you create a regtest environment after you first [configure reddcoind](../examples).

```bash
> reddcoind -regtest -daemon
Reddcoin server starting
```
Start `reddcoind` in regtest mode to create a private block chain.

```
## Reddcoin Core 0.10.1 and earlier
reddcoin-cli -regtest setgenerate true 101

## Reddcoin Core 17.1 and earlier
reddcoin-cli -regtest generate 101

## Reddcoin Core 18.0 and later
reddcoin-cli -regtest generatetoaddress 101 $(reddcoin-cli -regtest getnewaddress)
```

Generate 101 blocks using a special [RPC](../reference/rpc) which is only available in regtest mode. This takes less than a second on a generic PC. Because this is a new block chain using Reddcoin’s default rules, the first blocks pay a block reward of 50 bitcoins. Unlike mainnet, in regtest mode only the first 150 blocks pay a reward of 50 bitcoins. However, a block must have 100 confirmations before that reward can be spent, so we generate 101 blocks to get access to the coinbase transaction from block #1.

```bash
reddcoin-cli -regtest getbalance
50.00000000
```
Verify that we now have 50 reddcoins available to spend.

You can now use Reddcoin Core [RPCs](../reference/rpc) prefixed with `reddcoin-cli -regtest`.

Regtest wallets and block chain state (chainstate) are saved in the `regtest` subdirectory of the Reddcoin Core configuration directory. You can safely delete the `regtest` subdirectory and restart Reddcoin Core to start a new regtest. (See the [Developer Examples Introduction](../examples) for default configuration directory locations on various operating systems. Always back up mainnet wallets before performing dangerous operations such as deleting.)

