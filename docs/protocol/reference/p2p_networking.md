---
substitutions:
  Warning icon: |-
    ```{image} /img/protocol/icons/icon_warning.svg
    ```
---

# P2P Network

This section describes the ReddCoin P2P [network](../devguide/p2p_network) protocol (but it is [not a specification](../reference/intro#not-a-specification)). It does not describe the discontinued direct [IP-to-IP payment protocol](https://en.bitcoin.it/wiki/IP_Transactions), the [deprecated BIP70 payment protocol](/glossary/#payment-protocol), the [GetBlockTemplate mining protocol](../devguide/mining#getblocktemplate-rpc), or any [network](../devguide/p2p_network) protocol never implemented in an official version of ReddCoin Core.

All [peer-to-peer](../devguide/p2p_network) communication occurs entirely over TCP.

**Note:** unless their description says otherwise, all multi-byte integers mentioned in this section are transmitted in little-endian order.

## Constants And Defaults

The following constants and defaults are taken from ReddCoin Core’s [chainparams.cpp](https://github.com/reddcoin-project/reddcoin/blob/master/src/chainparams.cpp) source code file.

| [Network](../devguide/p2p_network) | Default Port | [Start String](/glossary/#start-string) | Max nBits  |
| --------------------------------------- | ------------ | ----------------------------------- | ---------- |
| Mainnet                                 | 45444        | 0xfbc0b6db                          | 0x1e0fffff |
| Testnet                                 | 55444        | 0xfec3b9de                          | 0x1e0fffff |
| Regtest                                 | 56444        | 0xfabfb5da                          | 0x207fffff |

Command line parameters can change what port a node listens on (see `-help`). Start strings are hardcoded constants that appear at the start of all messages sent on the ReddCoin [network](../devguide/p2p_network); they may also appear in data files such as ReddCoin Core’s block database. The nBits displayed above are in big-endian order; they’re sent over the [network](../devguide/p2p_network) in little-endian order.

ReddCoin Core’s [chainparams.cpp](https://github.com/reddcoin-project/reddcoin/blob/master/src/chainparams.cpp) also includes other constants useful to programs, such as the hash of the genesis blocks for the different networks.

## Protocol Versions

The table below lists some notable versions of the P2P [network](../devguide/p2p_network) protocol, with the most recent versions listed first. (If you know of a protocol version that implemented a major change but which is not listed here, please [open an issue](https://github.com/reddcoin-project/reddcoin/issues).)

As of ReddCoin Core 0.18.0, the most recent protocol version is 70015.

## Message Headers

All messages in the [network](../devguide/p2p_network) protocol use the same container format, which provides a required multi-field message header and an optional payload. The message header format is:

The following example is an annotated hex dump of a mainnet message header from a [“verack” message](../reference/p2p_networking#verack) which has no payload.

```
f9beb4d9 ................... Start string: Mainnet
76657261636b000000000000 ... Command name: verack + null padding
00000000 ................... Byte count: 0
5df6e0e2 ................... Checksum: SHA256(SHA256(<empty>))
```

## Data Messages

The following [network](../devguide/p2p_network) messages all request or provide data related to transactions and blocks.

![Overview Of P2P Protocol Data Request And Reply Messages](/img/protocol/dev/en-p2p-data-messages.svg)

Overview Of P2P Protocol Data Request And Reply Messages
Many of the data messages use [inventories](/glossary/#inventory) as unique identifiers for transactions and blocks. Inventories have a simple 36-byte structure:

| Bytes | Name            | Data Type | Description                                                              |
| ----- | --------------- | --------- | ------------------------------------------------------------------------ |
| 4     | type identifier | uint32_t  | The type of object which was hashed. See list of type identifiers below. |
| 32    | hash            | char[32]  | SHA256(SHA256()) hash of the object in internal byte order.              |

The currently-available type identifiers are:

| Type Identifier | Name                                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1               | “MSG_TX”                                         | The hash is a TXID.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2               | “MSG_BLOCK”                                   | The hash is of a block header.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 3               | “MSG_FILTERED_BLOCK”                          | The hash is of a block header; identical to “MSG_BLOCK”. When used in a [“getdata” message](../reference/p2p_networking#getdata), this indicates the response should be a [“merkleblock” message](../reference/p2p_networking#merkleblock) rather than a [“block” message](../reference/p2p_networking#block) (but this only works if a bloom filter was previously configured). **Only for use in**[“getdata” messages](../reference/p2p_networking#getdata)**.** |
| 4               | “MSG_CMPCT_BLOCK”                       | The hash is of a block header; identical to “MSG_BLOCK”. When used in a [“getdata” message](../reference/p2p_networking#getdata), this indicates the response should be a [“cmpctblock” message](../reference/p2p_networking#cmpctblock). **Only for use in**[“getdata” messages](../reference/p2p_networking#getdata)**.**                                                                                                                                             |
| 1†              | “MSG_WITNESS_TX”                         | The hash is a TXID. When used in a [“getdata” message](../reference/p2p_networking#getdata), this indicates the response should be a transaction message, if the witness structure is nonempty, the witness serialization will be used. **Only for use in**[“getdata” messages](../reference/p2p_networking#getdata)**.**                                                                                                                                                                            |
| 2†              | “MSG_WITNESS_BLOCK”                   | The hash is of a block header; identical to “MSG_BLOCK”. When used in a [“getdata” message](../reference/p2p_networking#getdata), this indicates the response should be a block message with transactions that have a witness using witness serialization. **Only for use in**[“getdata” messages](../reference/p2p_networking#getdata)**.**                                                                                                                                 |
| 3†              | “MSG_FILTERED_WITNESS_BLOCK” | Reserved for future use, not used as of [Protocol Version 70015](../reference/p2p_networking#protocol-versions).                                                                                                                                                                                                                                                                                                                                                                                          |

† These are the same as their respective type identifier but with their 30th bit set to indicate witness. For example MSG_WITNESS_TX = 0x01000040.

Type identifier zero and type identifiers greater than seven are reserved for future implementations. ReddCoin Core ignores all inventories with one of these unknown types.

### Block

The [“block” message](../reference/p2p_networking#block) transmits a single serialized block in the format described in the [serialized blocks section](../reference/block_chain#serialized-blocks). See that section for an example hexdump. It can be sent for two different reasons:

1. **GetData Response:** Nodes will always send it in response to a [“getdata” message](../reference/p2p_networking#getdata) that requests the block with an inventory type of “MSG_BLOCK” (provided the node has that block available for relay).
2. **Unsolicited:** Some miners will send unsolicited [“block” messages](../reference/p2p_networking#block) broadcasting their newly-mined blocks to all of their peers. Many mining pools do the same thing, although some may be misconfigured to send the block from multiple nodes, possibly sending the same block to some peers more than once.

### GetBlocks

The [“getblocks” message](../reference/p2p_networking#getblocks) requests an [“inv” message](../reference/p2p_networking#inv) that provides block header hashes starting from a particular point in the block chain. It allows a peer which has been disconnected or started for the first time to get the data it needs to request the blocks it hasn’t seen.

Peers which have been disconnected may have stale blocks in their locally-stored block chain, so the [“getblocks” message](../reference/p2p_networking#getblocks) allows the requesting peer to provide the receiving peer with multiple header hashes at various heights on their local chain. This allows the receiving peer to find, within that list, the last header hash they had in common and reply with all subsequent header hashes.

Note: the receiving peer itself may respond with an [“inv” message](../reference/p2p_networking#inv) containing header hashes of stale blocks. It is up to the requesting peer to poll all of its peers to find the best block chain.

If the receiving peer does not find a common header hash within the list, it will assume the last common block was the genesis block (block zero), so it will reply with in [“inv” message](../reference/p2p_networking#inv) containing header hashes starting with block one (the first block after the genesis block).

The following annotated hexdump shows a [“getblocks” message](../reference/p2p_networking#getblocks). (The message header has been omitted.)

```
71110100 ........................... Protocol version: 70001
02 ................................. Hash count: 2

d39f608a7775b537729884d4e6633bb2
105e55a16a14d31b0000000000000000 ... Hash #1

5c3e6403d40837110a2e8afb602b1c01
714bda7ce23bea0a0000000000000000 ... Hash #2

00000000000000000000000000000000
00000000000000000000000000000000 ... Stop hash
```

### GetData

The [“getdata” message](../reference/p2p_networking#getdata) requests one or more data objects from another node. The objects are requested by an inventory, which the requesting node typically received previously by way of an [“inv” message](../reference/p2p_networking#inv).

The response to a [“getdata” message](../reference/p2p_networking#getdata) can be a [“tx” message](../reference/p2p_networking#tx), [“block” message](../reference/p2p_networking#block), [“merkleblock” message](../reference/p2p_networking#merkleblock), [“cmpctblock” message](../reference/p2p_networking#cmpctblock), or [“notfound” message](../reference/p2p_networking#notfound).

This message cannot be used to request arbitrary data, such as historic transactions no longer in the memory pool or relay set. Full nodes may not even be able to provide older blocks if they’ve pruned old transactions from their block database. For this reason, the [“getdata” message](../reference/p2p_networking#getdata) should usually only be used to request data from a node which previously advertised it had that data by sending an [“inv” message](../reference/p2p_networking#inv).

The format and maximum size limitations of the [“getdata” message](../reference/p2p_networking#getdata) are identical to the [“inv” message](../reference/p2p_networking#inv); only the message header differs.

### GetHeaders

*Added in*[protocol version 31800](../reference/p2p_networking#protocol-versions)*.*

The [“getheaders” message](../reference/p2p_networking#getheaders) requests a [“headers” message](../reference/p2p_networking#headers) that provides block headers starting from a particular point in the block chain. It allows a peer which has been disconnected or started for the first time to get the headers it hasn’t seen yet.

The [“getheaders” message](../reference/p2p_networking#getheaders) is nearly identical to the [“getblocks” message](../reference/p2p_networking#getblocks), with one minor difference: the `inv` reply to the [“getblocks” message](../reference/p2p_networking#getblocks) will include no more than 500 block header hashes; the `headers` reply to the [“getheaders” message](../reference/p2p_networking#getheaders) will include as many as 2,000 block headers.

### Headers

*Added in*[protocol version 31800](../reference/p2p_networking#protocol-versions)*.*

The [“headers” message](../reference/p2p_networking#headers) sends block headers to a node which previously requested certain headers with a [“getheaders” message](../reference/p2p_networking#getheaders). A headers message can be empty.

| Bytes    | Name    | Data Type        | Description                                                                                                                                                                                                                                                                                                                          |
| -------- | ------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| *Varies* | count   | compactSize uint | Number of block headers up to a maximum of 2,000. Note: headers-first sync assumes the sending node will send the maximum number of headers whenever possible.                                                                                                                                                                       |
| *Varies* | headers | block_header     | Block headers: each 80-byte block header is in the format described in the [block headers section](../reference/block_chain#block-headers) with an additional 0x00 suffixed. This 0x00 is called the transaction count, but because the headers message doesn’t include any transactions, the transaction count is always zero. |

The following annotated hexdump shows a [“headers” message](../reference/p2p_networking#headers). (The message header has been omitted.)

```
01 ................................. Header count: 1

02000000 ........................... Block version: 2
b6ff0b1b1680a2862a30ca44d346d9e8
910d334beb48ca0c0000000000000000 ... Hash of previous block's header
9d10aa52ee949386ca9385695f04ede2
70dda20810decd12bc9b048aaab31471 ... Merkle root
24d95a54 ........................... [Unix time][unix epoch time]: 1415239972
30c31b18 ........................... Target (bits)
fe9f0864 ........................... Nonce

00 ................................. Transaction count (0x00)
```

### Inv

The [“inv” message](../reference/p2p_networking#inv) (inventory message) transmits one or more inventories of objects known to the transmitting peer. It can be sent unsolicited to announce new transactions or blocks, or it can be sent in reply to a [“getblocks” message](../reference/p2p_networking#getblocks) or [“mempool” message](../reference/p2p_networking#mempool).

The receiving peer can compare the inventories from an [“inv” message](../reference/p2p_networking#inv) against the inventories it has already seen, and then use a follow-up message to request unseen objects.

| Bytes    | Name      | Data Type        | Description                                                      |
| -------- | --------- | ---------------- | ---------------------------------------------------------------- |
| *Varies* | count     | compactSize uint | The number of inventory entries.                                 |
| *Varies* | inventory | inventory        | One or more inventory entries up to a maximum of 50,000 entries. |

The following annotated hexdump shows an [“inv” message](../reference/p2p_networking#inv) with two inventory entries. (The message header has been omitted.)

```
02 ................................. Count: 2

01000000 ........................... Type: MSG_TX
de55ffd709ac1f5dc509a0925d0b1fc4
42ca034f224732e429081da1b621f55a ... Hash (TXID)

01000000 ........................... Type: MSG_TX
91d36d997037e08018262978766f24b8
a055aaf1d872e94ae85e9817b2c68dc7 ... Hash (TXID)
```

### MemPool

*Added in*[protocol version 60002](../reference/p2p_networking#protocol-versions)*.*

The [“mempool” message](../reference/p2p_networking#mempool) requests the TXIDs of transactions that the receiving node has verified as valid but which have not yet appeared in a block. That is, transactions which are in the receiving node’s memory pool. The response to the [“mempool” message](../reference/p2p_networking#mempool) is one or more [“inv” messages](../reference/p2p_networking#inv) containing the TXIDs in the usual inventory format.

Sending the [“mempool” message](../reference/p2p_networking#mempool) is mostly useful when a program first connects to the [network](../devguide/p2p_network). Full nodes can use it to quickly gather most or all of the unconfirmed transactions available on the [network](../devguide/p2p_network); this is especially useful for miners trying to gather transactions for their transaction fees. SPV clients can set a filter before sending a `mempool` to only receive transactions that match that filter; this allows a recently-started client to get most or all unconfirmed transactions related to its wallet.

The `inv` response to the [“mempool” message](../reference/p2p_networking#mempool) is, at best, one node’s view of the [network](../devguide/p2p_network)—not a complete list of unconfirmed transactions on the [network](../devguide/p2p_network). Here are some additional reasons the list might not be complete:

- Before [ReddCoin Core 0.9.0](https://github.com/reddcoin-project/reddcoin/releases), the response to the [“mempool” message](../reference/p2p_networking#mempool) was only one [“inv” message](../reference/p2p_networking#inv). An [“inv” message](../reference/p2p_networking#inv) is limited to 50,000 inventories, so a node with a memory pool larger than 50,000 entries would not send everything. Later versions of ReddCoin Core send as many [“inv” messages](../reference/p2p_networking#inv) as needed to reference its complete memory pool.
- The [“mempool” message](../reference/p2p_networking#mempool) is not currently fully compatible with the [“filterload” message’s](../reference/p2p_networking#filterload) `BLOOM_UPDATE_ALL` and `BLOOM_UPDATE_P2PUBKEY_ONLY` flags. Mempool transactions are not sorted like in-block transactions, so a transaction (tx2) spending an output can appear before the transaction (tx1) containing that output, which means the automatic filter update mechanism won’t operate until the second-appearing transaction (tx1) is seen—missing the first-appearing transaction (tx2). It has been proposed in [ReddCoin Core issue #2381](https://github.com/reddcoin-project/reddcoin/issues/2381) that the transactions should be sorted before being processed by the filter.

There is no payload in a [“mempool” message](../reference/p2p_networking#mempool). See the [message header section](../reference/p2p_networking#message-headers) for an example of a message without a payload.

### MerkleBlock

*Added in*[protocol version 70001](../reference/p2p_networking#protocol-versions)*as described by*[BIP37](https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki)*.*

The [“merkleblock” message](../reference/p2p_networking#merkleblock) is a reply to a [“getdata” message](../reference/p2p_networking#getdata) which requested a block using the inventory type `MSG_MERKLEBLOCK`. It is only part of the reply: if any matching transactions are found, they will be sent separately as [“tx” messages](../reference/p2p_networking#tx).

If a filter has been previously set with the [“filterload” message](../reference/p2p_networking#filterload), the [“merkleblock” message](../reference/p2p_networking#merkleblock) will contain the TXIDs of any transactions in the requested block that matched the filter, as well as any parts of the block’s merkle tree necessary to connect those transactions to the block header’s merkle root. The message also contains a complete copy of the block header to allow the client to hash it and confirm its proof of work.

| Bytes    | Name              | Data Type        | Description                                                                                                                                                                                                                                                   |
| -------- | ----------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 80       | block header      | block_header     | The block header in the format described in the [block header section](../reference/block_chain#block-headers).                                                                                                                                          |
| 4        | transaction count | uint32_t         | The number of transactions in the block (including ones that don’t match the filter).                                                                                                                                                                         |
| *Varies* | hash count        | compactSize uint | The number of hashes in the following field.                                                                                                                                                                                                                  |
| *Varies* | hashes            | char[32]         | One or more hashes of both transactions and merkle nodes in internal byte order. Each hash is 32 bytes.                                                                                                                                                       |
| *Varies* | flag byte count   | compactSize uint | The number of flag bytes in the following field.                                                                                                                                                                                                              |
| *Varies* | flags             | byte[]           | A sequence of bits packed eight in a byte with the least significant bit first. May be padded to the nearest byte boundary but must not contain any more bits than that. Used to assign the hashes to particular nodes in the merkle tree as described below. |

The annotated hexdump below shows a [“merkleblock” message](../reference/p2p_networking#merkleblock) which corresponds to the examples below. (The message header has been omitted.)

```
01000000 ........................... Block version: 1
82bb869cf3a793432a66e826e05a6fc3
7469f8efb7421dc88067010000000000 ... Hash of previous block's header
7f16c5962e8bd963659c793ce370d95f
093bc7e367117b3c30c1f8fdd0d97287 ... Merkle root
76381b4d ........................... Time: 1293629558
4c86041b ........................... nBits: 0x04864c * 256**(0x1b-3)
554b8529 ........................... Nonce

07000000 ........................... Transaction count: 7
04 ................................. Hash count: 4

3612262624047ee87660be1a707519a4
43b1c1ce3d248cbfc6c15870f6c5daa2 ... Hash #1
019f5b01d4195ecbc9398fbf3c3b1fa9
bb3183301d7a1fb3bd174fcfa40a2b65 ... Hash #2
41ed70551dd7e841883ab8f0b16bf041
76b7d1480e4f0af9f3d4c3595768d068 ... Hash #3
20d2a7bc994987302e5b1ac80fc425fe
25f8b63169ea78e68fbaaefa59379bbf ... Hash #4

01 ................................. Flag bytes: 1
1d ................................. Flags: 1 0 1 1 1 0 0 0
```

Note: when fully decoded, the above [“merkleblock” message](../reference/p2p_networking#merkleblock) provided the TXID for a single transaction that matched the filter. In the [network](../devguide/p2p_network) traffic dump this output was taken from, the full transaction belonging to that TXID was sent immediately after the [“merkleblock” message](../reference/p2p_networking#merkleblock) as a [“tx” message](../reference/p2p_networking#tx).

#### Parsing A MerkleBlock Message

As seen in the annotated hexdump above, the [“merkleblock” message](../reference/p2p_networking#merkleblock) provides three special data types: a transaction count, a list of hashes, and a list of one-bit flags.

You can use the transaction count to construct an empty merkle tree. We’ll call each entry in the tree a node; on the bottom are TXID nodes—the hashes for these nodes are TXIDs; the remaining nodes (including the merkle root) are non-TXID nodes—they may actually have the same hash as a TXID, but we treat them differently.

![Example Of Parsing A MerkleBlock Message](/img/protocol/dev/animated-en-merkleblock-parsing.gif)

Example Of Parsing A MerkleBlock Message
Keep the hashes and flags in the order they appear in the [“merkleblock” message](../reference/p2p_networking#merkleblock). When we say “next flag” or “next hash”, we mean the next flag or hash on the list, even if it’s the first one we’ve used so far.

Start with the merkle root node and the first flag. The table below describes how to evaluate a flag based on whether the node being processed is a TXID node or a non-TXID node. Once you apply a flag to a node, never apply another flag to that same node or reuse that same flag again.

| Flag  | TXID Node                                                                                | Non-TXID Node                                                                                                                                                                                                    |
| ----- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0** | Use the next hash as this node’s TXID, but this transaction didn’t match the filter.     | Use the next hash as this node’s hash. Don’t process any descendant nodes.                                                                                                                                       |
| **1** | Use the next hash as this node’s TXID, and mark this transaction as matching the filter. | The hash needs to be computed. Process the left child node to get its hash; process the right child node to get its hash; then concatenate the two hashes as 64 raw bytes and hash them to get this node’s hash. |

Any time you begin processing a node for the first time, evaluate the next flag. Never use a flag at any other time.

When processing a child node, you may need to process its children (the grandchildren of the original node) or further-descended nodes before returning to the parent node. This is expected—keep processing depth first until you reach a TXID node or a non-TXID node with a flag of 0.

After you process a TXID node or a non-TXID node with a flag of 0, stop processing flags and begin to ascend the tree. As you ascend, compute the hash of any nodes for which you now have both child hashes or for which you now have the sole child hash. See the [merkle tree section](../reference/block_chain#merkle-trees) for hashing instructions. If you reach a node where only the left hash is known, descend into its right child (if present) and further descendants as necessary.

However, if you find a node whose left and right children both have the same hash, fail. This is related to [CVE-2012-2459](https://en.bitcoin.it/wiki/CVEs#CVE-2012-2459).

Continue descending and ascending until you have enough information to obtain the hash of the merkle root node. If you run out of flags or hashes before that condition is reached, fail. Then perform the following checks (order doesn’t matter):

- Fail if there are unused hashes in the hashes list.
- Fail if there are unused flag bits—except for the minimum number of bits necessary to pad up to the next full byte.
- Fail if the hash of the merkle root node is not identical to the merkle root in the block header.
- Fail if the block header is invalid. Remember to ensure that the hash of the header is less than or equal to the target threshold encoded by the nBits header field. Your program should also, of course, attempt to ensure the header belongs to the best block chain and that the user knows how many confirmations this block has.

For a detailed example of parsing a [“merkleblock” message](../reference/p2p_networking#merkleblock), please see the corresponding [merkle block examples section](../examples/p2p_networking#parsing-a-merkleblock).

#### Creating A MerkleBlock Message

It’s easier to understand how to create a [“merkleblock” message](../reference/p2p_networking#merkleblock) after you understand how to parse an already-created message, so we recommend you read the parsing section above first.

Create a complete merkle tree with TXIDs on the bottom row and all the other hashes calculated up to the merkle root on the top row. For each transaction that matches the filter, track its TXID node and all of its ancestor nodes.

![Example Of Creating A MerkleBlock Message](/img/protocol/dev/animated-en-merkleblock-creation.gif)

Example Of Creating A MerkleBlock Message
Start processing the tree with the merkle root node. The table below describes how to process both TXID nodes and non-TXID nodes based on whether the node is a match, a match ancestor, or neither a match nor a match ancestor.

|                                      | TXID Node                                                              | Non-TXID Node                                                                                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Neither Match Nor Match Ancestor** | Append a 0 to the flag list; append this node’s TXID to the hash list. | Append a 0 to the flag list; append this node’s hash to the hash list. Do not descend into its child nodes.                                                                  |
| **Match Or Match Ancestor**          | Append a 1 to the flag list; append this node’s TXID to the hash list. | Append a 1 to the flag list; process the left child node. Then, if the node has a right child, process the right child. Do not append a hash to the hash list for this node. |

Any time you begin processing a node for the first time, a flag should be appended to the flag list. Never put a flag on the list at any other time, except when processing is complete to pad out the flag list to a byte boundary.

When processing a child node, you may need to process its children (the grandchildren of the original node) or further-descended nodes before returning to the parent node. This is expected—keep processing depth first until you reach a TXID node or a node which is neither a TXID nor a match ancestor.

After you process a TXID node or a node which is neither a TXID nor a match ancestor, stop processing and begin to ascend the tree until you find a node with a right child you haven’t processed yet. Descend into that right child and process it.

After you fully process the merkle root node according to the instructions in the table above, processing is complete. Pad your flag list to a byte boundary and construct the [“merkleblock” message](../reference/p2p_networking#merkleblock) using the template near the beginning of this subsection.

### CmpctBlock

*Added in*[protocol version 70014](../reference/p2p_networking#protocol-versions)*as described by*[BIP152](https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki)*.*

**Version 1 compact blocks are pre-segwit (txids)** **Version 2 compact blocks are post-segwit (wtxids)**

The [“cmpctblock” message](../reference/p2p_networking#cmpctblock) is a reply to a [“getdata” message](../reference/p2p_networking#getdata) which requested a block using the inventory type “MSG_CMPCT_BLOCK”. If the requested block was recently announced and is close to the tip of the best chain of the receiver and after having sent the requesting peer a [“sendcmpct” message](../reference/p2p_networking#sendcmpct), nodes respond with a [“cmpctblock” message](../reference/p2p_networking#cmpctblock) containing data for the block.

**If the requested block is too old, the node responds with a full non-compact block**

Upon [receipt](/glossary/terms#term-receipt) of a [“cmpctblock” message](../reference/p2p_networking#cmpctblock), after sending a [“sendcmpct” message](../reference/p2p_networking#sendcmpct), nodes should calculate the short transaction ID for each unconfirmed transaction they have available (ie in their mempool) and compare each to each short transaction ID in the [“cmpctblock” message](../reference/p2p_networking#cmpctblock). After finding already-available transactions, nodes which do not have all transactions available to reconstruct the full block should request the missing transactions using a [“getblocktxn” message](../reference/p2p_networking#getblocktxn).

A node must not send a [“cmpctblock” message](../reference/p2p_networking#cmpctblock) unless they are able to respond to a [“getblocktxn” message](../reference/p2p_networking#getblocktxn) which requests every transaction in the block. A node must not send a [“cmpctblock” message](../reference/p2p_networking#cmpctblock) without having validated that the header properly commits to each transaction in the block, and properly builds on top of the existing, fully-validated chain with a valid proof-of-work either as a part of the current most-work valid chain, or building directly on top of it. A node may send a [“cmpctblock” message](../reference/p2p_networking#cmpctblock) before validating that each transaction in the block validly spends existing UTXO set entries.

The [“cmpctblock” message](../reference/p2p_networking#cmpctblock) contains a vector of [“PrefilledTransaction”](../reference/p2p_networking#cmpctblock) whose structure is defined below.

| Bytes    | Name  | Data Type        | Description                                                    |
| -------- | ----- | ---------------- | -------------------------------------------------------------- |
| *Varies* | index | compactSize uint | The index into the block at which this transaction is located. |
| *Varies* | tx    | Transaction      | The transaction which is in the block at the index.            |

The [“cmpctblock” message](../reference/p2p_networking#cmpctblock) is compromised of a serialized [“HeaderAndShortIDs”](../reference/p2p_networking#cmpctblock) structure which is defined below. A [“HeaderAndShortIDs”](../reference/p2p_networking#cmpctblock) structure is used to relay a block header, the short transactions IDs used for matching already-available transactions, and a select few transactions which we expect a peer may be missing.

| Bytes    | Name                 | Data Type              | Description                                                                                                                                                                                                                                                                                                                                                                                      |
| -------- | -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 80       | block header         | block_header           | The block header in the format described in the [block header section](../reference/block_chain#block-headers).                                                                                                                                                                                                                                                                             |
| 8        | nonce                | uint64_t               | A nonce for use in short transaction ID calculations.                                                                                                                                                                                                                                                                                                                                            |
| *Varies* | shortids length      | compactSize uint       | The number of short transaction IDs in the following field.                                                                                                                                                                                                                                                                                                                                      |
| *Varies* | shortids             | byte[]                 | The short transaction IDs calculated from the transactions which were not provided explicitly in prefilledtxn. Vector of 6-byte integers in the spec, padded with two null-bytes so it can be read as an 8-byte integer. **In version 2 of compact blocks, shortids should use the wtxid instead of txid as defined by**[BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki) |
| *Varies* | prefilled txn length | compactSize uint       | The number of prefilled transactions in the following field.                                                                                                                                                                                                                                                                                                                                     |
| *Varies* | prefilled txn        | PrefilledTransaction[] | Used to provide the coinbase transaction and a select few which we expect a peer may be missing. Vector of [“PrefilledTransaction”](../reference/p2p_networking#cmpctblock) structures defined above.                                                                                                                                                                                       |

**Important**[protocol version 70015](../reference/p2p_networking#protocol-versions)**notes regarding Compact Blocks**

New banning behavior was added to the compact block logic in [protocol version 70015](../reference/p2p_networking#protocol-versions) to prevent node abuse, the new changes are outlined below as defined in [BIP152](https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki).

Any undefined behavior in this spec may cause failure to transfer block to, peer disconnection by, or self-destruction by the receiving node. A node receiving non-minimally-encoded CompactSize encodings should make a best-effort to eat the sender’s cat.

As high-bandwidth mode permits relaying of [“cmpctblock” messages](../reference/p2p_networking#cmpctblock) prior to full validation (requiring only that the block header is valid before relay), nodes SHOULD NOT ban a peer for announcing a new block with a [“cmpctblock” message](../reference/p2p_networking#cmpctblock) that is invalid, but has a valid header.

For avoidance of doubt, nodes SHOULD bump their [peer-to-peer](../devguide/p2p_network) protocol version to 70015 or higher to signal that they will not ban or punish a peer for announcing compact blocks prior to full validation, and nodes SHOULD NOT announce a [“cmpctblock” message](../reference/p2p_networking#cmpctblock) to a peer with a version number below 70015 before fully validating the block.

**Version 2 compact blocks notes**

Transactions inside [“cmpctblock” messages](../reference/p2p_networking#cmpctblock) (both those used as direct announcement and those in response to getdata) and in [“blocktxn” messages](../reference/p2p_networking#blocktxn) should include witness data, using the same format as responses to getdata “MSG_WITNESS_TX”, specified in [BIP144](https://github.com/bitcoin/bips/blob/master/bip-0144.mediawiki).

Upon [receipt](/glossary/terms#term-receipt) of a [“getdata” message](../reference/p2p_networking#getdata) containing a request for a “MSG_CMPCT_BLOCK” object for which a [“cmpctblock” message](../reference/p2p_networking#cmpctblock) is not sent in response, the block message containing the requested block in non-compact form MUST be encoded with witnesses (as is sent in reply to a “MSG_WITNESS_BLOCK”) if the protocol version used to encode the [“cmpctblock” message](../reference/p2p_networking#cmpctblock) would have been 2, and encoded without witnesses (as is sent in response to a “MSG_BLOCK”) if the protocol version used to encode the [“cmpctblock” message](../reference/p2p_networking#cmpctblock) would have been 1.

**Short Transaction ID calculation**

Short transaction IDs are used to represent a transaction without sending a full 256-bit hash. They are calculated as follows,

- A single-SHA256 hashing the block header with the nonce appended (in little-endian)
- Running SipHash-2-4 with the input being the transaction ID (**wtxid in version 2 of compact blocks**) and the keys (k0/k1) set to the first two little-endian 64-bit integers from the above hash, respectively.
- Dropping the 2 most significant bytes from the SipHash output to make it 6 bytes.
- Two null-bytes appended so it can be read as an 8-byte integer.

### SendCmpct

*Added in*[protocol version 70014](../reference/p2p_networking#protocol-versions)*as described by*[BIP152](https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki)*.*

The [“sendcmpct” message](../reference/p2p_networking#sendcmpct) is defined as a message containing a 1-byte integer followed by a 8-byte integer. The first integer is interpreted as a boolean and should have a value of either 1 or 0. The second integer is be interpreted as a little-endian version number.

Upon [receipt](/glossary/terms#term-receipt) of a [“sendcmpct” message](../reference/p2p_networking#sendcmpct) with the first and second integers set to 1, the node should announce new blocks by sending a [“cmpctblock” message](../reference/p2p_networking#cmpctblock).

Upon [receipt](/glossary/terms#term-receipt) of a [“sendcmpct” message](../reference/p2p_networking#sendcmpct) with the first integer set to 0, the node shouldn’t announce new blocks by sending a [“cmpctblock” message](../reference/p2p_networking#cmpctblock), but instead announce new blocks by sending invs or headers, as defined by [BIP130](https://github.com/bitcoin/bips/blob/master/bip-0130.mediawiki).

Upon [receipt](/glossary/terms#term-receipt) of a [“sendcmpct” message](../reference/p2p_networking#sendcmpct) with the second integer set to something other than 1, nodes should treat the peer as if they had not received the message (as it indicates the peer will provide an unexpected encoding in [“cmpctblock” messages](../reference/p2p_networking#cmpctblock), and/or other, messages). This allows future versions to send duplicate [“sendcmpct” messages](../reference/p2p_networking#sendcmpct) with different versions as a part of a version handshake for future versions.

Nodes should check for a protocol version of >= 70014 before sending [“sendcmpct” messages](../reference/p2p_networking#sendcmpct). Nodes shouldn’t send a request for a “MSG_CMPCT_BLOCK” object to a peer before having received a [“sendcmpct” message](../reference/p2p_networking#sendcmpct) from that peer. Nodes shouldn’t request a “MSG_CMPCT_BLOCK” object before having sent all [“sendcmpct” messages](../reference/p2p_networking#sendcmpct) to that peer which they intend to send, as the peer cannot know what version protocol to use in the response.

The structure of a [“sendcmpct” message](../reference/p2p_networking#sendcmpct) is defined below.

| Bytes | Name     | Data Type | Description                                                                                                                  |
| ----- | -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1     | announce | bool      | An integer representing a boolean value, must be 0x01 (true) or 0x00 (false).                                                |
| 8     | version  | uint64_t  | A little-endian representation of a version number. **Version 2 compact blocks should be specified by setting version to 2** |

### GetBlockTxn

*Added in*[protocol version 70014](../reference/p2p_networking#protocol-versions)*as described by*[BIP152](https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki)*.*

The [“getblocktxn” message](../reference/p2p_networking#getblocktxn) is defined as a message containing a serialized [“BlockTransactionsRequest”](../reference/p2p_networking#getblocktxn) message. Upon [receipt](/glossary/terms#term-receipt) of a properly-formatted [“getblocktxn” message](../reference/p2p_networking#getblocktxn), nodes which recently provided the sender of such a message a [“cmpctblock” message](../reference/p2p_networking#cmpctblock) for the block hash identified in this message must respond with either an appropriate [“blocktxn” message](../reference/p2p_networking#blocktxn), or a full block message.

A [“blocktxn” message](../reference/p2p_networking#blocktxn) response must contain exactly and only each transaction which is present in the appropriate block at the index specified in the [“getblocktxn” message](../reference/p2p_networking#getblocktxn) indexes list, in the order requested.

The structure of [“BlockTransactionsRequest”](../reference/p2p_networking#getblocktxn) is defined below.

| Bytes    | Name           | Data Type          | Description                                                                                                                                                                                                                                                           |
| -------- | -------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 32       | block hash     | binary blob        | The blockhash of the block which the transactions being requested are in.                                                                                                                                                                                             |
| *Varies* | indexes length | compactSize uint   | The number of transactions being requested.                                                                                                                                                                                                                           |
| *Varies* | indexes        | compactSize uint[] | Vector of compactSize containing the indexes of the transactions being requested in the block. **In version 2 of compact blocks, the wtxid should be used instead of the txid as defined by**[BIP141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki) |

### BlockTxn

*Added in*[protocol version 70014](../reference/p2p_networking#protocol-versions)*as described by*[BIP152](https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki)*.*

The [“blocktxn” message](../reference/p2p_networking#blocktxn) is defined as a message containing a serialized [“BlockTransactions”](../reference/p2p_networking#blocktxn) message. Upon [receipt](/glossary/terms#term-receipt) of a properly-formatted requested [“blocktxn” message](../reference/p2p_networking#blocktxn), nodes should attempt to reconstruct the full block by taking the prefilledtxn transactions from the original [“cmpctblock” message](../reference/p2p_networking#cmpctblock) and placing them in the marked positions, then for each short transaction ID from the original [“cmpctblock” message](../reference/p2p_networking#cmpctblock), in order, find the corresponding transaction either from the [“blocktxn” message](../reference/p2p_networking#blocktxn) or from other sources and place it in the first available position in the block then once the block has been reconstructed, it shall be processed as normal, keeping in mind that short transaction IDs are expected to occasionally collide, and that nodes must not be penalized for such collisions, wherever they appear.

The structure of [“BlockTransactions”](../reference/p2p_networking#blocktxn) is defined below.

| Bytes    | Name                | Data Type        | Description                                                                                                                                                             |
| -------- | ------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 32       | block hash          | binary blob      | The blockhash of the block which the transactions being provided are in.                                                                                                |
| *Varies* | transactions length | compactSize uint | The number of transactions being provided.                                                                                                                              |
| *Varies* | transactions        | Transactions[]   | Vector of transactions, for an example hexdump of the raw transaction format, see the [raw transaction section](../reference/transactions#raw-transaction-format). |

### NotFound

*Added in*[protocol version 70001](../reference/p2p_networking#protocol-versions)*.*

The [“notfound” message](../reference/p2p_networking#notfound) is a reply to a [“getdata” message](../reference/p2p_networking#getdata) which requested an object the receiving node does not have available for relay. (Nodes are not expected to relay historic transactions which are no longer in the memory pool or relay set. Nodes may also have pruned spent transactions from older blocks, making them unable to send those blocks.)

The format and maximum size limitations of the [“notfound” message](../reference/p2p_networking#notfound) are identical to the [“inv” message](../reference/p2p_networking#inv); only the message header differs.

### Tx

The [“tx” message](../reference/p2p_networking#tx) transmits a single transaction in the raw transaction format. It can be sent in a variety of situations;

- **Transaction Response:** ReddCoin Core and [BitcoinJ](http://bitcoinj.github.io) will send it in response to a [“getdata” message](../reference/p2p_networking#getdata) that requests the transaction with an inventory type of “MSG_TX”.
- **MerkleBlock Response:** ReddCoin Core will send it in response to a [“getdata” message](../reference/p2p_networking#getdata) that requests a merkle block with an inventory type of `MSG_MERKLEBLOCK`. (This is in addition to sending a [“merkleblock” message](../reference/p2p_networking#merkleblock).) Each [“tx” message](../reference/p2p_networking#tx) in this case provides a matched transaction from that block.
- **Unsolicited:** [BitcoinJ](http://bitcoinj.github.io) will send a [“tx” message](../reference/p2p_networking#tx) unsolicited for transactions it originates.

For an example hexdump of the raw transaction format, see the [raw transaction section](../reference/transactions#raw-transaction-format).

## Control Messages

The following [network](../devguide/p2p_network) messages all help control the connection between two peers or allow them to advise each other about the rest of the [network](../devguide/p2p_network).

![Overview Of P2P Protocol Control And Advisory Messages](/img/protocol/dev/en-p2p-control-messages.svg)

Overview Of P2P Protocol Control And Advisory Messages
Note that almost none of the control messages are authenticated in any way, meaning they can contain incorrect or intentionally harmful information. In addition, this section does not yet cover P2P protocol operation over the [Tor network](https://en.wikipedia.org/wiki/Tor_%28anonymity_network%29); if you would like to contribute information about Tor, please [open an issue](https://github.com/reddcoin-project/reddcoin/issues).

### Addr

The `addr` (IP address) message relays connection information for peers on the [network](../devguide/p2p_network). Each peer which wants to accept incoming connections creates an [“addr”](../reference/p2p_networking#addr) or [“addrv2”](../reference/p2p_networking#addrv2) message providing its connection information and then sends that message to its peers unsolicited. Some of its peers send that information to their peers (also unsolicited), some of which further distribute it, allowing decentralized peer discovery for any program already on the [network](../devguide/p2p_network).

An [“addr” message](../reference/p2p_networking#addr) may also be sent in response to a [“getaddr” message](../reference/p2p_networking#getaddr).

Each encapsulated [network](../devguide/p2p_network) IP address currently uses the following structure:

The following annotated hexdump shows part of an [“addr” message](../reference/p2p_networking#addr). (The message header has been omitted and the actual IP address has been replaced with a [RFC5737](http://tools.ietf.org/html/rfc5737) reserved IP address.)

```
fde803 ............................. Address count: 1000

d91f4854 ........................... [Epoch time][unix epoch time]: 1414012889
0100000000000000 ................... Service bits: 01 ([network][network] node)
00000000000000000000ffffc0000233 ... IP Address: ::ffff:192.0.2.51
b184 ............................... Port: 45444

[...] .............................. (999 more addresses omitted)
```

### Addrv2

The `addrv2` (address version two) message relays connection information for peers on the [network](../devguide/p2p_network) in a similar way to the [“addr“ message](../reference/p2p_networking#addr) except that it uses a different encoding which supports addresses longer than 16 bytes.

Each encapsulated address uses the following structure (`addrv2` encoding):

| Bytes    | Name           | Data Type        | Description                                                                                                                                    |
| -------- | -------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 4        | time           | uint32           | Same as in the [“addr” message](../reference/p2p_networking#addr).                                                                        |
| *Varies* | services       | compactSize uint | Same as in the [“addr” message](../reference/p2p_networking#addr), but encoded as compactSize.                                            |
| 1        | network id     | uint8_t          | The id of the network to which the address belongs to, as defined in [BIP155](https://github.com/bitcoin/bips/blob/master/bip-0155.mediawiki). |
| *Varies* | address length | compactSize uint | The size of the address in the following field (in bytes).                                                                                     |
| *Varies* | address        | byte[]           | The network address. The interpretation depends on the network id.                                                                             |
| 2        | port           | uint16_t         | Same as in the [“addr” message](../reference/p2p_networking#addr).                                                                        |

The following annotated hexdump shows part of an [“addrv2” message](../reference/p2p_networking#addrv2) (the message header has been omitted).

```
fde803 ............................. Address count: 1000

d91f4854 ........................... [Epoch time][unix epoch time]: 1414012889
fd4804 ............................. Service bits: compactSize(NODE_WITNESS | NODE_COMPACT_FILTERS | NODE_NETWORK_LIMITED)
01 ................................. BIP155 network id: IPv4
04 ................................. Address length: compactSize(4)
c0000233 ........................... Address: 192.0.2.51
b184 ............................... Port: 45444

[...] .............................. (999 more addresses omitted)
```

### Alert

*Added in*[protocol version 311](../reference/p2p_networking#protocol-versions)*.* *Removed in*[protocol version 70013](../reference/p2p_networking#protocol-versions)*and released in*[ReddCoin Core 0.13.0](https://github.com/reddcoin-project/reddcoin/releases)

The legacy p2p [network](../devguide/p2p_network) alert messaging system has been retired; however, internal alerts, partition detection warnings and the `-alertnotify` option features remain. See [Alert System Retirement](https://github.com/reddcoin-project/reddcoin/releases) for details.

### FeeFilter

*Added in*[protocol version 70013](../reference/p2p_networking#protocol-versions)*as described by*[BIP133](https://github.com/bitcoin/bips/blob/master/bip-0133.mediawiki)*.*

The [“feefilter” message](../reference/p2p_networking#feefilter) is a request to the receiving peer to not relay any transaction inv messages to the sending peer where the fee rate for the transaction is below the fee rate specified in the feefilter message.

`feefilter` was introduced in [ReddCoin Core 0.13.0](https://github.com/reddcoin-project/reddcoin/releases) following the introduction of mempool limiting in [ReddCoin Core 0.12.0](https://github.com/reddcoin-project/reddcoin/releases). Mempool limiting provides protection against attacks and spam transactions that have low fee rates and are unlikely to be included in mined blocks. The [“feefilter” messages](../reference/p2p_networking#feefilter) allows a node to inform its peers that it will not accept transactions below a specified fee rate into its mempool, and therefore that the peers can skip relaying inv messages for transactions below that fee rate to that node.

The receiving peer may choose to ignore the message and not filter transaction inv messages.

The fee filter is additive with bloom filters. If an SPV client loads a bloom filter and sends a feefilter message, transactions should only be relayed if they pass both filters.

Note however that feefilter has no effect on block propagation or responses to getdata messages. For example, if a node requests a merkleblock from its peer by sending a getdata message with inv type MSG_FILTERED_BLOCK and it has previously sent a feefilter to that peer, the peer should respond with a merkleblock containing *all* the transactions matching the bloom filter, even if they are below the feefilter fee rate.

inv messages generated from a mempool message are subject to a fee filter if it exists.

The annotated hexdump below shows a [“feefilter” message](../reference/p2p_networking#feefilter). (The message header has been omitted.)

```
7cbd000000000000 ... reddoshis per kilobyte: 48,508
```

### FilterAdd

*Added in*[protocol version 70001](../reference/p2p_networking#protocol-versions)*as described by*[BIP37](https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki)*.*

The [“filteradd” message](../reference/p2p_networking#filteradd) tells the receiving peer to add a single element to a previously-set bloom filter, such as a new public key. The element is sent directly to the receiving peer; the peer then uses the parameters set in the [“filterload” message](../reference/p2p_networking#filterload) to add the element to the bloom filter.

Because the element is sent directly to the receiving peer, there is no obfuscation of the element and none of the plausible-deniability privacy provided by the bloom filter. Clients that want to maintain greater privacy should recalculate the bloom filter themselves and send a new [“filterload” message](../reference/p2p_networking#filterload) with the recalculated bloom filter.

| Bytes    | Name          | Data Type        | Description                                                                                                                                                                                                                                                                                                                        |
| -------- | ------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Varies* | element bytes | compactSize uint | The number of bytes in the following element field.                                                                                                                                                                                                                                                                                |
| *Varies* | element       | uint8_t[]        | The element to add to the current filter. Maximum of 520 bytes, which is the maximum size of an element which can be pushed onto the stack in a pubkey or signature script. Elements must be sent in the byte order they would use when appearing in a raw transaction; for example, hashes should be sent in internal byte order. |

Note: a [“filteradd” message](../reference/p2p_networking#filteradd) will not be accepted unless a filter was previously set with the [“filterload” message](../reference/p2p_networking#filterload).

The annotated hexdump below shows a [“filteradd” message](../reference/p2p_networking#filteradd) adding a TXID. (The message header has been omitted.) This TXID appears in the same block used for the example hexdump in the [“merkleblock” message](../reference/p2p_networking#merkleblock); if that [“merkleblock” message](../reference/p2p_networking#merkleblock) is re-sent after sending this [“filteradd” message](../reference/p2p_networking#filteradd), six hashes are returned instead of four.

```
20 ................................. Element bytes: 32
fdacf9b3eb077412e7a968d2e4f11b9a
9dee312d666187ed77ee7d26af16cb0b ... Element (A TXID)
```

### FilterClear

*Added in*[protocol version 70001](../reference/p2p_networking#protocol-versions)*as described by*[BIP37](https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki)*.*

The [“filterclear” message](../reference/p2p_networking#filterclear) tells the receiving peer to remove a previously-set bloom filter. This also undoes the effect of setting the relay field in the [“version” message](../reference/p2p_networking#version) to 0, allowing unfiltered access to [“inv” messages](../reference/p2p_networking#inv) announcing new transactions.

ReddCoin Core does not require a [“filterclear” message](../reference/p2p_networking#filterclear) before a replacement filter is loaded with `filterload`. It also doesn’t require a [“filterload” message](../reference/p2p_networking#filterload) before a [“filterclear” message](../reference/p2p_networking#filterclear).

There is no payload in a [“filterclear” message](../reference/p2p_networking#filterclear). See the [message header section](../reference/p2p_networking#message-headers) for an example of a message without a payload.

### FilterLoad

*Added in*[protocol version 70001](../reference/p2p_networking#protocol-versions)*as described by*[BIP37](https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki)*.*

The [“filterload” message](../reference/p2p_networking#filterload) tells the receiving peer to filter all relayed transactions and requested merkle blocks through the provided filter. This allows clients to receive transactions relevant to their wallet plus a configurable rate of false positive transactions which can provide plausible-deniability privacy.

| Bytes    | Name         | Data Type        | Description                                                                                                                                                                |
| -------- | ------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Varies* | nFilterBytes | compactSize uint | Number of bytes in the following filter bit field.                                                                                                                         |
| *Varies* | filter       | uint8_t[]        | A bit field of arbitrary byte-aligned size. The maximum size is 36,000 bytes.                                                                                              |
| 4        | nHashFuncs   | uint32_t         | The number of hash functions to use in this filter. The maximum value allowed in this field is 50.                                                                         |
| 4        | nTweak       | uint32_t         | An arbitrary value to add to the seed value in the hash function used by the bloom filter.                                                                                 |
| 1        | nFlags       | uint8_t          | A set of flags that control how outpoints corresponding to a matched pubkey script are added to the filter. See the table in the Updating A Bloom Filter subsection below. |

The annotated hexdump below shows a [“filterload” message](../reference/p2p_networking#filterload). (The message header has been omitted.) For an example of how this payload was created, see the [filterload example](../examples/p2p_networking#creating-a-bloom-filter).

```
02 ......... Filter bytes: 2
b50f ....... Filter: 1010 1101 1111 0000
0b000000 ... nHashFuncs: 11
00000000 ... nTweak: 0/none
00 ......... nFlags: BLOOM_UPDATE_NONE
```

**Initializing A Bloom Filter**

Filters have two core parameters: the size of the bit field and the number of hash functions to run against each data element. The following formulas from [BIP37](https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki) will allow you to automatically select appropriate values based on the number of elements you plan to insert into the filter (*n*) and the false positive rate (*p*) you desire to maintain plausible deniability.

- Size of the bit field in bytes (*nFilterBytes*), up to a maximum of 36,000: `(-1 / log(2)**2 * n * log(p)) / 8`
- Hash functions to use (*nHashFuncs*), up to a maximum of 50: `nFilterBytes * 8 / n * log(2)`

Note that the filter matches parts of transactions (transaction elements), so the false positive rate is relative to the number of elements checked—not the number of transactions checked. Each normal transaction has a minimum of four matchable elements (described in the comparison subsection below), so a filter with a false-positive rate of 1 percent will match about 4 percent of all transactions at a minimum.

According to [BIP37](https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki), the formulas and limits described above provide support for bloom filters containing 20,000 items with a false positive rate of less than 0.1 percent or 10,000 items with a false positive rate of less than 0.0001 percent.

Once the size of the bit field is known, the bit field should be initialized as all zeroes.

**Populating A Bloom Filter**

The bloom filter is populated using between 1 and 50 unique hash functions (the number specified per filter by the *nHashFuncs* field). Instead of using up to 50 different hash function implementations, a single implementation is used with a unique seed value for each function.

The seed is `nHashNum * 0xfba4c795 + nTweak` as a *uint32_t*, where the values are:

- **nHashNum** is the sequence number for this hash function, starting at 0 for the first hash iteration and increasing up to the value of the *nHashFuncs* field (minus one) for the last hash iteration.
- **0xfba4c795** is a constant optimized to create large differences in the seed for different values of *nHashNum*.
- **nTweak** is a per-filter constant set by the client to require the use of an arbitrary set of hash functions.

If the seed resulting from the formula above is larger than four bytes, it must be truncated to its four most significant bytes (for example, `0x8967452301 & 0xffffffff → 0x67452301`).

The actual hash function implementation used is the [32-bit Murmur3 hash function](https://en.wikipedia.org/wiki/MurmurHash).

**Warning:** the Murmur3 hash function has separate 32-bit and 64-bit versions that produce different results for the same input. Only the 32-bit Murmur3 version is used with ReddCoin bloom filters.

The data to be hashed can be any transaction element which the bloom filter can match. See the next subsection for the list of transaction elements checked against the filter. The largest element which can be matched is a script data push of 520 bytes, so the data should never exceed 520 bytes.

The example below from ReddCoin Core [bloom.cpp](https://github.com/reddcoin-project/reddcoin/blob/cbf28c6619fe348a258dfd7d08bdbd2392d07511/src/bloom.cpp#L46) combines all the steps above to create the hash function template. The seed is the first parameter; the data to be hashed is the second parameter. The result is a uint32_t modulo the size of the bit field in bits.

```c++
MurmurHash3(nHashNum * 0xFBA4C795 + nTweak, vDataToHash) % (vData.size() * 8)
Each data element to be added to the filter is hashed by *nHashFuncs* number of hash functions. Each time a hash function is run, the result will be the index number (*nIndex*) of a bit in the bit field. That bit must be set to 1. For example if the filter bit field was `00000000` and the result is 5, the revised filter bit field is `00000100` (the first bit is bit 0).
```

It is expected that sometimes the same index number will be returned more than once when populating the bit field; this does not affect the algorithm—after a bit is set to 1, it is never changed back to 0.

After all data elements have been added to the filter, each set of eight bits is converted into a little-endian byte. These bytes are the value of the *filter* field.

**Comparing Transaction Elements To A Bloom Filter**

To compare an arbitrary data element against the bloom filter, it is hashed using the same parameters used to create the bloom filter. Specifically, it is hashed *nHashFuncs* times, each time using the same *nTweak* provided in the filter, and the resulting output is modulo the size of the bit field provided in the *filter* field. After each hash is performed, the filter is checked to see if the bit at that indexed location is set. For example if the result of a hash is `5` and the filter is `01001110`, the bit is considered set.

If the result of every hash points to a set bit, the filter matches. If any of the results points to an unset bit, the filter does not match.

The following transaction elements are compared against bloom filters. All elements will be hashed in the byte order used in blocks (for example, TXIDs will be in internal byte order).

- **TXIDs:** the transaction’s SHA256(SHA256()) hash.
- **Outpoints:** each 36-byte outpoint used this transaction’s input section is individually compared to the filter.
- **Signature Script Data:** each element pushed onto the stack by a data-pushing opcode in a signature script from this transaction is individually compared to the filter. This includes data elements present in P2SH redeem scripts when they are being spent.
- **PubKey Script Data:** each element pushed onto the the stack by a data-pushing opcode in any pubkey script from this transaction is individually compared to the filter. (If a pubkey script element matches the filter, the filter will be immediately updated if the `BLOOM_UPDATE_ALL` flag was set; if the pubkey script is in the P2PKH format and matches the filter, the filter will be immediately updated if the `BLOOM_UPDATE_P2PUBKEY_ONLY` flag was set. See the subsection below for details.)

The following annotated hexdump of a transaction is from the [raw transaction format section](../reference/transactions#raw-transaction-format); the elements which would be checked by the filter are emphasized in bold. Note that this transaction’s TXID (**\`\`01000000017b1eab[...]\`\`**) would also be checked, and that the outpoint TXID and index number below would be checked as a single 36-byte element.

```{raw} html
<pre><code>01000000 ................................... Version

01 ......................................... Number of inputs
|
| <b>7b1eabe0209b1fe794124575ef807057</b>
| <b>c77ada2138ae4fa8d6c4de0398a14f3f</b> ......... Outpoint TXID
| <b>00000000</b> ................................. Outpoint index number
|
| 49 ....................................... Bytes in sig. script: 73
| | 48 ..................................... Push 72 bytes as data
| | | <b>30450221008949f0cb400094ad2b5eb3</b>
| | | <b>99d59d01c14d73d8fe6e96df1a7150de</b>
| | | <b>b388ab8935022079656090d7f6bac4c9</b>
| | | <b>a94e0aad311a4268e082a725f8aeae05</b>
| | | <b>73fb12ff866a5f01</b> ..................... Secp256k1 signature
|
| ffffffff ................................. Sequence number: UINT32_MAX

01 ......................................... Number of outputs
| f0ca052a01000000 ......................... Reddoshis (49.99990000 RDD)
|
| 19 ....................................... Bytes in pubkey script: 25
| | 76 ..................................... OP_DUP
| | a9 ..................................... OP_HASH160
| | 14 ..................................... Push 20 bytes as data
| | | <b>cbc20a7664f2f69e5355aa427045bc15</b>
| | | <b>e7c6c772</b> ............................. PubKey hash
| | 88 ..................................... OP_EQUALVERIFY
| | ac ..................................... OP_CHECKSIG

00000000 ................................... locktime: 0 (a block height)
</code></pre>
```

**Updating A Bloom Filter**

Clients will often want to track inputs that spend outputs (outpoints) relevant to their wallet, so the filterload field *nFlags* can be set to allow the filtering node to update the filter when a match is found. When the filtering node sees a pubkey script that pays a pubkey, address, or other data element matching the filter, the filtering node immediately updates the filter with the outpoint corresponding to that pubkey script.

![Automatically Updating Bloom Filters](/img/protocol/dev/en-bloom-update.svg)

Automatically Updating Bloom Filters
If an input later spends that outpoint, the filter will match it, allowing the filtering node to tell the client that one of its transaction outputs has been spent.

The *nFlags* field has three allowed values:

| Value | Name                       | Description                                                                                                                                                                        |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | BLOOM_UPDATE_NONE          | The filtering node should not update the filter.                                                                                                                                   |
| 1     | BLOOM_UPDATE_ALL           | If the filter matches any data element in a pubkey script, the corresponding outpoint is added to the filter.                                                                      |
| 2     | BLOOM_UPDATE_P2PUBKEY_ONLY | If the filter matches any data element in a pubkey script and that script is either a P2PKH or non-P2SH pay-to-multisig script, the corresponding outpoint is added to the filter. |

In addition, because the filter size stays the same even though additional elements are being added to it, the false positive rate increases. Each false positive can result in another element being added to the filter, creating a feedback loop that can (after a certain point) make the filter useless. For this reason, clients using automatic filter updates need to monitor the actual false positive rate and send a new filter when the rate gets too high.

### GetAddr

The [“getaddr” message](../reference/p2p_networking#getaddr) requests an [“addr”](../reference/p2p_networking#addr) or [“addrv2”](../reference/p2p_networking#addrv2) message from the receiving node, preferably one with lots of addresses of other receiving nodes. The transmitting node can use those addresses to quickly update its database of available nodes rather than waiting for unsolicited [“addr”](../reference/p2p_networking#addr) or [“addrv2”](../reference/p2p_networking#addrv2) messages to arrive over time.

There is no payload in a [“getaddr” message](../reference/p2p_networking#getaddr). See the [message header section](../reference/p2p_networking#message-headers) for an example of a message without a payload.

### Ping

The [“ping” message](../reference/p2p_networking#ping) helps confirm that the receiving peer is still connected. If a TCP/IP error is encountered when sending the [“ping” message](../reference/p2p_networking#ping) (such as a connection timeout), the transmitting node can assume that the receiving node is disconnected. The response to a [“ping” message](../reference/p2p_networking#ping) is the [“pong” message](../reference/p2p_networking#pong).

Before [protocol version 60000](../reference/p2p_networking#protocol-versions), the [“ping” message](../reference/p2p_networking#ping) had no payload. As of [protocol version 60001](../reference/p2p_networking#protocol-versions) and all later versions, the message includes a single field, the nonce.

| Bytes | Name  | Data Type | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8     | nonce | uint64_t  | *Added in*[protocol version 60001](../reference/p2p_networking#protocol-versions)*as described by*[BIP31](https://github.com/bitcoin/bips/blob/master/bip-0031.mediawiki)*.* Random nonce assigned to this [“ping” message](../reference/p2p_networking#ping). The responding [“pong” message](../reference/p2p_networking#pong) will include this nonce to identify the [“ping” message](../reference/p2p_networking#ping) to which it is replying. |

The annotated hexdump below shows a [“ping” message](../reference/p2p_networking#ping). (The message header has been omitted.)

```
0094102111e2af4d ... Nonce
```

### Pong

*Added in*[protocol version 60001](../reference/p2p_networking#protocol-versions)*as described by*[BIP31](https://github.com/bitcoin/bips/blob/master/bip-0031.mediawiki)*.*

The [“pong” message](../reference/p2p_networking#pong) replies to a [“ping” message](../reference/p2p_networking#ping), proving to the pinging node that the ponging node is still alive. ReddCoin Core will, by default, disconnect from any clients which have not responded to a [“ping” message](../reference/p2p_networking#ping) within 20 minutes.

To allow nodes to keep track of latency, the [“pong” message](../reference/p2p_networking#pong) sends back the same nonce received in the [“ping” message](../reference/p2p_networking#ping) it is replying to.

The format of the [“pong” message](../reference/p2p_networking#pong) is identical to the [“ping” message](../reference/p2p_networking#ping); only the message header differs.

### Reject

*Added in*[protocol version 70002](../reference/p2p_networking#protocol-versions)*as described by*[BIP61](https://github.com/bitcoin/bips/blob/master/bip-0061.mediawiki)*.*

*Deprecated in ReddCoin Core 0.18.0.*

The [“reject” message](../reference/p2p_networking#reject) informs the receiving node that one of its previous messages has been rejected.

| Bytes    | Name          | Data Type        | Description                                                                                                                                                                                                                                                                                      |
| -------- | ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| *Varies* | message bytes | compactSize uint | The number of bytes in the following message field.                                                                                                                                                                                                                                              |
| *Varies* | message       | string           | The type of message rejected as ASCII text *without null padding*. For example: “tx”, “block”, or “version”.                                                                                                                                                                                     |
| 1        | code          | char             | The reject message code. See the table below.                                                                                                                                                                                                                                                    |
| *Varies* | reason bytes  | compactSize uint | The number of bytes in the following reason field. May be 0x00 if a text reason isn’t provided.                                                                                                                                                                                                  |
| *Varies* | reason        | string           | The reason for the rejection in ASCII text. This should not be displayed to the user; it is only for debugging purposes.                                                                                                                                                                         |
| *Varies* | extra data    | *varies*         | Optional additional data provided with the rejection. For example, most rejections of [“tx” messages](../reference/p2p_networking#tx) or [“block” messages](../reference/p2p_networking#block) include the hash of the rejected transaction or block header. See the code table below. |

The following table lists message reject codes. Codes are tied to the type of message they reply to; for example there is a 0x10 reject code for transactions and a 0x10 reject code for blocks.

| Code | In Reply To                                                   | Extra Bytes | Extra Type | Description                                                                                                                                                                                                                                                                             |
| ---- | ------------------------------------------------------------- | ----------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0x01 | *any message*                                                 | 0           | N/A        | Message could not be decoded. Be careful of [“reject” message](../reference/p2p_networking#reject) feedback loops where two peers each don’t understand each other’s [“reject” messages](../reference/p2p_networking#reject) and so keep sending them back and forth forever. |
| 0x10 | [“block” message](../reference/p2p_networking#block)     | 32          | char[32]   | Block is invalid for some reason (invalid proof-of-work, invalid signature, etc). Extra data may include the rejected block’s header hash.                                                                                                                                              |
| 0x10 | [“tx” message](../reference/p2p_networking#tx)           | 32          | char[32]   | Transaction is invalid for some reason (invalid signature, output value greater than input, etc.). Extra data may include the rejected transaction’s TXID.                                                                                                                              |
| 0x11 | [“block” message](../reference/p2p_networking#block)     | 32          | char[32]   | The block uses a version that is no longer supported. Extra data may include the rejected block’s header hash.                                                                                                                                                                          |
| 0x11 | [“version” message](../reference/p2p_networking#version) | 0           | N/A        | Connecting node is using a protocol version that the rejecting node considers obsolete and unsupported.                                                                                                                                                                                 |
| 0x12 | [“tx” message](../reference/p2p_networking#tx)           | 32          | char[32]   | Duplicate input spend (double spend): the rejected transaction spends the same input as a previously-received transaction. Extra data may include the rejected transaction’s TXID.                                                                                                      |
| 0x12 | [“version” message](../reference/p2p_networking#version) | 0           | N/A        | More than one [“version” message](../reference/p2p_networking#version) received in this connection.                                                                                                                                                                                |
| 0x40 | [“tx” message](../reference/p2p_networking#tx)           | 32          | char[32]   | The transaction will not be mined or relayed because the rejecting node considers it non-standard—a transaction type or version unknown by the server. Extra data may include the rejected transaction’s TXID.                                                                          |
| 0x41 | [“tx” message](../reference/p2p_networking#tx)           | 32          | char[32]   | One or more output amounts are below the dust threshold. Extra data may include the rejected transaction’s TXID.                                                                                                                                                                        |
| 0x42 | [“tx” message](../reference/p2p_networking#tx)           |             | char[32]   | The transaction did not have a large enough fee or priority to be relayed or mined. Extra data may include the rejected transaction’s TXID.                                                                                                                                             |
| 0x43 | [“block” message](../reference/p2p_networking#block)     | 32          | char[32]   | The block belongs to a block chain which is not the same block chain as provided by a compiled-in checkpoint. Extra data may include the rejected block’s header hash.                                                                                                                  |

The annotated hexdump below shows a [“reject” message](../reference/p2p_networking#reject). (The message header has been omitted.)

```
02 ................................. Number of bytes in message: 2
7478 ............................... Type of message rejected: tx
12 ................................. Reject code: 0x12 (duplicate)
15 ................................. Number of bytes in reason: 21
6261642d74786e732d696e707574732d
7370656e74 ......................... Reason: bad-txns-inputs-spent
394715fcab51093be7bfca5a31005972
947baf86a31017939575fb2354222821 ... TXID
```

### SendHeaders

The [“sendheaders” message](../reference/p2p_networking#sendheaders) tells the receiving peer to send new block announcements using a [“headers” message](../reference/p2p_networking#headers) rather than an [“inv” message](../reference/p2p_networking#inv).

There is no payload in a [“sendheaders” message](../reference/p2p_networking#sendheaders). See the [message header section](../reference/p2p_networking#message-headers) for an example of a message without a payload.

### SendAddrv2

The [“sendaddrv2” message](../reference/p2p_networking#sendaddrv2) tells the receiving peer that the sender can understand [“addrv2” messages](../reference/p2p_networking#addrv2) and prefers to receive them instead of [“addr” messages](../reference/p2p_networking#addr).

There is no payload in a [“sendaddrv2” message](../reference/p2p_networking#sendaddrv2). See the [message header section](../reference/p2p_networking#message-headers) for an example of a message without a payload.

### VerAck

*Added in*[protocol version 209](../reference/p2p_networking#protocol-versions)*.*

The [“verack” message](../reference/p2p_networking#verack) acknowledges a previously-received [“version” message](../reference/p2p_networking#version), informing the connecting node that it can begin to send other messages. The [“verack” message](../reference/p2p_networking#verack) has no payload; for an example of a message with no payload, see the [message headers section](../reference/p2p_networking#message-headers).

### Version

The [“version” message](../reference/p2p_networking#version) provides information about the transmitting node to the receiving node at the beginning of a connection. Until both peers have exchanged [“version” messages](../reference/p2p_networking#version), no other messages will be accepted.

If a [“version” message](../reference/p2p_networking#version) is accepted, the receiving node should send a [“verack” message](../reference/p2p_networking#verack)—but no node should send a [“verack” message](../reference/p2p_networking#verack) before initializing its half of the connection by first sending a [“version” message](../reference/p2p_networking#version).

The following service identifiers have been assigned.

**Note:** [Protocol version 70001](../reference/p2p_networking#protocol-versions) introduced the optional `relay` field, adding the possibility of an additional byte to the [“version” message](../reference/p2p_networking#version). This introduces an incompatibility with implementations of lower protocol versions which validate the [“version” message](../reference/p2p_networking#version) size. When implementing support for protocol versions less than 70001 you may want to handle the case of a peer potentially sending an extra byte, treating it as invalid only in the case of a requested protocol version less than 70001.

The following annotated hexdump shows a [“version” message](../reference/p2p_networking#version). (The message header has been omitted and the actual IP addresses have been replaced with [RFC5737](http://tools.ietf.org/html/rfc5737) reserved IP addresses.)

```
72110100 ........................... Protocol version: 70002
0100000000000000 ................... Services: NODE_NETWORK
bc8f5e5400000000 ................... [Epoch time][unix epoch time]: 1415483324

0100000000000000 ................... Receiving node's services
00000000000000000000ffffc61b6409 ... Receiving node's IPv6 address
208d ............................... Receiving node's port number

0100000000000000 ................... Transmitting node's services
00000000000000000000ffffcb0071c0 ... Transmitting node's IPv6 address
208d ............................... Transmitting node's port number

128035cbc97953f8 ................... Nonce

0f ................................. Bytes in user agent string: 15
2f5361746f7368693a302e392e332f ..... User agent: /Satoshi:0.9.3/

cf050500 ........................... Start height: 329167
01 ................................. Relay flag: true
```

