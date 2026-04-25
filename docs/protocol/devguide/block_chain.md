# Block Chain

The block chain provides Reddcoin's public ledger, an ordered and timestamped record of transactions. This system is used to protect against double spending and modification of previous transaction records.

## Introduction

Each full node in the Reddcoin [network](../devguide/p2p_network) independently stores a block chain containing only blocks validated by that node. When several nodes all have the same blocks in their block chain, they are considered to be in [consensus](/glossary/#consensus). The validation rules these nodes follow to maintain consensus are called [consensus rules](/glossary/#consensus-rules). This section describes many of the consensus rules used by Reddcoin Core.

![Block Chain Overview](/img/protocol/dev/en-blockchain-overview.svg)

Block Chain Overview
The illustration above shows a simplified version of a block chain. A [block](/glossary/#block) of one or more new transactions is collected into the transaction data part of a block. Copies of each transaction are hashed, and the hashes are then paired, hashed, paired again, and hashed again until a single hash remains, the [merkle root](/glossary/#merkle-root) of a merkle tree.

The merkle root is stored in the block header. Each block also stores the hash of the previous block’s header, chaining the blocks together. This ensures a transaction cannot be modified without modifying the block that records it and all following blocks.

Transactions are also chained together. Reddcoin wallet software gives the impression that reddoshis are sent from and to wallets, but bitcoins really move from transaction to transaction. Each transaction spends the reddoshis previously received in one or more earlier transactions, so the input of one transaction is the output of a previous transaction.

![Transaction Propagation](/img/protocol/dev/en-transaction-propagation.svg)

Transaction Propagation
A single transaction can create multiple outputs, as would be the case when sending to multiple addresses, but each output of a particular transaction can only be used as an input once in the block chain. Any subsequent reference is a forbidden double spend—an attempt to spend the same reddoshis twice.

Outputs are tied to [transaction identifiers (TXIDs)](/glossary/#txid), which are the hashes of signed transactions.

Because each output of a particular transaction can only be spent once, the outputs of all transactions included in the block chain can be categorized as either [Unspent Transaction Outputs (UTXOs)](/glossary/#utxo) or spent transaction outputs. For a payment to be valid, it must only use UTXOs as inputs.

Ignoring coinbase transactions (described later), if the value of a transaction’s outputs exceed its inputs, the transaction will be rejected—but if the inputs exceed the value of the outputs, any difference in value may be claimed as a [transaction fee](/glossary/#transaction-fee) by the Reddcoin [staker](/glossary/#staking) (or historically, [miner](/glossary/#mining)) who creates the block containing that transaction. For example, in the illustration above, each transaction spends 10,000 reddoshis fewer than it receives from its combined inputs, effectively paying a 10,000 reddoshi transaction fee.

## Consensus Mechanism

The block chain is collaboratively maintained by anonymous peers on the [network](../devguide/p2p_network). Reddcoin has used two consensus mechanisms over its history:

### Proof of Work (Historical)

For blocks 0 through 260,799, Reddcoin used Proof of Work (PoW) with the Scrypt hashing algorithm. Miners competed to find a block header hash below a difficulty target, with the difficulty adjusted using the Kimoto Gravity Well algorithm. See the [mining guide](mining) for details on the historical PoW era.

### Proof of Stake Velocity (PoSV)

Since block 260,800, Reddcoin uses Proof of Stake Velocity (PoSV). Under PoSV, the block chain is secured by coin holders who stake their coins rather than by computational power.

Chaining blocks together makes it impossible to modify transactions included in any block without modifying all subsequent blocks. As a result, the cost to modify a particular block increases with every new block added to the block chain, magnifying the effect of the proof of stake.

In PoSV, block creators (stakers) prove ownership of coins by constructing a valid **stake kernel hash**. The kernel hash is computed from a combination of the stake modifier, the previous transaction's block time and offset, the staked output index, and the current block timestamp. This hash must fall below a target threshold that is scaled by the staker's **coin-day weight**—the product of the coin value and a non-linear coin age function.

The "Velocity" component of PoSV uses a two-phase coin age weighting function that distinguishes it from traditional Proof of Stake:

- **Phase 1 (0–7 days):** A cubic polynomial that rewards fresh staking activity, providing increasing returns for coins recently put up for staking.
- **Phase 2 (7+ days):** A logarithmic function that provides diminishing returns for older coins, capping at the maximum stake age of 45 days. This prevents hoarding and encourages active participation (velocity) in the network.

Coins must be at least 8 hours old (the minimum stake age) before they are eligible to stake.

Difficulty is adjusted every block using the **Kimoto Gravity Well (KGW)** algorithm, which takes the running arithmetic mean of past block targets over a sliding window of 360 to 10,080 blocks and scales it by the ratio of actual to expected elapsed time. This allows rapid adjustment to changes in network staking power while preventing extreme difficulty oscillations. The target block time is 60 seconds. See [kimoto_gravity_well](kimoto_gravity_well) for a detailed walkthrough of the algorithm.

Because each block requires a valid stake kernel, and the stake modifier changes every 13 minutes to prevent precomputation, a malicious actor would need to control a majority of the network's staked coins to reliably execute a [51 percent attack](/glossary/#51-percent-attack) against transaction history.

PoS blocks also include a cryptographic block signature using the key that controls the staked output, ensuring that only the legitimate coin owner can produce a valid block.

## Block Height And Forking

Any Reddcoin staker who constructs a valid stake kernel (or historically, any miner who found a valid PoW hash) can add the entire block to the block chain (assuming the block is otherwise valid). These blocks are commonly addressed by their [block height](/glossary/#block-height)—the number of blocks between them and the first Reddcoin block (block 0, most commonly known as the [genesis block](/glossary/#genesis-block)).

![Common And Uncommon Block Chain Forks](/img/protocol/dev/en-blockchain-fork.svg)

Common And Uncommon Block Chain Forks
Multiple blocks can all have the same block height, as is common when two or more stakers each produce a block at roughly the same time. This creates an apparent [fork](/glossary/#fork) in the block chain, as shown in the illustration above.

When stakers produce simultaneous blocks at the end of the block chain, each node individually chooses which block to accept. In the absence of other considerations, discussed below, nodes usually use the first block they see.

Eventually a staker produces another block which attaches to only one of the competing simultaneously-staked blocks. This makes that side of the fork stronger than the other side. Assuming a fork only contains valid blocks, normal peers always follow the most difficult chain to recreate and throw away [stale blocks](/glossary/#stale-block) belonging to shorter forks. (Stale blocks are also sometimes called orphans or orphan blocks, but those terms are also used for true orphan blocks without a known parent block.)

Long-term forks are possible if different stakers work at cross-purposes, such as some stakers diligently working to extend the block chain at the same time other stakers are attempting a 51 percent attack to revise transaction history.

Since multiple blocks can have the same height during a block chain fork, block height should not be used as a globally unique identifier. Instead, blocks are usually referenced by the hash of their header (often with the byte order reversed, and in hexadecimal).

## Transaction Data

Every block must include one or more transactions. Under PoSV, the first transaction is a coinbase transaction (which may be empty), followed by a coinstake transaction that collects and spends the staking reward (comprised of a 5% annual interest on staked coin-days and any transaction fees paid by transactions included in this block).

The UTXO of a coinstake transaction has the special condition that it cannot be spent (used as an input) for at least 30 blocks (the coinbase maturity period). This temporarily prevents a staker from spending the transaction fees and staking reward from a block that may later be determined to be stale (and therefore the coinstake transaction destroyed) after a block chain fork.

Blocks are not required to include any non-coinstake transactions, but stakers almost always do include additional transactions in order to collect their transaction fees.

All transactions, including the coinbase transaction, are encoded into blocks in binary raw transaction format.

The raw transaction format is hashed to create the transaction identifier (txid). From these txids, the [merkle tree](/glossary/#merkle-tree) is constructed by pairing each txid with one other txid and then hashing them together. If there are an odd number of txids, the txid without a partner is hashed with a copy of itself.

The resulting hashes themselves are each paired with one other hash and hashed together. Any hash without a partner is hashed with itself. The process repeats until only one hash remains, the merkle root.

For example, if transactions were merely joined (not hashed), a five-transaction merkle tree would look like the following text diagram:

```
       ABCDEEEE .......Merkle root
      /        \
   ABCD        EEEE
  /    \      /
 AB    CD    EE .......E is paired with itself
/  \  /  \  /
A  B  C  D  E .........Transactions
```

As discussed in the Simplified Payment Verification (SPV) subsection, the merkle tree allows clients to verify for themselves that a transaction was included in a block by obtaining the merkle root from a block header and a list of the intermediate hashes from a full peer. The full peer does not need to be trusted: it is expensive to fake block headers and the intermediate hashes cannot be faked or the verification will fail.

For example, to verify transaction D was added to the block, an SPV client only needs a copy of the C, AB, and EEEE hashes in addition to the merkle root; the client doesn’t need to know anything about any of the other transactions. If the five transactions in this block were all at the maximum size, downloading the entire block would require over 500,000 bytes—but downloading three hashes plus the block header requires only 140 bytes.

Note: If identical txids are found within the same block, there is a possibility that the merkle tree may collide with a block with some or all duplicates removed due to how unbalanced merkle trees are implemented (duplicating the lone hash). Since it is impractical to have separate transactions with identical txids, this does not impose a burden on honest software, but must be checked if the invalid status of a block is to be cached; otherwise, a valid block with the duplicates eliminated could have the same merkle root and block hash, but be rejected by the cached invalid outcome, resulting in security bugs such as [CVE-2012-2459](https://en.bitcoin.it/wiki/CVEs#CVE-2012-2459).

## Consensus Rule Changes

To maintain consensus, all full nodes validate blocks using the same consensus rules. However, sometimes the consensus rules are changed to introduce new features or prevent [network](../devguide/p2p_network) abuse. When the new rules are implemented, there will likely be a period of time when non-upgraded nodes follow the old rules and upgraded nodes follow the new rules, creating two possible ways consensus can break:

1. A block following the new consensus rules is accepted by upgraded nodes but rejected by non-upgraded nodes. For example, a new transaction feature is used within a block: upgraded nodes understand the feature and accept it, but non-upgraded nodes reject it because it violates the old rules.
2. A block violating the new consensus rules is rejected by upgraded nodes but accepted by non-upgraded nodes. For example, an abusive transaction feature is used within a block: upgraded nodes reject it because it violates the new rules, but non-upgraded nodes accept it because it follows the old rules.

In the first case, rejection by non-upgraded nodes, mining software which gets block chain data from those non-upgraded nodes refuses to build on the same chain as mining software getting data from upgraded nodes. This creates permanently divergent chains—one for non-upgraded nodes and one for upgraded nodes—called a [hard fork](/glossary/#hard-fork).

![Hard Fork](/img/protocol/dev/en-hard-fork.svg)

Hard Fork
In the second case, rejection by upgraded nodes, it’s possible to keep the block chain from permanently diverging if upgraded nodes control a majority of the hash rate. That’s because, in this case, non-upgraded nodes will accept as valid all the same blocks as upgraded nodes, so the upgraded nodes can build a stronger chain that the non-upgraded nodes will accept as the best valid block chain. This is called a [soft fork](/glossary/#soft-fork).

![Soft Fork](/img/protocol/dev/en-soft-fork.svg)

Soft Fork
Although a fork is an actual divergence in block chains, changes to the consensus rules are often described by their potential to create either a hard or soft fork. For example, “increasing the block size above 1 MB requires a hard fork.” In this example, an actual block chain fork is not required—but it is a possible outcome.

Consensus rule changes may be activated in various ways. During Bitcoin’s first two years, Satoshi Nakamoto performed several soft forks by just releasing the backwards-compatible change in a client that began immediately enforcing the new rule. Multiple soft forks such as [BIP30](https://github.com/bitcoin/bips/blob/master/bip-0030.mediawiki) have been activated via a flag day where the new rule began to be enforced at a preset time or block height. Such forks activated via a flag day are known as [User Activated Soft Forks](/glossary/#uasf) (UASF) as they are dependent on having sufficient users (nodes) to enforce the new rules after the flag day.

Later soft forks waited for a majority of hash rate (typically 75% or 95%) to signal their readiness for enforcing the new consensus rules. Once the signalling threshold has been passed, all nodes will begin enforcing the new rules. Such forks are known as [Miner Activated Soft Forks](/glossary/#masf) (MASF) as they are dependent on miners for activation.

**Resources:** [BIP16](https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki), [BIP30](https://github.com/bitcoin/bips/blob/master/bip-0030.mediawiki), and [BIP34](https://github.com/bitcoin/bips/blob/master/bip-0034.mediawiki) were implemented as changes which might have lead to soft forks. [BIP50](https://github.com/bitcoin/bips/blob/master/bip-0050.mediawiki) describes both an accidental hard fork, resolved by temporary downgrading the capabilities of upgraded nodes, and an intentional hard fork when the temporary downgrade was removed. A document from Gavin Andresen outlines [how future rule changes may be implemented](https://gist.github.com/gavinandresen/2355445).

## Detecting Forks

Non-upgraded nodes may use and distribute incorrect information during both types of forks, creating several situations which could lead to financial loss. In particular, non-upgraded nodes may relay and accept transactions that are considered invalid by upgraded nodes and so will never become part of the universally-recognized best block chain. Non-upgraded nodes may also refuse to relay blocks or transactions which have already been added to the best block chain, or soon will be, and so provide incomplete information.

Reddcoin Core includes code that detects a hard fork by looking at block chain proof of work. If a non-upgraded node receives block chain headers demonstrating at least six blocks more proof of work than the best chain it considers valid, the node reports a warning in the [“getnetworkinfo” RPC](../reference/rpc/getnetworkinfo) results and runs the `-alertnotify` command if set. This warns the operator that the non-upgraded node can’t switch to what is likely the best block chain.

Full nodes can also check block and transaction version numbers. If the block or transaction version numbers seen in several recent blocks are higher than the version numbers the node uses, it can assume it doesn’t use the current consensus rules. Reddcoin Core reports this situation through the [“getnetworkinfo” RPC](../reference/rpc/getnetworkinfo) and `-alertnotify` command if set.

In either case, block and transaction data should not be relied upon if it comes from a node that apparently isn’t using the current consensus rules.

SPV clients which connect to full nodes can detect a likely hard fork by connecting to several full nodes and ensuring that they’re all on the same chain with the same block height, plus or minus several blocks to account for transmission delays and stale blocks. If there’s a divergence, the client can disconnect from nodes with weaker chains.

SPV clients should also monitor for block and [transaction version number](/glossary/terms#term-transaction-version-number) increases to ensure they process received transactions and create new transactions using the current consensus rules.

