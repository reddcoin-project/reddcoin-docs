# Staking

Staking adds new blocks to the block chain using Proof of Stake Velocity (PoSV), making transaction history hard to modify while rewarding coin holders who actively participate in securing the network.

## Introduction

ReddCoin uses Proof of Stake Velocity (PoSV) as its consensus mechanism, which replaced Proof of Work mining at block 260,800. Under PoSV, anyone holding Reddcoins can participate in block creation by keeping their wallet open and connected to the network. No specialized hardware is required.

PoSV rewards active participation through a non-linear coin age function that provides increasing returns for recently staked coins (up to 7 days) and diminishing returns for older coins (capped at 45 days). This "velocity" incentive encourages regular staking rather than hoarding.

## How Staking Works

When you stake, your wallet periodically searches for a valid **stake kernel**. A stake kernel is a hash computed from:

- A **stake modifier** that changes every 13 minutes, preventing precomputation of future kernels
- The **previous transaction's** block time, offset, timestamp, and output index
- The **current block timestamp**

If the resulting hash is below the difficulty target (scaled by your coin-day weight), you have found a valid kernel and can create a new block.

The **coin-day weight** is the product of the coin value and the PoSV coin age function:

- **Phase 1 (0–7 days after minimum age):** A cubic polynomial providing accelerating returns for fresh staking activity.
- **Phase 2 (7+ days):** A logarithmic function providing diminishing returns, capping weight at 45 days of coin age.

Coins must be at least **8 hours old** (minimum stake age) before they become eligible.

## Staking Setup

To stake with `reddcoin-qt` or `reddcoind`:

1. Ensure your wallet contains Reddcoins that are at least 8 hours old.

2. Keep your wallet application running and connected to the network.

3. If your wallet is encrypted, unlock it for staking only using:

   ```
   reddcoin-cli walletpassphrase "your-passphrase" 0 true
   ```

   The third parameter `true` indicates unlock for staking only.

4. Verify staking status using the `getstakinginfo` RPC:

   ```
   reddcoin-cli getstakinginfo
   ```

   This returns information including whether staking is active, your wallet's total staking weight, the estimated network staking weight, and the expected time to your next stake.

## Coinstake Transactions

When your wallet finds a valid stake kernel, it creates a **coinstake transaction** with the following structure:

- **vin\[0\]:** The staked coin input (the kernel input)
- **vin\[1..n\]:** Optional additional inputs from the same address for combining
- **vout\[0\]:** An empty output (the PoS block marker—identifies this as a PoS block)
- **vout\[1\]:** Stake output returning coins plus the staking reward
- **vout\[2\]:** Optional split output (for stake splitting)

The wallet may also **split** large staking inputs into smaller outputs when the coin age is below 45 days and the value exceeds 2,000,000 RDD. This helps optimize future staking probability by distributing coin age across multiple outputs.

## Staking Rewards

Stakers earn a **5% annual return** (`COIN_YEAR_REWARD = 5 * CENT`) on their staked coin-days. The reward formula is:

```
reward = coin_age_days * COIN_YEAR_REWARD * 33 / (365 * 33 + 8)
```

This accounts for leap years by using an average year length of (365 * 33 + 8) / 33 days. In addition to the staking reward, the staker also receives all transaction fees from transactions included in the block.

The coinstake maturity period is **30 blocks**—staking rewards cannot be spent until 30 blocks have been confirmed after the staking block.

An **inflation adjustment mechanism** dynamically scales rewards to maintain the target 5% annual inflation rate, with the adjustment bounded between 0.5x and 5.0x of the base rate.

## Difficulty Adjustment

ReddCoin uses the **Kimoto Gravity Well (KGW)** algorithm for difficulty adjustment, which adjusts difficulty every block rather than at fixed intervals. KGW:

1. Computes a running arithmetic mean of past block targets over a sliding window of 360 to 10,080 blocks.
2. Compares the actual time between blocks against the 60-second target.
3. Uses an "event horizon" mechanism to prevent extreme difficulty swings.

This allows the network to respond rapidly to changes in active staking power while maintaining stability. See [kimoto_gravity_well](kimoto_gravity_well) for a full walkthrough of the algorithm.

## Security Considerations

PoSV includes several security features to prevent attacks:

- **Stake modifier rotation:** Changes every 13 minutes, preventing attackers from precomputing valid stake kernels at the time of coin acquisition.
- **Non-linear coin aging:** The logarithmic phase prevents "nothing-at-stake" attacks where old coins could dominate block creation.
- **Block signatures:** Every PoS block must be cryptographically signed with the key controlling the staked output.
- **Coinstake timestamp protocol:** The coinstake transaction timestamp must exactly match the block timestamp, preventing timestamp manipulation.

To execute a 51% attack, an attacker would need to control a majority of the actively staked coins in the network, making it economically costly as acquiring a majority stake would significantly increase the coin's price.

## Staking RPCs

The following RPCs are useful for staking:

- `getstakinginfo`—Returns current staking status, weights, difficulty, and expected time to next stake.
- `walletpassphrase`—Unlocks an encrypted wallet for staking (with the staking-only flag).
- `getbalance`—Shows available balance including immature staking rewards.

