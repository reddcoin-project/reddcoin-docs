---
id: index
title: Protocol
description: Developer documentation for the ReddCoin blockchain and ReddCoin Core node software.
slug: /
---

# Protocol

Developer documentation for **the ReddCoin blockchain** and **ReddCoin
Core** — the C++ reference implementation of the node and wallet. This
section covers how the chain works, how Core implements it, and how to
interact with a running node.

This is the technical reference layer. User-facing topics — running a
node, setting up a wallet, staking — live under [Guides](/guides) and
link back into this section. How to contribute to Core itself lives
under [Contribute](/contribute).

## Scope

- **The blockchain** — blocks, transactions, scripts, addresses, the
  P2P network, mempool, and consensus rules. ReddCoin is a
  Bitcoin-family chain, so much of this mirrors Bitcoin; the
  differences — address versions, network magic, and PoSV — are called
  out explicitly where they matter.
- **Proof-of-Stake Velocity (PoSV)** — ReddCoin's consensus mechanism.
  How stake weight and velocity combine, how stake-minting produces
  blocks, and the parameters that govern the system. PoSV is the
  single biggest reason ReddCoin Core's rules differ from upstream
  Bitcoin Core, so it gets dedicated treatment.
- **ReddCoin Core** — the `reddcoind` node and its bundled wallet.
  Building from source, configuration (`reddcoin.conf`), runtime
  operation, upgrades, backup and recovery, and the operational
  considerations that come with running the reference software.
- **JSON-RPC reference** — every `reddcoin-cli` / RPC call exposed by
  `reddcoind`, with parameters, return shape, examples, and
  compatibility notes across Core versions.
- **Developer examples** — end-to-end walkthroughs that tie the RPC
  calls together: building a raw transaction, watching the mempool,
  staking from a wallet, inspecting chain state programmatically.

## Migration status

This page is a placeholder. The content is being migrated from the
legacy [developer.reddcoin.com](https://developer.reddcoin.com)
Sphinx/RST site as part of **Phase 1** of the documentation migration.

Until Phase 1 lands, the legacy site remains authoritative. A content
freeze is in effect on that repo from 2026-04-24 — edits land here
from now on, not upstream. After Phase 1 lands, this page becomes the
section's real landing page and the legacy URLs (`/devguide/*`,
`/reference/*`, `/examples/*`) redirect into the new paths under
`/protocol/`.
