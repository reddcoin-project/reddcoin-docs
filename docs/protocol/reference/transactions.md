---
substitutions:
  Warning icon: |-
    ```{image} /img/icons/icon_warning.svg
    ```
---

# Transactions

The following subsections briefly document core transaction details.

## OpCodes

The opcodes used in the pubkey scripts of standard transactions are:

- Various data pushing opcodes from 0x00 to 0x4e (1–78). These aren't typically shown in examples, but they must be used to push signatures and public keys onto the stack. See the link below this list for a description.

- `OP_TRUE`/`OP_1` (0x51) and `OP_2` through `OP_16` (0x52–0x60), which push the values 1 through 16 to the stack.

- “OP_CHECKSIG” consumes a signature and a full public key, and pushes true onto the stack if the transaction data specified by the SIGHASH flag was converted into the signature using the same [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_DSA) private key that generated the public key. Otherwise, it pushes false onto the stack.

- “OP_DUP” pushes a copy of the topmost stack item on to the stack.

- “OP_HASH160” consumes the topmost item on the stack, computes the RIPEMD160(SHA256()) hash of that item, and pushes that hash onto the stack.

- “OP_EQUAL” consumes the top two items on the stack, compares them, and pushes true onto the stack if they are the same, false if not.

- “OP_VERIFY” consumes the topmost item on the stack. If that item is zero (false) it terminates the script in failure.

- “OP_EQUALVERIFY” runs “OP_EQUAL” and then “OP_VERIFY” in sequence.

- “OP_CHECKMULTISIG” consumes the value (n) at the top of the stack, consumes that many of the next stack levels (public keys), consumes the value (m) now at the top of the stack, and consumes that many of the next values (signatures) plus one extra value.

  The “one extra value” it consumes is the result of an off-by-one error in the Reddcoin Core implementation. This value is not used, so signature scripts prefix the list of [secp256k1](http://www.secg.org/sec2-v2.pdf) signatures with a single OP_0 (0x00).

  “OP_CHECKMULTISIG” compares the first signature against each public key until it finds an [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_DSA) match. Starting with the subsequent public key, it compares the second signature against each remaining public key until it finds an [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_DSA) match. The process is repeated until all signatures have been checked or not enough public keys remain to produce a successful result.

  Because public keys are not checked again if they fail any signature comparison, signatures must be placed in the signature script using the same order as their corresponding public keys were placed in the pubkey script or redeem script. See the “OP_CHECKMULTISIG” warning below for more details.

- “OP_RETURN” terminates the script in failure when executed.

A complete list of opcodes can be found on the Bitcoin Wiki [Script Page](https://en.bitcoin.it/wiki/Script), with an authoritative list in the `opcodetype` enum of the Reddcoin Core [script header file](https://github.com/reddcoin-project/reddcoin/blob/master/src/script/script.h)

**Signature script modification warning:** Signature scripts are not signed, so anyone can modify them. This means signature scripts should only contain data and data-pushing opcodes which can't be modified without causing the pubkey script to fail. Placing non-data-pushing opcodes in the signature script currently makes a transaction non-standard, and future consensus rules may forbid such transactions altogether. (Non-data-pushing opcodes are already forbidden in signature scripts when spending a P2SH pubkey script.)

“OP_CHECKMULTISIG”**warning:** The multisig verification process described above requires that signatures in the signature script be provided in the same order as their corresponding public keys in the pubkey script or redeem script. For example, the following combined signature and pubkey script will produce the stack and comparisons shown:

```
OP_0 <A sig> <B sig> OP_2 <A pubkey> <B pubkey> <C pubkey> OP_3

Sig Stack       Pubkey Stack  (Actually a single stack)
---------       ------------
B sig           C pubkey
A sig           B pubkey
OP_0            A pubkey

1. B sig compared to C pubkey (no match)
2. B sig compared to B pubkey (match #1)
3. A sig compared to A pubkey (match #2)

Success: two matches found
```

But reversing the order of the signatures with everything else the same will fail, as shown below:

```
OP_0 <B sig> <A sig> OP_2 <A pubkey> <B pubkey> <C pubkey> OP_3

Sig Stack       Pubkey Stack  (Actually a single stack)
---------       ------------
A sig           C pubkey
B sig           B pubkey
OP_0            A pubkey

1. A sig compared to C pubkey (no match)
2. A sig compared to B pubkey (no match)

Failure, aborted: two signature matches required but none found so far, and there's only one pubkey remaining
```

## Address Conversion

The hashes used in P2PKH and P2SH outputs are commonly encoded as Reddcoin addresses. This is the procedure to encode those hashes and decode the addresses.

First, get your hash. For P2PKH, you RIPEMD-160(SHA256()) hash a [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_DSA) public key derived from your 256-bit [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_DSA) private key (random data). For P2SH, you RIPEMD-160(SHA256()) hash a redeem script serialized in the format used in raw transactions (described in a [following sub-section](../reference/transactions#raw-transaction-format)). Taking the resulting hash:

1. Add an address version byte in front of the hash. The version bytes commonly used by Reddcoin are:

   - 0x3d for P2PKH addresses on the main Reddcoin [network](../devguide/p2p_network) (mainnet), producing addresses that start with "R"
   - 0x6f for P2PKH addresses on the Reddcoin testing [network](../devguide/p2p_network) (testnet), producing addresses that start with "m" or "n"
   - 0x05 for P2SH addresses on mainnet, producing addresses that start with "3"
   - 0xc4 for P2SH addresses on testnet, producing addresses that start with "2"

2. Create a copy of the version and hash; then hash that twice with SHA256: `SHA256(SHA256(version . hash))`

3. Extract the first four bytes from the double-hashed copy. These are used as a checksum to ensure the base hash gets transmitted correctly.

4. Append the checksum to the version and hash, and encode it as a base58 string: `BASE58(version . hash . checksum)`

Bitcoin's base58 encoding, called Base58Check may not match other implementations. Tier Nolan provided the following example encoding algorithm to the Bitcoin Wiki [Base58Check encoding](https://en.bitcoin.it/wiki/Base58Check_encoding) page under the [Creative Commons Attribution 3.0 license](https://creativecommons.org/licenses/by/3.0/):

```c
code_string = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
x = convert_bytes_to_big_integer(hash_result)

output_string = ""

while(x > 0)
   {
       (x, remainder) = divide(x, 58)
       output_string.append(code_string[remainder])
   }

repeat(number_of_leading_zero_bytes_in_hash)
   {
   output_string.append(code_string[0]);
   }

output_string.reverse();
```
Bitcoin's own code can be traced using the [base58 header file](https://github.com/reddcoin-project/reddcoin/blob/master/src/base58.h).

To convert addresses back into hashes, reverse the base58 encoding, extract the checksum, repeat the steps to create the checksum and compare it against the extracted checksum, and then remove the version byte.

## Raw Transaction Format

Reddcoin transactions are broadcast between peers in a serialized byte format, called raw format. It is this form of a transaction which is SHA256(SHA256()) hashed to create the TXID and, ultimately, the merkle root of a block containing the transaction—making the transaction format part of the consensus rules.

Reddcoin Core and many other tools print and accept raw transactions encoded as hex.

Since the PoSV hard fork at block 260,800, Reddcoin transactions include an `nTime` field not present in Bitcoin. The current format described below applies to all transactions on the network. For the historical PoW-era format (blocks 0–260,799), see [Historical Transaction Format](../reference/transactions_historical).

A raw transaction has the following top-level format:

| Bytes    | Name         | Data Type        | Description                                                                                                                                                                                                                                                                                                                           |
| -------- | ------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4        | version      | int32_t          | Transaction version number (note, this is signed); currently version 1 or 2. Programs creating transactions using newer consensus rules may use higher version numbers. Version 2 means that [BIP 68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki#specification) applies. |
| *Varies* | tx_in count  | compactSize uint | Number of inputs in this transaction.                                                                                                                                                                                                                                                                                                 |
| *Varies* | tx_in        | txIn             | Transaction inputs. See description of txIn below.                                                                                                                                                                                                                                                                                    |
| *Varies* | tx_out count | compactSize uint | Number of outputs in this transaction.                                                                                                                                                                                                                                                                                                |
| *Varies* | tx_out       | txOut            | Transaction outputs. See description of txOut below.                                                                                                                                                                                                                                                                                  |
| 4        | lock_time    | uint32_t         | A time ([Unix epoch time](https://en.wikipedia.org/wiki/Unix_time)) or block number. See the [locktime parsing rules](../devguide/transactions#locktime_parsing_rules).                                                                                                                                                          |
| 4        | nTime        | uint32_t         | Transaction timestamp. A [Unix epoch time](https://en.wikipedia.org/wiki/Unix_time) recording when the transaction was created. Used by the PoSV consensus mechanism to calculate coin age for staking. This field is unique to Reddcoin and other Peercoin-derived blockchains; it is not present in Bitcoin transactions.           |

A transaction may have multiple inputs and outputs, so the txIn and txOut structures may recur within a transaction. CompactSize unsigned integers are a form of variable-length integers; they are described in the [CompactSize section](../reference/transactions#compactsize-unsigned-integers).

<a id="txin"></a>

### TxIn: A Transaction Input (Non-Coinbase)

Each non-coinbase input spends an outpoint from a previous transaction. (Coinbase inputs are described separately after the example section below.)

| Bytes    | Name             | Data Type        | Description                                                                                                                                                                                                                    |
| -------- | ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 36       | previous_output  | outpoint         | The previous outpoint being spent. See description of outpoint below.                                                                                                                                                          |
| *Varies* | script bytes     | compactSize uint | The number of bytes in the signature script. Maximum is 10,000 bytes.                                                                                                                                                          |
| *Varies* | signature script | char[]           | A script-language script which satisfies the conditions placed in the outpoint's pubkey script. Should only contain data pushes; see the signature script modification warning. |
| 4        | sequence         | uint32_t         | Sequence number. Default for Reddcoin Core and almost all other programs is 0xffffffff.                                                                                                                                        |

<a id="outpoint"></a>

### Outpoint: The Specific Part Of A Specific Output

Because a single transaction can include multiple outputs, the outpoint structure includes both a TXID and an output index number to refer to specific output.

| Bytes | Name  | Data Type | Description                                                                                                                              |
| ----- | ----- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 32    | hash  | char[32]  | The TXID of the transaction holding the output to spend. The TXID is a hash provided here in internal byte order.                        |
| 4     | index | uint32_t  | The output index number of the specific output to spend from the transaction. The first output is 0x00000000. |

<a id="txout"></a>

### TxOut: A Transaction Output

Each output spends a certain number of reddoshis, placing them under control of anyone who can satisfy the provided pubkey script.

| Bytes    | Name            | Data Type        | Description                                                                                                                                                                                                                                                       |
| -------- | --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8        | value           | int64_t          | Number of reddoshis to spend. May be zero; the sum of all outputs may not exceed the sum of reddoshis previously spent to the outpoints provided in the input section. (Exception: coinbase transactions spend the block subsidy and collected transaction fees.) |
| 1+       | pk_script bytes | compactSize uint | Number of bytes in the pubkey script. Maximum is 10,000 bytes.                                                                                                                                                                                                    |
| *Varies* | pk_script       | char[]           | Defines the conditions which must be satisfied to spend this output.                                                                                                                                                                                              |

<a id="coinbase"></a>

### Coinbase Transaction (PoS Blocks)

In Proof of Stake blocks (block 260,800 onward), the coinbase transaction serves as a structural placeholder. Unlike Bitcoin's coinbase which pays the block reward, the Reddcoin PoS coinbase has a single output with zero value and an empty script. The block reward is instead paid through the coinstake transaction.

The coinbase input has the following format:

| Bytes        | Name               | Data Type        | Description                                                                                                                                                                                                                                   |
| ------------ | ------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 32           | hash (null)        | char[32]         | A 32-byte null, as a coinbase has no previous outpoint.                                                                                                                                                                                       |
| 4            | index (UINT32_MAX) | uint32_t         | 0xffffffff, as a coinbase has no previous outpoint.                                                                                                                                                                                           |
| *Varies*     | script bytes       | compactSize uint | The number of bytes in the coinbase script, up to a maximum of 100 bytes.                                                                                                                                                                     |
| *Varies* (4) | height             | script           | The block height encoded as per [BIP34](https://github.com/bitcoin/bips/blob/master/bip-0034.mediawiki). Required since block 5,558,400. Starts with a data-pushing opcode (0x03) followed by the height as a little-endian unsigned integer. |
| *Varies*     | coinbase script    | *None*           | Arbitrary data not exceeding 100 bytes minus the height bytes.                                                                                                                                                                                |
| 4            | sequence           | uint32_t         | Sequence number.                                                                                                                                                                                                                              |

An itemized PoS coinbase transaction (block 5,558,400):

```
02000000 .............................. Version

01 .................................... Number of inputs
| 00000000000000000000000000000000
| 00000000000000000000000000000000 ...  Previous outpoint TXID
| ffffffff ............................ Previous outpoint index
|
| 06 .................................. Bytes in coinbase: 6
| | 03 ................................ Push 3 bytes (BIP34 height)
| | | 80d054 .......................... Height: 5,558,400
| | 0101 .............................. Arbitrary data
| ffffffff ............................ Sequence

01 .................................... Output count
| 0000000000000000 .................... Reddoshis (0 RDD)
| 00 .................................. Empty pubkey script

00000000 .............................. Locktime
6690e366 .............................. nTime: transaction timestamp
```

<a id="coinstake"></a>

### Coinstake Transaction

The second transaction in every PoS block is the coinstake transaction. It spends a staker's existing UTXO and produces new outputs that include the staking reward. A coinstake is identified by its first output having zero value and an empty script (the coinstake marker).

Since the PoSV v2 hard fork at block 3,382,230, coinstake transactions include a development fund output.

The coinstake has the following structure:

| Bytes    | Name            | Data Type        | Description                                                                                                                          |
| -------- | --------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 4        | version         | int32_t          | Transaction version number.                                                                                                          |
| *Varies* | tx_in count     | compactSize uint | Number of inputs (typically 1).                                                                                                      |
| *Varies* | tx_in           | txIn             | The staker's UTXO being consumed. Uses a standard signature script to prove ownership.                                               |
| *Varies* | tx_out count    | compactSize uint | Number of outputs: 4 since PoSV v2 (marker + 2 stake splits + dev fund).                                                             |
| 9        | marker output   | txOut            | **Output 0:** Value = 0, empty pubkey script (0 bytes). This identifies the transaction as a coinstake.                              |
| *Varies* | stake output 1  | txOut            | **Output 1:** First portion of the staker's coins plus reward, paid to a P2PK script using the staker's public key.                  |
| *Varies* | stake output 2  | txOut            | **Output 2:** Second portion of the staker's coins plus reward, paid to the same P2PK script. The stake is split across two outputs. |
| *Varies* | dev fund output | txOut            | **Output 3:** Development fund contribution (PoSV v2, block 3,382,230+). Paid to a fixed P2PK script.                                |
| 4        | lock_time       | uint32_t         | Locktime (typically 0).                                                                                                              |
| 4        | nTime           | uint32_t         | Transaction timestamp, used for coin age calculation.                                                                                |

An itemized coinstake transaction (block 5,558,400):

```
02000000 .............................. Version

01 .................................... Number of inputs
| 0739ac215963130fc3f528622c08089a
| 4619529fd38fc52d64bd57847fca3d92 ...  Outpoint TXID
| 02000000 ............................ Outpoint index: 2
|
| 48 .................................. Bytes in sig. script: 72
| | 47 ................................ Push 71 bytes as data
| | | 304402206dd00c4b316760ac106195
| | | 3cde7ebd0c7507c09595391530d66e
| | | 6459d77391d1022050122cf686eee6
| | | fd6acd05ca93f1336c16a85f4e3980
| | | 3a9d4a04215289235add01 ......... Secp256k1 signature
|
| ffffffff ............................ Sequence number: UINT32_MAX

04 .................................... Number of outputs

| 0000000000000000 .................... Output 0: Coinstake marker (0 RDD)
| 00 .................................. Empty pubkey script

| 002d0b9b60710000 .................... Output 1: Stake split 1
| 23 .................................. Bytes in pubkey script: 35
| | 21 ................................ Push 33 bytes (compressed pubkey)
| | | 024ca9fe369e75be010694f2f324a0
| | | fd08714929815ee14792e39e03f3f3
| | | aff652 .......................... Staker's public key
| | ac ................................ OP_CHECKSIG

| 594a169b60710000 .................... Output 2: Stake split 2
| 23 .................................. Bytes in pubkey script: 35
| | 21024ca9fe369e75be010694f2f324a0
| | fd08714929815ee14792e39e03f3f3
| | aff652ac .......................... Same staker P2PK script

| 7ee170ac00000000 .................... Output 3: Dev fund
| 23 .................................. Bytes in pubkey script: 35
| | 2103c8fc5c87f00bcc32b5ce5c036957
| | f8befeff05bf4d88d2dcde720249f78d
| | 9313ac ............................ Dev fund P2PK script

00000000 .............................. Locktime
6690e366 .............................. nTime: transaction timestamp
```

<a id="tx-signing"></a>

## Transaction Signing

Reddcoin uses the same [secp256k1](http://www.secg.org/sec2-v2.pdf) ECDSA cryptography and the same SIGHASH types as Bitcoin (`SIGHASH_ALL`, `SIGHASH_NONE`, `SIGHASH_SINGLE`, `SIGHASH_ANYONECANPAY`). Although Reddcoin transactions include an `nTime` field in their wire format, this field is **excluded** from all signature hash (sighash) preimage computations. The signing process is identical to Bitcoin's for each respective script version.

### Signature Hash Preimage

The `nTime` field is part of the full transaction serialization (and therefore affects the TXID), but it is **not** included when computing the hash that a signature commits to. This applies to all signing paths: legacy, SegWit v0 (BIP143), and Taproot (BIP341/342).

**Legacy signing** serializes the transaction with the usual SIGHASH modifications to inputs and outputs (script blanking, input/output pruning per the hash type), and the serialized data is double-SHA256 hashed. The `nTime` field is excluded from this serialization by `CTransactionSignatureSerializer`. The preimage order is:

```
nVersion ........... int32_t
vin ................ modified per SIGHASH type
vout ............... modified per SIGHASH type
nLockTime .......... uint32_t
nHashType .......... uint32_t
```

**SegWit v0 (BIP143-style) signing** constructs the preimage as follows. The `nTime` field is not included:

```
nVersion ........... int32_t
hashPrevouts ....... uint256 (hash of all input outpoints)
hashSequence ....... uint256 (hash of all input sequences)
outpoint ........... the outpoint being signed
scriptCode ......... the script being executed
amount ............. int64_t (value of the output being spent)
nSequence .......... uint32_t (sequence of the input being signed)
hashOutputs ........ uint256 (hash of all outputs)
nLockTime .......... uint32_t
nHashType .......... uint32_t
```

**Taproot (BIP341/342) signing** uses `SignatureHashSchnorr` which also excludes `nTime`. The preimage follows the standard BIP341 structure with `nVersion` and `nLockTime` as the only transaction-level scalar fields.

**Implementation note:** The `nTime` field affects the TXID because it is part of the full transaction serialization — the same transaction content with a different timestamp produces a different hash. However, a Bitcoin signing implementation can be used without modification for the sighash computation itself. The only Reddcoin-specific requirement for signing libraries is that the transaction serializer must handle the `nTime` field in the wire format so that TXIDs are computed correctly.

#### CompactSize Unsigned Integers

The raw transaction format and several [peer-to-peer network](../devguide/p2p_network) messages use a type of variable-length integer to indicate the number of bytes in a following piece of data.

Reddcoin Core code and this document refers to these variable length integers as compactSize. Many other documents refer to them as var_int or varInt, but this risks conflation with other variable-length integer encodings—such as the CVarInt class used in Reddcoin Core for serializing data to disk. Because it's used in the transaction format, the format of compactSize unsigned integers is part of the consensus rules.

For numbers from 0 to 252, compactSize unsigned integers look like regular unsigned integers. For other numbers up to 0xffffffffffffffff, a byte is prefixed to the number to indicate its length—but otherwise the numbers look like regular unsigned integers in little-endian order.

| Value                                    | Bytes Used | Format                                  |
| ---------------------------------------- | ---------- | --------------------------------------- |
| >= 0 && \<= 252                          | 1          | uint8_t                                 |
| >= 253 && \<= 0xffff                     | 3          | 0xfd followed by the number as uint16_t |
| >= 0x10000 && \<= 0xffffffff             | 5          | 0xfe followed by the number as uint32_t |
| >= 0x100000000 && \<= 0xffffffffffffffff | 9          | 0xff followed by the number as uint64_t |

For example, the number 515 is encoded as 0xfd0302.

