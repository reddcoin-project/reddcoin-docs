---
title: payments
---

[**reddcoinjs-lib v7.0.1-rdd.1**](../../README.md) • **Docs**

***

[reddcoinjs-lib v7.0.1-rdd.1](../../globals.md) / payments

# payments

Provides functionality for creating and managing Bitcoin payment objects.

This module supports multiple Bitcoin address types for payments, including:
- P2PKH (Pay-to-PubKey-Hash)
- P2SH (Pay-to-Script-Hash)
- P2WPKH (Pay-to-Witness-PubKey-Hash)
- P2WSH (Pay-to-Witness-Script-Hash)
- P2TR (Taproot)

The `Payment` interface defines the structure of a payment object used for constructing various
payment types, with fields for signatures, public keys, redeem scripts, and more.

## Index

### Interfaces

- [Payment](interfaces/Payment.md)
- [PaymentOpts](interfaces/PaymentOpts.md)

### Type Aliases

- [PaymentCreator](type-aliases/PaymentCreator.md)
- [PaymentFunction](type-aliases/PaymentFunction.md)
- [Stack](type-aliases/Stack.md)
- [StackElement](type-aliases/StackElement.md)
- [StackFunction](type-aliases/StackFunction.md)

### Functions

- [embed](functions/embed.md)
- [p2ms](functions/p2ms.md)
- [p2pk](functions/p2pk.md)
- [p2pkh](functions/p2pkh.md)
- [p2sh](functions/p2sh.md)
- [p2tr](functions/p2tr.md)
- [p2wpkh](functions/p2wpkh.md)
- [p2wsh](functions/p2wsh.md)
