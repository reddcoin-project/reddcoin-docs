# Historical Transaction Format

This document covers transaction formats from earlier eras of the Reddcoin blockchain. For the current PoSV v2 format, see [Transactions](../reference/transactions.html).

```{contents} Eras
:depth: 2
:local: true
```

## PoW Era (Blocks 0–260,799)

During the Proof of Work era, Reddcoin used a transaction format identical to Bitcoin. Transactions did **not** include the `nTime` field.

A raw PoW-era transaction has the following format:

| Bytes    | Name         | Data Type        | Description                                                                          |
| -------- | ------------ | ---------------- | ------------------------------------------------------------------------------------ |
| 4        | version      | int32_t          | Transaction version number.                                                          |
| *Varies* | tx_in count  | compactSize uint | Number of inputs in this transaction.                                                |
| *Varies* | tx_in        | txIn             | Transaction inputs.                                                                  |
| *Varies* | tx_out count | compactSize uint | Number of outputs in this transaction.                                               |
| *Varies* | tx_out       | txOut            | Transaction outputs.                                                                 |
| 4        | lock_time    | uint32_t         | A time ([Unix epoch time](https://en.wikipedia.org/wiki/Unix_time)) or block number. |

### PoW Coinbase

In PoW blocks, the coinbase transaction paid the block reward (including transaction fees) directly to the miner. This is the standard Bitcoin coinbase format.

An itemized PoW coinbase transaction:

```{highlight} text
```

```
01000000 .............................. Version

01 .................................... Number of inputs
| 00000000000000000000000000000000
| 00000000000000000000000000000000 ...  Previous outpoint TXID
| ffffffff ............................ Previous outpoint index
|
| 29 .................................. Bytes in coinbase
| |
| | 03 ................................ Bytes in height
| | | 4e0105 .......................... Height: 328,014
| |
| | 062f503253482f0472d35454085fffed
| | f2400000f90f54696d65202620486561
| | 6c74682021 ........................ Arbitrary data
| 00000000 ............................ Sequence

01 .................................... Output count
| 2c37449500000000 .................... Reddoshis (25.04275756 RDD)
| 1976a914a09be8040cbf399926aeb1f4
| 70c37d1341f3b46588ac ................ P2PKH script

00000000 .............................. Locktime
```

PoW blocks had **no coinstake transaction** and **no block signature**.

## PoSV v1 Era (Blocks 260,800–3,382,229)

The PoSV hard fork at block 260,800 introduced three major changes to the block and transaction format:

1. **nTime field** — a 4-byte transaction timestamp appended after `lock_time` in every transaction, used to calculate coin age for staking eligibility.
2. **PoS coinbase** — the coinbase transaction became a placeholder with a single zero-value, empty-script output. The block reward moved to the coinstake transaction.
3. **Coinstake transaction** — a new second transaction in each block where the staker spends a UTXO and receives it back with the staking reward, split across two outputs.
4. **Block signature** — a DER-encoded secp256k1 signature appended after the last transaction in the serialized block.

### PoSV v1 Coinbase

The coinbase in PoSV v1 blocks did not include the BIP34 block height in the coinbase script. The coinbase script typically contained only minimal data.

```{highlight} text
```

```
02000000 .............................. Version

01 .................................... Number of inputs
| 00000000000000000000000000000000
| 00000000000000000000000000000000 ...  Previous outpoint TXID
| ffffffff ............................ Previous outpoint index
|
| 02 .................................. Bytes in coinbase: 2
| | 0000 .............................. Coinbase script (minimal)
| ffffffff ............................ Sequence

01 .................................... Output count
| 0000000000000000 .................... Reddoshis (0 RDD)
| 00 .................................. Empty pubkey script

00000000 .............................. Locktime
d20fdd53 .............................. nTime: transaction timestamp
```

### PoSV v1 Coinstake

The PoSV v1 coinstake had **3 outputs**: the coinstake marker (zero-value, empty script) followed by two stake split outputs paying the staker's P2PK script. There was no development fund output.

```{highlight} text
```

```
02000000 .............................. Version

01 .................................... Number of inputs
| 8523fd273e09cabddba9afd0696caa16
| adece5a65ec0edc2b9c2e1d6e52aa74a ...  Outpoint TXID
| 01000000 ............................ Outpoint index: 1
|
| 6b .................................. Bytes in sig. script: 107
| | 48 ................................ Push 72 bytes as data
| | | 30450221008471c82e684a5781e032
| | | ad5d66d42db45f94eff0b85aa5b937
| | | c21cbf35d9cf90022017bfe0db320e
| | | 1693ceb4f27c032c2017c5940c532b
| | | e8b6f4465557e6d18c96ed01 ....... Secp256k1 signature
| | 21 ................................ Push 33 bytes (compressed pubkey)
| | | 03f88192fa3a937f8f8dd50007d80f
| | | c0bddd40b3b6331f287e8aa767130a
| | | 78b9d6 .......................... Staker's public key
|
| ffffffff ............................ Sequence number: UINT32_MAX

03 .................................... Number of outputs

| 0000000000000000 .................... Output 0: Coinstake marker (0 RDD)
| 00 .................................. Empty pubkey script

| 80909c8086c70100 .................... Output 1: Stake split 1
| 23 .................................. Bytes in pubkey script: 35
| | 2103f88192fa3a937f8f8dd50007d80f
| | c0bddd40b3b6331f287e8aa767130a78
| | b9d6ac .............................. Staker P2PK script

| 0013b58086c70100 .................... Output 2: Stake split 2
| 23 .................................. Bytes in pubkey script: 35
| | 2103f88192fa3a937f8f8dd50007d80f
| | c0bddd40b3b6331f287e8aa767130a78
| | b9d6ac .............................. Same staker P2PK script

00000000 .............................. Locktime
d20fdd53 .............................. nTime: transaction timestamp
```

### Transition to PoSV v2

At block 3,382,230, the PoSV v2 hard fork added a fourth output to the coinstake transaction: a development fund contribution paid to a fixed P2PK script. The coinbase format remained unchanged. See the current [Transactions](../reference/transactions.html#coinstake) documentation for the PoSV v2 coinstake format.

At block 5,558,400, BIP34-style block height encoding was added to the coinbase script.

