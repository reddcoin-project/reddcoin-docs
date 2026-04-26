---
id: index
title: Glossary
description: ReddCoin and Bitcoin-family terminology used across the documentation.
slug: /
---

# Glossary

Terminology used across the ReddCoin documentation. Each term is an
anchor target for `{term}` cross-references from the protocol
pages.

## 51 percent attack {#51-percent-attack}

The ability of someone controlling a majority of network staking power (or hash rate during the PoW era) to revise transaction history and prevent new transactions from confirming.

## Majority attack {#majority-attack}

See [51 percent attack](#51-percent-attack).

## Address {#address}

A 20-byte hash formatted using base58check to produce either a P2PKH or P2SH ReddCoin address. Currently the most common way users exchange payment information.

**Not to be confused with:** IP address

## Base58check {#base58check}

The method used in ReddCoin for converting 160-bit hashes into P2PKH and P2SH addresses. Also used in other parts of ReddCoin, such as encoding private keys for backup in WIP format. Not the same as other base58 implementations.

**Not to be confused with:** P2PKH address, P2SH address, IP address

## Block {#block}

One or more transactions prefaced by a block header and protected by proof of stake (or proof of work for historical blocks before 260,800). Blocks are the data stored on the block chain.

## Block chain {#block-chain}

A chain of blocks with each block referencing the block that preceded it. The most-difficult-to-recreate chain is the best block chain.

**Not to be confused with:** Header chain

## Best block chain {#best-block-chain}

See [Block chain](#block-chain).

## Block header {#block-header}

An 80-byte header belonging to a single block which is hashed to identify the block. Under PoSV, the header is used in stake kernel computation rather than proof of work.

## Header {#header}

See [Block header](#block-header).

## Height {#height}

The number of blocks preceding a particular block on a block chain. For example, the genesis block has a height of zero because zero block preceded it.

## Block height {#block-height}

See [Height](#height).

## Block reward {#block-reward}

The amount that stakers may claim as a reward for creating a block. Under PoSV, the reward is a 5% annual return on staked coin-days plus the transaction fees paid by transactions included in the block.

**Not to be confused with:** Block subsidy, Transaction fees

## Maximum Block Size {#maximum-block-size}

The maximum size of a block according to the consensus rules. The current block size limit is 4 million weight units (1 million vbytes).

**Not to be confused with:** Block, Blockchain, Blockchain size

## Blocks-first sync {#blocks-first-sync}

Synchronizing the block chain by downloading each block from a peer and then validating it.

**Not to be confused with:** Headers-first sync

## Bloom filter {#bloom-filter}

A filter used primarily by SPV clients to request only matching transactions and merkle blocks from full nodes.

**Not to be confused with:** Bloom filter (general computer science term, of which ReddCoin's bloom filters are a specific implementation)

## Chain code {#chain-code}

In HD wallets, 256 bits of entropy added to the public and private keys to help them generate secure child keys; the master chain code is usually derived from a seed along with the master private key

## Change address {#change-address}

An output in a transaction which returns reddoshis to the spender, thus preventing too much of the input value from going to transaction fees.

**Not to be confused with:** Address reuse

## Change output {#change-output}

See [Change address](#change-address).

## Child key {#child-key}

In HD wallets, a key derived from a parent key. The key can be either a private key or a public key, and the key derivation may also require a chain code.

**Not to be confused with:** Public key (derived from a private key, not a parent key)

## Child public key {#child-public-key}

See [Child key](#child-key).

## Child private key {#child-private-key}

See [Child key](#child-key).

## Coinbase {#coinbase}

A special field used as the sole input for coinbase transactions. The coinbase allows claiming the block reward and provides up to 100 bytes for arbitrary data.

**Not to be confused with:** Coinbase transaction, Coinbase.com

## Coinbase transaction {#coinbase-transaction}

The first transaction in a block. Always created by a miner, it includes a single coinbase.

**Not to be confused with:** Coinbase (the unique part of a coinbase transaction)

## Generation transaction {#generation-transaction}

See [Coinbase transaction](#coinbase-transaction).

## CompactSize {#compactsize}

A type of variable-length integer commonly used in the ReddCoin P2P protocol and ReddCoin serialized data structures.

**Not to be confused with:** VarInt (a data type ReddCoin Core uses for local data storage), Compact (the data type used for nBits in the block header)

## Compressed public key {#compressed-public-key}

An ECDSA public key that is 33 bytes long rather than the 65 bytes of an uncompressed public key.

## Confirmation score {#confirmation-score}

A score indicating the number of blocks on the best block chain that would need to be modified to remove or modify a particular transaction. A confirmed transaction has a confirmation score of one or higher.

## Confirmations {#confirmations}

See [Confirmation score](#confirmation-score).

## Confirmed transaction {#confirmed-transaction}

See [Confirmation score](#confirmation-score).

## Unconfirmed transaction {#unconfirmed-transaction}

See [Confirmation score](#confirmation-score).

## Consensus {#consensus}

When several nodes (usually most nodes on the network) all have the same blocks in their locally-validated best block chain.

**Not to be confused with:** Social consensus (often used in discussion among developers to indicate that most people agree with a particular plan), Consensus rules (the rules that allow nodes to maintain consensus)

## Consensus rules {#consensus-rules}

The block validation rules that full nodes follow to stay in consensus with other nodes.

**Not to be confused with:** Consensus (what happens when nodes follow the same consensus rules)

## Child pays for parent {#child-pays-for-parent}

Selecting transactions for mining not just based on their fees but also based on the fees of their ancestors (parents) and descendants (children).

**Not to be confused with:** Replace by Fee, RBF

## CPFP {#cpfp}

See [Child pays for parent](#child-pays-for-parent).

## Ancestor mining {#ancestor-mining}

See [Child pays for parent](#child-pays-for-parent).

## Denomination {#denomination}

Denominations of ReddCoin value, usually measured in fractions of a bitcoin but sometimes measured in multiples of a reddoshi. One bitcoin equals 100,000,000 reddoshis.

**Not to be confused with:** Binary bits, a unit of data with two possible values

## Reddcoins {#reddcoins}

See [Denomination](#denomination).

## Reddoshis {#reddoshis}

See [Denomination](#denomination).

## Difficulty {#difficulty}

How difficult it is to find a block relative to the difficulty of finding the easiest possible block. The easiest possible block has a proof-of-work difficulty of 1.

**Not to be confused with:** Target threshold (the value from which difficulty is calculated)

## Network difficulty {#network-difficulty}

See [Difficulty](#difficulty).

## DNS seed {#dns-seed}

A DNS server which returns IP addresses of full nodes on the ReddCoin network to assist in peer discovery.

**Not to be confused with:** HD wallet seeds

## Double spend {#double-spend}

A transaction that uses the same input as an already broadcast transaction. The attempt of duplication, deceit, or conversion, will be adjudicated when only one of the transactions is recorded in the blockchain.

## Escrow contract {#escrow-contract}

A transaction in which a spender and receiver place funds in a 2-of-2 (or other m-of-n) multisig output so that neither can spend the funds until they're both satisfied with some external outcome.

## Extended key {#extended-key}

In the context of HD wallets, a public key or private key extended with the chain code to allow them to derive child keys.

## Public extended key {#public-extended-key}

See [Extended key](#extended-key).

## Private extended key {#private-extended-key}

See [Extended key](#extended-key).

## Fork {#fork}

When two or more blocks have the same block height, forking the block chain. Typically occurs when two or more miners find blocks at nearly the same time. Can also happen as part of an attack.

**Not to be confused with:** Hard fork (a change in consensus rules that breaks security for nodes that don't upgrade), Soft fork (a change in consensus rules that weakens security for nodes that don't upgrade), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers)

## Genesis block {#genesis-block}

The first block in the ReddCoin block chain.

**Not to be confused with:** Generation transaction (the first transaction in a block)

## Block 0 {#block-0}

See [Genesis block](#genesis-block).

## Hard fork {#hard-fork}

A permanent divergence in the block chain, commonly occurs when non-upgraded nodes can't validate blocks created by upgraded nodes that follow newer consensus rules.

**Not to be confused with:** Fork (a regular fork where all nodes follow the same consensus rules, so the fork is resolved once one chain has more proof of work than another), Soft fork (a temporary divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers

## Hardened extended key {#hardened-extended-key}

A variation on HD wallet extended keys where only the hardened extended private key can derive child keys. This prevents compromise of the chain code plus any private key from putting the whole wallet at risk.

## HD protocol {#hd-protocol}

The Hierarchical Deterministic (HD) key creation and transfer protocol (BIP32), which allows creating child keys from parent keys in a hierarchy. Wallets using the HD protocol are called HD wallets.

## HD wallet {#hd-wallet}

See [HD protocol](#hd-protocol).

## HD wallet seed {#hd-wallet-seed}

A potentially-short value used as a seed to generate the master private key and master chain code for an HD wallet.

**Not to be confused with:** Mnemonic code / mnemonic seed (a binary root seed formatted as words to make it easier for humans to transcribe and possibly remember)

## Root seed {#root-seed}

See [HD wallet seed](#hd-wallet-seed).

## Header chain {#header-chain}

A chain of block headers with each header linking to the header that preceded it; the most-difficult-to-recreate chain is the best header chain

**Not to be confused with:** Block chain

## Best header chain {#best-header-chain}

See [Header chain](#header-chain).

## Headers-first sync {#headers-first-sync}

Synchronizing the block chain by downloading block headers before downloading the full blocks.

**Not to be confused with:** Blocks-first sync (Downloading entire blocks immediately without first getting their headers)

## High-priority transaction {#high-priority-transaction}

Transactions that don't have to pay a transaction fee because their inputs have been idle long enough to accumulated large amounts of priority. Note: miners choose whether to accept free transactions.

## Free transaction {#free-transaction}

See [High-priority transaction](#high-priority-transaction).

## Initial block download {#initial-block-download}

The process used by a new node (or long-offline node) to download a large number of blocks to catch up to the tip of the best block chain.

**Not to be confused with:** Blocks-first sync (syncing includes getting any amount of blocks; IBD is only used for large numbers of blocks)

## IBD {#ibd}

See [Initial block download](#initial-block-download).

## Input {#input}

An input in a transaction which contains three fields: an outpoint, a signature script, and a sequence number. The outpoint references a previous output and the signature script allows spending it.

## TxIn {#txin}

See [Input](#input).

## Internal byte order {#internal-byte-order}

The standard order in which hash digests are displayed as strings---the same format used in serialized blocks and transactions.

**Not to be confused with:** RPC byte order (where the byte order is reversed)

## Inventory {#inventory}

A data type identifier and a hash; used to identify transactions and blocks available for download through the ReddCoin P2P network.

**Not to be confused with:** Inv message (one of the P2P messages that transmits inventories)

## Locktime {#locktime}

Part of a transaction which indicates the earliest time or earliest block when that transaction may be added to the block chain.

## nLockTime {#nlocktime}

See [Locktime](#locktime).

## Mainnet {#mainnet}

The original and main network for ReddCoin transactions, where reddoshis have real economic value.

**Not to be confused with:** Testnet (an open network very similar to mainnet where reddoshis have no value), Regtest (a private testing node similar to testnet)

## Transaction malleability {#transaction-malleability}

The ability of someone to change (mutate) unconfirmed transactions without making them invalid, which changes the transaction's txid, making child transactions invalid.

**Not to be confused with:** BIP62 (a proposal for an optional new transaction version that reduces the set of known mutations for common transactions)

## Transaction mutability {#transaction-mutability}

See [Transaction malleability](#transaction-malleability).

## Miner-activated soft fork {#miner-activated-soft-fork}

A Soft Fork activated by through miner signalling.

**Not to be confused with:** User Activated Soft Fork (a soft fork activated by flag day or node enforcement instead of miner signalling.), Fork (a regular fork where all nodes follow the same consensus rules, so the fork is resolved once one chain has more proof of work than another), Hard fork (a permanent divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Soft fork (a temporary divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers

## MASF {#masf}

See [Miner-activated soft fork](#miner-activated-soft-fork).

## Master chain code {#master-chain-code}

In HD wallets, the master chain code and master private key are the two pieces of data derived from the root seed.

## Master private key {#master-private-key}

See [Master chain code](#master-chain-code).

## Merkle block {#merkle-block}

A partial merkle tree connecting transactions matching a bloom filter to the merkle root of a block.

**Not to be confused with:** MerkleBlock message (a P2P protocol message that transmits a merkle block)

## Merkle root {#merkle-root}

The root node of a merkle tree, a descendant of all the hashed pairs in the tree. Block headers must include a valid merkle root descended from all transactions in that block.

**Not to be confused with:** Merkle tree (the tree of which the merkle root is the root node), Merkle block (a partial merkle branch connecting the root to one or more leaves [transactions])

## Merkle tree {#merkle-tree}

A tree constructed by hashing paired data (the leaves), then pairing and hashing the results until a single hash remains, the merkle root. In ReddCoin, the leaves are almost always transactions from a single block.

**Not to be confused with:** Partial merkle branch (a branch connecting one or more leaves to the root), Merkle block (a partial merkle branch connecting one or more transactions from a single block to the block merkle root)

## Message header {#message-header}

The four header fields prefixed to all messages on the ReddCoin P2P network.

## Minimum relay fee {#minimum-relay-fee}

The minimum transaction fee a transaction must pay (if it isn't a high-priority transaction) for a full node to relay that transaction to other nodes. There is no one minimum relay fee---each node chooses its own policy.

**Not to be confused with:** Transaction fee (the minimum relay fee is a policy setting that filters out transactions with too-low transaction fees)

## Relay fee {#relay-fee}

See [Minimum relay fee](#minimum-relay-fee).

## Mining {#mining}

Mining was the act of creating valid ReddCoin blocks using proof of work during the PoW era (blocks 0–260,799). Since block 260,800, ReddCoin uses Proof of Stake Velocity (PoSV) and blocks are created by stakers instead of miners. See Staking.

## Miner {#miner}

See [Mining](#mining).

## Staking {#staking}

Staking is the act of creating valid ReddCoin blocks under Proof of Stake Velocity (PoSV) by proving ownership of coins with sufficient coin age. Stakers keep their wallet open and connected to the network to participate in block creation and earn staking rewards.

## Staker {#staker}

See [Staking](#staking).

## Proof of Stake Velocity {#proof-of-stake-velocity}

ReddCoin's consensus mechanism, active since block 260,800. PoSV uses a non-linear coin age weighting function (cubic for 0–7 days, logarithmic for 7+ days) to incentivize active network participation (velocity) rather than passive coin hoarding. Stakers earn a 5% annual reward on staked coin-days.

## PoSV {#posv}

See [Proof of Stake Velocity](#proof-of-stake-velocity).

## Coin age {#coin-age}

The time elapsed since coins were last transacted or staked, used to calculate staking weight under PoSV. Coins must reach the minimum stake age (8 hours) before they are eligible to stake, and weight is capped at the maximum stake age (45 days).

## Coinstake transaction {#coinstake-transaction}

The transaction in a PoS block that proves the staker's coin ownership and distributes the staking reward. Identified by having a non-null first input and an empty first output (vout[0]). Analogous to a coinbase transaction in PoW blocks.

## Kimoto Gravity Well {#kimoto-gravity-well}

ReddCoin's difficulty adjustment algorithm. Unlike Bitcoin's 2,016-block adjustment interval, KGW adjusts difficulty every block by taking the running arithmetic mean of past block targets over a sliding window of 360 to 10,080 blocks and scaling it by the ratio of actual to expected elapsed time, targeting a 60-second block time.

## KGW {#kgw}

See [Kimoto Gravity Well](#kimoto-gravity-well).

## Multisig {#multisig}

A pubkey script that provides *n* number of pubkeys and requires the corresponding signature script provide *m* minimum number signatures corresponding to the provided pubkeys.

**Not to be confused with:** P2SH multisig (a multisig script contained inside P2SH), Advanced scripts that require multiple signatures without using OP_CHECKMULTISIG or OP_CHECKMULTISIGVERIFY

## Bare multisig {#bare-multisig}

See [Multisig](#multisig).

## nBits {#nbits}

The target is the threshold below which a block header hash must be in order for the block to be valid, and nBits is the encoded form of the target threshold as it appears in the block header.

**Not to be confused with:** Difficulty (a number measuring the difficulty of finding a header hash relative to the difficulty of finding a header hash with the easiest target)

## Target {#target}

See [nBits](#nbits).

## Node {#node}

A computer that connects to the ReddCoin network.

**Not to be confused with:** Lightweight node, SPV node

## Full node {#full-node}

See [Node](#node).

## Archival node {#archival-node}

See [Node](#node).

## Pruned node {#pruned-node}

See [Node](#node).

## Peer {#peer}

See [Node](#node).

## Null data transaction {#null-data-transaction}

A transaction type relayed and mined by default in ReddCoin Core 0.9.0 and later that adds arbitrary data to a provably unspendable pubkey script that full nodes don't have to store in their UTXO database.

**Not to be confused with:** OP_RETURN (an opcode used in one of the outputs in an OP_RETURN transaction)

## OP_RETURN transaction {#op-return-transaction}

See [Null data transaction](#null-data-transaction).

## Data carrier transaction {#data-carrier-transaction}

See [Null data transaction](#null-data-transaction).

## Opcode {#opcode}

Operation codes from the ReddCoin Script language which push data or perform functions within a pubkey script or signature script.

## Data-pushing opcode {#data-pushing-opcode}

See [Opcode](#opcode).

## Non-data-pushing opcode {#non-data-pushing-opcode}

See [Opcode](#opcode).

## Orphan block {#orphan-block}

Blocks whose parent block has not been processed by the local node, so they can't be fully validated yet.

**Not to be confused with:** Stale block

## Outpoint {#outpoint}

The data structure used to refer to a particular transaction output, consisting of a 32-byte TXID and a 4-byte output index number (vout).

**Not to be confused with:** Output (an entire output from a transaction), TxOut (same as output)

## Output {#output}

An output in a transaction which contains two fields: a value field for transferring zero or more reddoshis and a pubkey script for indicating what conditions must be fulfilled for those reddoshis to be further spent.

**Not to be confused with:** Outpoint (a reference to a particular output)

## TxOut {#txout}

See [Output](#output).

## P2PKH address {#p2pkh-address}

A ReddCoin payment address comprising a hashed public key, allowing the spender to create a standard pubkey script that Pays To PubKey Hash (P2PKH).

**Not to be confused with:** P2PK output (an output paying a public key directly), P2SH address, P2SH output (an address comprising a hashed script, and its corresponding output)

## P2PKH output {#p2pkh-output}

See [P2PKH address](#p2pkh-address).

## P2SH address {#p2sh-address}

A ReddCoin payment address comprising a hashed script, allowing the spender to create a standard pubkey script that Pays To Script Hash (P2SH). The script can be almost any valid pubkey script.

**Not to be confused with:** P2PK output (an output paying a public key directly), P2PKH address, P2PKH output (an address comprising a hashed pubkey, and its corresponding output), P2SH multisig (a particular instance of P2SH where the script uses a multisig opcode)

## P2SH output {#p2sh-output}

See [P2SH address](#p2sh-address).

## P2SH multisig {#p2sh-multisig}

A P2SH output where the redeem script uses one of the multisig opcodes. Up until ReddCoin Core 0.10.0, P2SH multisig scripts were standard transactions, but most other P2SH scripts were not.

**Not to be confused with:** Multisig pubkey scripts (also called "bare multisig", these multisig scripts don't use P2SH encapsulation), P2SH (general P2SH, of which P2SH multisig is a specific instance that was special cased up until ReddCoin Core 0.10.0)

## Parent key {#parent-key}

In HD wallets, a key used to derive child keys. The key can be either a private key or a public key, and the key derivation may also require a chain code.

**Not to be confused with:** Public key (derived from a private key, not a parent key)

## Parent public key {#parent-public-key}

See [Parent key](#parent-key).

## Parent private key {#parent-private-key}

See [Parent key](#parent-key).

## Payment protocol {#payment-protocol}

The deprecated protocol defined in BIP70 (and other BIPs) which lets spenders get signed payment details from receivers.

**Not to be confused with:** IP-to-IP payment protocol (an insecure, discontinued protocol included in early versions of ReddCoin)

## Payment request {#payment-request}

See [Payment protocol](#payment-protocol).

## Private key {#private-key}

The private portion of a keypair which can create signatures that other people can verify using the public key.

**Not to be confused with:** Public key (data derived from the private key), Parent key (a key used to create child keys, not necessarily a private key)

## Proof of work {#proof-of-work}

A hash below a target value which can only be obtained, on average, by performing a certain amount of brute force work---therefore demonstrating proof of work.

## POW {#pow}

See [Proof of work](#proof-of-work).

## Pubkey script {#pubkey-script}

A script included in outputs which sets the conditions that must be fulfilled for those reddoshis to be spent. Data for fulfilling the conditions can be provided in a signature script. Pubkey Scripts are called a scriptPubKey in code.

**Not to be confused with:** Pubkey (a public key, which can be used as part of a pubkey script but don't provide a programmable authentication mechanism), Signature script (a script that provides data to the pubkey script)

## ScriptPubKey {#scriptpubkey}

See [Pubkey script](#pubkey-script).

## Public key {#public-key}

The public portion of a keypair which can be used to verify signatures made with the private portion of the keypair.

**Not to be confused with:** Private key (data from which the public key is derived), Parent key (a key used to create child keys, not necessarily a public key)

## Replace by fee {#replace-by-fee}

Replacing one version of an unconfirmed transaction with a different version of the transaction that pays a higher transaction fee. May use BIP125 signaling.

**Not to be confused with:** Child pays for parent, CPFP

## RBF {#rbf}

See [Replace by fee](#replace-by-fee).

## Opt-in replace by fee {#opt-in-replace-by-fee}

See [Replace by fee](#replace-by-fee).

## Redeem script {#redeem-script}

A script similar in function to a pubkey script. One copy of it is hashed to create a P2SH address (used in an actual pubkey script) and another copy is placed in the spending signature script to enforce its conditions.

**Not to be confused with:** Signature script (a script that provides data to the pubkey script, which includes the redeem script in a P2SH input)

## RedeemScript {#redeemscript}

See [Redeem script](#redeem-script).

## Regtest {#regtest}

A local testing environment in which developers can almost instantly generate blocks on demand for testing events, and can create private reddoshis with no real-world value.

**Not to be confused with:** Testnet (a global testing environment which mostly mimics mainnet)

## Regression test mode {#regression-test-mode}

See [Regtest](#regtest).

## RPC byte order {#rpc-byte-order}

A hash digest displayed with the byte order reversed; used in ReddCoin Core RPCs, many block explorers, and other software.

**Not to be confused with:** Internal byte order (hash digests displayed in their typical order; used in serialized blocks and serialized transactions)

## Sequence number {#sequence-number}

Part of all transactions. A number intended to allow unconfirmed time-locked transactions to be updated before being finalized; not currently used except to disable locktime in a transaction

**Not to be confused with:** Output index number / vout (this is the 0-indexed number of an output within a transaction used by a later transaction to refer to that specific output)

## Serialized block {#serialized-block}

A complete block in its binary format---the same format used to calculate total block byte size; often represented using hexadecimal.

## Serialized transaction {#serialized-transaction}

Complete transactions in their binary format; often represented using hexadecimal. Sometimes called raw format because of the various ReddCoin Core commands with "raw" in their names.

## Raw transaction {#raw-transaction}

See [Serialized transaction](#serialized-transaction).

## SIGHASH_ALL {#sighash-all}

Default signature hash type which signs the entire transaction except any signature scripts, preventing modification of the signed parts.

## SIGHASH_ANYONECANPAY {#sighash-anyonecanpay}

A signature hash type which signs only the current input.

**Not to be confused with:** SIGHASH_SINGLE (which signs this input, its corresponding output, and other inputs partially)

## SIGHASH_NONE {#sighash-none}

Signature hash type which only signs the inputs, allowing anyone to change the outputs however they'd like.

## SIGHASH_SINGLE {#sighash-single}

Signature hash type that signs the output corresponding to this input (the one with the same index value), this input, and any other inputs partially. Allows modification of other outputs and the sequence number of other inputs.

**Not to be confused with:** SIGHASH_ANYONECANPAY (a flag to signature hash types that only signs this single input)

## Signature {#signature}

A value related to a public key which could only have reasonably been created by someone who has the private key that created that public key. Used in ReddCoin to authorize spending reddoshis previously sent to a public key.

## Signature hash {#signature-hash}

A flag to ReddCoin signatures that indicates what parts of the transaction the signature signs. (The default is SIGHASH_ALL.) The unsigned parts of the transaction may be modified.

**Not to be confused with:** Signed hash (a hash of the data to be signed), Transaction malleability / transaction mutability (although non-default sighash flags do allow optional malleability, malleability comprises any way a transaction may be mutated)

## Sighash {#sighash}

See [Signature hash](#signature-hash).

## Signature script {#signature-script}

Data generated by a spender which is almost always used as variables to satisfy a pubkey script. Signature Scripts are called scriptSig in code.

**Not to be confused with:** ECDSA signature (a signature, which can be used as part of a pubkey script in addition to other data)

## ScriptSig {#scriptsig}

See [Signature script](#signature-script).

## SPV {#spv}

A method for verifying if particular transactions are included in a block without downloading the entire block. The method is used by some lightweight ReddCoin clients.

## Simplified Payment Verification {#simplified-payment-verification}

See [SPV](#spv).

## Lightweight client {#lightweight-client}

See [SPV](#spv).

## Thin client {#thin-client}

See [SPV](#spv).

## Soft fork {#soft-fork}

A softfork is a change to the reddcoin protocol wherein only previously valid blocks/transactions are made invalid. Since old nodes will recognise the new blocks as valid, a softfork is backward-compatible.

**Not to be confused with:** Fork (a regular fork where all nodes follow the same consensus rules, so the fork is resolved once one chain has more proof of work than another), Hard fork (a permanent divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers

## Stale block {#stale-block}

Blocks which were successfully mined but which aren't included on the current best block chain, likely because some other block at the same height had its chain extended first.

**Not to be confused with:** Orphan block (a block whose previous (parent) hash field points to an unknown block, meaning the orphan can't be validated)

## Standard Transaction {#standard-transaction}

A transaction that passes ReddCoin Core's IsStandard() and IsStandardTx() tests. Only standard transactions are mined or broadcast by peers running the default ReddCoin Core software.

## Start string {#start-string}

Four defined bytes which start every message in the ReddCoin P2P protocol to allow seeking to the next message.

## Network magic {#network-magic}

See [Start string](#start-string).

## Testnet {#testnet}

A global testing environment in which developers can obtain and spend reddoshis that have no real-world value on a network that is very similar to the ReddCoin mainnet.

**Not to be confused with:** Regtest (a local testing environment where developers can control block generation)

## Token {#token}

A token is a programmable digital asset with its own codebase that resides on an already existing block chain. Tokens are used to help facilitate the creation of decentralized applications.

**Not to be confused with:** Reddcoins, Reddoshis, Security token, Denominations

## Transaction fee {#transaction-fee}

The amount remaining when the value of all outputs in a transaction are subtracted from all inputs in a transaction; the fee is paid to the miner who includes that transaction in a block.

**Not to be confused with:** Minimum relay fee (the lowest fee a transaction must pay to be accepted into the memory pool and relayed by ReddCoin Core nodes)

## Miners fee {#miners-fee}

See [Transaction fee](#transaction-fee).

## Txid {#txid}

An identifier used to uniquely identify a particular transaction; specifically, the sha256d hash of the transaction.

**Not to be confused with:** Outpoint (the combination of a txid with a vout used to identify a specific output)

## User-activated soft fork {#user-activated-soft-fork}

A Soft Fork activated by flag day or node enforcement instead of miner signalling.

**Not to be confused with:** Miner Activated Soft Fork (a soft fork activated through miner signalling), Fork (a regular fork where all nodes follow the same consensus rules, so the fork is resolved once one chain has more proof of work than another), Hard fork (a permanent divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Soft fork (a temporary divergence in the block chain caused by non-upgraded nodes not following new consensus rules), Software fork (when one or more developers permanently develops a codebase separately from other developers), Git fork (when one or more developers temporarily develops a codebase separately from other developers

## UASF {#uasf}

See [User-activated soft fork](#user-activated-soft-fork).

## UTXO {#utxo}

An Unspent Transaction Output (UTXO) that can be spent as an input in a new transaction.

**Not to be confused with:** Output (any output, whether spent or not. Outputs are a superset of UTXOs)

## Wallet {#wallet}

Software that stores private keys and monitors the block chain (sometimes as a client of a server that does the processing) to allow users to spend and receive reddoshis.

**Not to be confused with:** HD wallet (a protocol that allows all of a wallet's keys to be created from a single seed)

## WIF {#wif}

A data interchange format designed to allow exporting and importing a single private key with a flag indicating whether or not it uses a compressed public key.

**Not to be confused with:** Extended private keys (which allow importing a hierarchy of private keys)

## Wallet Import Format {#wallet-import-format}

See [WIF](#wif).

## Watch-only address {#watch-only-address}

An address or pubkey script stored in the wallet without the corresponding private key, allowing the wallet to watch for outputs but not spend them.

## ReddCoin URI {#reddcoin-uri}

A URI which allows receivers to encode payment details so spenders don't have to manually enter addresses and other details.

## Certificate chain {#certificate-chain}

A chain of certificates connecting a individual's leaf certificate to the certificate authority's root certificate.

## Coinbase block height {#coinbase-block-height}

The current block's height encoded into the first bytes of the coinbase field.

## Fiat {#fiat}

National currencies such as the dollar or euro.

## Intermediate certificate {#intermediate-certificate}

A intermediate certificate authority certificate which helps connect a leaf (receiver) certificate to a root certificate authority.

## Key index {#key-index}

An index number used in the HD wallet formula to generate child keys from a parent key.

## Key pair {#key-pair}

A private key and its derived public key.

## Label {#label}

The label parameter of a reddcoin: URI which provides the spender with the receiver's name (unauthenticated).

## Leaf certificate {#leaf-certificate}

The end-node in a certificate chain; in the payment protocol, it is the certificate belonging to the receiver of reddoshis.

## Merge {#merge}

Spending, in the same transaction, multiple outputs which can be traced back to different previous spenders, leaking information about how many reddoshis you control.

## Merge avoidance {#merge-avoidance}

A strategy for selecting which outputs to spend that avoids merging outputs with different histories that could leak private information.

## Message {#message}

A parameter of reddcoin: URIs which allows the receiver to optionally specify a message to the spender.

## Micropayment channel {#micropayment-channel}

term-micropayment-channel (contracts-guide) ([original target](https://reddcoin.com/en/contracts-guide#term-micropayment-channel))

## OP CHECKMULTISIG {#op-checkmultisig}

Opcode which returns true if one or more provided signatures (m) sign the correct parts of a transaction and match one or more provided public keys (n).

## Output index {#output-index}

The sequentially-numbered index of outputs in a single transaction starting from 0.

## PKI {#pki}

Public Key Infrastructure; usually meant to indicate the X.509 certificate system used for HTTP Secure (https).

## Point function {#point-function}

The ECDSA function used to create a public key from a private key.

## PP amount {#pp-amount}

Part of the Output part of the PaymentDetails part of a payment protocol where receivers can specify the amount of reddoshis they want paid to a particular pubkey script.

## PP expires {#pp-expires}

The expires field of a PaymentDetails where the receiver tells the spender when the PaymentDetails expires.

## PP memo {#pp-memo}

The memo fields of PaymentDetails, Payment, and PaymentACK which allow spenders and receivers to send each other memos.

## PP merchant data {#pp-merchant-data}

The merchant_data part of PaymentDetails and Payment which allows the receiver to send arbitrary data to the spender in PaymentDetails and receive it back in Payments.

## PP pki data {#pp-pki-data}

The pki_data field of a PaymentRequest which provides details such as certificates necessary to validate the request.

## PP pki type {#pp-pki-type}

The PKI field of a PaymentRequest which tells spenders how to validate this request as being from a specific recipient.

## PP script {#pp-script}

The script field of a PaymentDetails where the receiver tells the spender what pubkey scripts to pay.

## Previous block header hash {#previous-block-header-hash}

A field in the block header which contains the SHA256(SHA256()) hash of the previous block's header.

## R parameter {#r-parameter}

The payment request parameter in a reddcoin: URI.

## Receipt {#receipt}

A cryptographically-verifiable receipt created using parts of a payment request and a confirmed transaction.

## Root certificate {#root-certificate}

A certificate belonging to a certificate authority (CA).

## SSL signature {#ssl-signature}

Signatures created and recognized by major SSL implementations such as OpenSSL.

## Stanndard block relay {#stanndard-block-relay}

The regular block relay method: announcing a block with an inv message and waiting for a response.

## Transaction version number {#transaction-version-number}

A version number prefixed to transactions to allow upgrading.

## Unique Address {#unique-address}

Address which are only used once to protect privacy and increase security.

## Unsolicited block push {#unsolicited-block-push}

When a miner sends a block message without sending an inv message first.

## URI qr code {#uri-qr-code}

A QR code containing a reddcoin: URI.

## V2 block {#v2-block}

The current version of ReddCoin blocks.

## x509certificates {#x509certificates}

term-x509certificates (developer-examples) ([original target](https://reddcoin.com/en/developer-examples#term-x509certificates))
:::

## [term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork. {#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork}



## [term-msg_cmpct_block]: AnalternativetotheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetworkusedtorequestacompactblock. {#term-msg-cmpct-block-analternativetotheblockheaderhashdatatypeidentifierofaninventoryonthep2pnetworkusedtorequestacompactblock}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-msg_filtered_witness_block]: AnalternativetotheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetworkthatisreservedforfutureuseandunused. {#term-msg-filtered-witness-block-analternativetotheblockheaderhashdatatypeidentifierofaninventoryonthep2pnetworkthatisreservedforfutureuseandunused}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-msg_tx]: TheTXIDdatatypeidentifierofaninventoryontheP2Pnetwork. {#term-msg-tx-thetxiddatatypeidentifierofaninventoryonthep2pnetwork}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-msg_witness_block]: AnalternativetotheblockheaderhashdatatypeidentifierofaninventoryontheP2PnetworkusedtorequestablockwithwitnessserializationforSegWit. {#term-msg-witness-block-analternativetotheblockheaderhashdatatypeidentifierofaninventoryonthep2pnetworkusedtorequestablockwithwitnessserializationforsegwit}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-msg_witness_tx]: AnalternativeofthetransactiondatatypeidentifierofaninventoryontheP2PnetworkusedtorequestatransactionwithwitnessserializationforSegWit. {#term-msg-witness-tx-analternativeofthetransactiondatatypeidentifierofaninventoryonthep2pnetworkusedtorequestatransactionwithwitnessserializationforsegwit}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-op-checksig]: Opcodewhichreturnstrueifasignaturesignsthecorrectpartsofatransactionandmatchesaprovidedpublickey. {#term-op-checksig-opcodewhichreturnstrueifasignaturesignsthecorrectpartsofatransactionandmatchesaprovidedpublickey}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-op-dup]: Operationwhichduplicatestheentrybelowitonthestack. {#term-op-dup-operationwhichduplicatestheentrybelowitonthestack}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-op-equal]: Operationwhichreturnstrueifthetwoentriesbelowitonthestackareequivalent. {#term-op-equal-operationwhichreturnstrueifthetwoentriesbelowitonthestackareequivalent}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-op-equalverify]: Operationwhichterminatesthescriptinfailureunlessthetwoentriesbelowitonthestackareequivalent. {#term-op-equalverify-operationwhichterminatesthescriptinfailureunlessthetwoentriesbelowitonthestackareequivalent}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-op-hash160]: OperationwhichconvertstheentrybelowitonthestackintoaRIPEMD(SHA256())hashedversionofitself. {#term-op-hash160-operationwhichconvertstheentrybelowitonthestackintoaripemd-sha256-hashedversionofitself}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-op-return]: Operationwhichterminatesthescriptinfailure. {#term-op-return-operationwhichterminatesthescriptinfailure}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-op-verify]: Operationwhichterminatesthescriptiftheentrybelowitonthestackisnon-true(zero). {#term-op-verify-operationwhichterminatesthescriptiftheentrybelowitonthestackisnon-true-zero}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-paymentdetails]: ThePaymentDetailsofthepaymentprotocolwhichallowsthereceivertospecifythepaymentdetailstothespender. {#term-paymentdetails-thepaymentdetailsofthepaymentprotocolwhichallowsthereceivertospecifythepaymentdetailstothespender}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).

## [term-paymentrequest]: ThePaymentRequestofthepaymentprotocolwhichcontainsandallowssigningofthePaymentDetails. {#term-paymentrequest-thepaymentrequestofthepaymentprotocolwhichcontainsandallowssigningofthepaymentdetails}

See [[term-msg_block]: TheblockheaderhashdatatypeidentifierofaninventoryontheP2Pnetwork.](#term-msg-block-theblockheaderhashdatatypeidentifierofaninventoryonthep2pnetwork).
