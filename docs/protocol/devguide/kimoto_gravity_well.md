# Kimoto Gravity Well

The **Kimoto Gravity Well (KGW)** is the difficulty-adjustment algorithm ReddCoin uses to keep blocks arriving roughly every 60 seconds. Unlike Bitcoin, which retargets once every 2,016 blocks, KGW retargets on **every block** using a sliding window of recent history. This page walks through the algorithm as it is actually implemented in ReddCoin Core (`src/pow.cpp`).

## Why Adjust Every Block?

A fixed retarget interval works acceptably when hashing power is relatively stable, but it reacts slowly when network participation changes quickly. In a small-cap chain a single large staker (or, historically, a single large miner) joining or leaving the network can shift effective block time by an order of magnitude long before the next retarget arrives.

KGW addresses this by:

- Recomputing the target on every block.
- Weighting evidence from the recent past more heavily than evidence from the distant past by truncating the window as soon as observed block spacing deviates significantly from the target.
- Clamping the response so that small random fluctuations over long windows cannot move the difficulty by much.

The result is a target that tracks the real arrival rate closely without oscillating on every lucky or unlucky block.

## Core Idea

At each block, KGW compares the **actual** time taken to produce the last *N* blocks against the **expected** time (`N × 60 s`), then scales the running average difficulty of those same *N* blocks by that ratio:

$$
\text{bnNew} = \overline{D}_N \times \frac{T_\text{actual}}{T_\text{expected}}
$$

where $\overline{D}_N$ is the arithmetic mean of the previous *N* block targets and *N* is determined dynamically — large enough to be statistically meaningful, but truncated as soon as the rate has drifted far enough that older blocks no longer represent current network conditions. That truncation threshold is called the **event horizon**.

Note that `bnNew` here is a *target* (larger target = easier work), so a ratio greater than 1 (blocks arriving too slowly) *raises* the target and makes the next block easier to produce.

## Algorithm Walkthrough

The full implementation lives in `src/pow.cpp`: the wrapper `GetNextWorkRequired` selects window bounds, and `KimotoGravityWell` does the work.

### Window bounds

`GetNextWorkRequired` (`src/pow.cpp`) picks the minimum and maximum number of blocks KGW is allowed to consider:

```cpp
static const int64_t BlocksTargetSpacing = 1 * 60;      // 1 minute
unsigned int        TimeDaySeconds       = 60 * 60 * 24;

int64_t PastSecondsMin = TimeDaySeconds * 0.25;         // 6 hours
int64_t PastSecondsMax = TimeDaySeconds * 7;            // 7 days

if (pindexLast->nHeight < 6000) {
    PastSecondsMin = TimeDaySeconds * 0.01;             // ~14.4 minutes
    PastSecondsMax = TimeDaySeconds * 0.14;             // ~3.4 hours
}

uint64_t PastBlocksMin = PastSecondsMin / BlocksTargetSpacing;
uint64_t PastBlocksMax = PastSecondsMax / BlocksTargetSpacing;
```

For the mainnet chain after block 6,000 this resolves to:

- **PastBlocksMin = 360** (6 hours of target spacing)
- **PastBlocksMax = 10,080** (7 days of target spacing)

During the genesis bootstrap window (blocks 0–5,999) the bounds are tightened to **14** and **201** blocks so that difficulty can track the chain's early, sparse history without waiting for a full day of samples.

### Iterating over past blocks

`KimotoGravityWell` walks backwards from `pindexLast`, one block at a time, accumulating two quantities:

1. A running **arithmetic mean** of the past block targets (stored as `PastDifficultyAverage`).
2. The total **elapsed time** between the most recent block and the current candidate for the oldest block in the window.

The mean update is the standard Welford-style recurrence:

```cpp
if (PastDifficultyAverage >= PastDifficultyAveragePrev)
    PastDifficultyAverage = ((PastDifficultyAverage - PastDifficultyAveragePrev) / i) + PastDifficultyAveragePrev;
else
    PastDifficultyAverage = PastDifficultyAveragePrev - ((PastDifficultyAveragePrev - PastDifficultyAverage) / i);
```

Both branches are algebraically equivalent to $((i-1)\bar{D}_{i-1} + D_i)/i$; the two-branch form simply avoids unsigned underflow in `arith_uint256`. After $i$ iterations, `PastDifficultyAverage` holds the simple arithmetic mean of the last $i$ block targets.

Alongside the mean, the loop tracks:

```cpp
PastRateActualSeconds = BlockLastSolved->GetBlockTime() - BlockReading->GetBlockTime();
PastRateTargetSeconds = TargetBlocksSpacingSeconds * PastBlocksMass;

if (PastRateActualSeconds != 0 && PastRateTargetSeconds != 0)
    PastRateAdjustmentRatio = double(PastRateTargetSeconds) / double(PastRateActualSeconds);
```

`PastRateAdjustmentRatio` is the dimensionless measurement KGW uses as its termination signal.

- Ratio **> 1** → blocks are arriving **faster** than target.
- Ratio **< 1** → blocks are arriving **slower** than target.
- Ratio **= 1** → the window is perfectly on-target.

### The Event Horizon

At every step the loop computes the **event horizon deviation**, a function of how many blocks are currently in the window:

```cpp
EventHorizonDeviation     = 1 + (0.7084 * pow((double(PastBlocksMass) / double(144)), -1.228));
EventHorizonDeviationFast = EventHorizonDeviation;
EventHorizonDeviationSlow = 1 / EventHorizonDeviation;
```

This is the distinctive part of KGW. It defines an allowed band `[EventHorizonDeviationSlow, EventHorizonDeviationFast]` that shrinks monotonically toward 1 as the window grows. A handful of representative values:

| Blocks in window | EHD (fast, ratio ≥ this means "too slow") | EHD slow (ratio ≤ this means "too fast") | Allowed deviation from target |
| --- | --- | --- | --- |
| 15 | 6.23 | 0.16 | ±523% / −84% |
| 144 | 1.71 | 0.59 | ±71% / −41% |
| 360 | 1.24 | 0.80 | ±24% / −20% |
| 1,440 | 1.05 | 0.95 | ±5% / −5% |
| 10,080 | 1.003 | 0.997 | ±0.3% |

As soon as two conditions are both met — we have accumulated at least `PastBlocksMin` samples **and** `PastRateAdjustmentRatio` has drifted outside the allowed band — the loop stops:

```cpp
if (PastBlocksMass >= PastBlocksMin) {
    if ((PastRateAdjustmentRatio <= EventHorizonDeviationSlow) ||
        (PastRateAdjustmentRatio >= EventHorizonDeviationFast)) {
        break;
    }
}
```

The effect: when block production is close to target, KGW keeps widening its sample to get a statistically stable average, eventually capping at `PastBlocksMax`. When block production has clearly drifted, KGW cuts the window off at whatever length is sufficient to detect the drift and discards older history that no longer represents the current network.

### Computing the new target

After the loop exits, the new target is the running mean of window targets, scaled by the observed-vs-target ratio:

```cpp
arith_uint256 bnNew(PastDifficultyAverage);

if (PastRateActualSeconds != 0 && PastRateTargetSeconds != 0) {
    bnNew *= PastRateActualSeconds;
    bnNew /= PastRateTargetSeconds;
}
```

Then the result is clamped to the per-era limit:

```cpp
if (!fProofOfStake && bnNew > bnPowLimit) {
    bnNew = bnPowLimit;
} else if (fProofOfStake && bnNew > bnPosLimit) {
    bnNew = bnPosLimit;
}
```

`bnPowLimit` and `bnPosLimit` are defined per network in `chainparams.cpp` and act as a floor on effective difficulty (a ceiling on the target).

## PoW / PoSV Transition

ReddCoin is unusual in that a single function produces targets for both the historical PoW era (blocks 0–260,799) and the PoSV era (block 260,800 onward). Two transition-specific branches in `KimotoGravityWell` handle the handover:

```cpp
bool fProofOfStake = false;
if (pindexLast && pindexLast->nHeight >= params.nLastPowHeight)
    fProofOfStake = true;

if (BlockLastSolved == nullptr || BlockLastSolved->nHeight == 0
    || (uint64_t)BlockLastSolved->nHeight < PastBlocksMin) {
    return bnPowLimit.GetCompact();
} else if (fProofOfStake && (uint64_t)(BlockLastSolved->nHeight - params.nLastPowHeight) < PastBlocksMin) {
    if (params.fPowAllowMinDifficultyBlocks)
        return bnPosLimit.GetCompact();
    else
        return bnPosReset.GetCompact();
}
```

The first branch returns the easy PoW limit while the chain is too young to have a full window of history at all. The second handles the first `PastBlocksMin` blocks of the PoSV era: `bnPosReset` is a hand-tuned seed target that lets PoSV bootstrap from a realistic difficulty rather than starting at the easy-limit and immediately crashing back down once enough samples exist.

The walk-back loop in `KimotoGravityWell` itself is also gated on `params.nLastPowHeight` so that PoSV difficulty is never computed from a mix of PoW and PoSV samples:

```cpp
for (unsigned int i = 1; BlockReading && BlockReading->nHeight > (fProofOfStake ? params.nLastPowHeight : 0); i++) {
    ...
}
```

## Formula Summary

Putting the pieces together, the new target after block $N$ is:

$$
\text{bnNew} =
\frac{1}{M} \sum_{k=1}^{M} D_{N-k}
\;\times\;
\frac{T_\text{actual}}{M \cdot T_\text{target}}
$$

where:

- $M$ is the sample length at which the loop terminated, bounded by `PastBlocksMin` ≤ $M$ ≤ `PastBlocksMax`.
- $D_{N-k}$ is the target (`nBits` decoded) of the $k$-th most recent block.
- $T_\text{actual}$ is the wall-clock time between block $N$ and block $N-M$.
- $T_\text{target}$ is ReddCoin's 60-second target spacing.

The loop terminates early (taking $M < \text{PastBlocksMax}$) whenever $M \ge \text{PastBlocksMin}$ and

$$
\frac{M \cdot T_\text{target}}{T_\text{actual}}
\;\notin\;
\left[\, \tfrac{1}{1 + 0.7084 \cdot (M/144)^{-1.228}} ,\;
               1 + 0.7084 \cdot (M/144)^{-1.228} \,\right]
$$

## Worked Example

Suppose the chain has been producing blocks slightly slowly: the last 360 blocks took 24,000 seconds instead of the expected `360 × 60 = 21,600` seconds. Then:

- $M = 360$ (we hit `PastBlocksMin` first and the ratio is still inside the band).
- $T_\text{actual} / T_\text{expected} = 24{,}000 / 21{,}600 \approx 1.111$.
- Event horizon at $M = 360$ is `1 + 0.7084·(360/144)^-1.228 ≈ 1.245`. A ratio of 1.111 is inside `[0.803, 1.245]`, so the loop continues past 360 — the window grows until either the ratio leaves the band or $M$ reaches 10,080.

If it ultimately terminates at $M = 1,440$ still inside the band, the new target is the mean of the last 1,440 block targets multiplied by about 1.111. That is, difficulty drops by roughly 10%, bringing the expected arrival time back to 60 s.

Now suppose instead the network suddenly gains staking power and the last 360 blocks took only 12,000 s:

- $T_\text{actual} / T_\text{expected} = 12{,}000 / 21{,}600 \approx 0.556$.
- `EventHorizonDeviationSlow` at $M = 360$ is $1 / 1.245 \approx 0.803$.
- $0.556 < 0.803$, so the loop exits at $M = 360$ rather than diluting the signal with seven days of stale, low-difficulty blocks.

The new target is the 360-block mean scaled by 0.556 — difficulty roughly **doubles**, quickly reining in the faster block production.

## Constants and Their Origins

Two numbers in the event-horizon formula deserve a comment:

- **144** — the normalisation block count. In KGW as originally published by its author, Dr. Kimoto Chan, 144 corresponded to roughly one day at a 10-minute target spacing. ReddCoin inherited the constant unchanged; at ReddCoin's 60-second target spacing, 144 blocks is 2.4 hours rather than a day, which is simply a historical artefact of the algorithm's lineage.
- **0.7084 and -1.228** — fitted coefficients that give the event horizon its desired shape. They are not derived from first principles; they are empirical values that produce a pleasant "tight at long windows, loose at short windows" curve.

None of these constants are chain-specific; they are identical across every KGW deployment. The only ReddCoin-specific numbers live in `GetNextWorkRequired`: the target spacing (60 s), the window bounds (6 hours to 7 days), and the boundary height (6,000) below which those bounds are tightened.

## Further Reading

- `src/pow.cpp` in ReddCoin Core — authoritative implementation.
- [How does the Kimoto Gravity Well regulate difficulty?](https://bitcoin.stackexchange.com/questions/21730/how-does-the-kimoto-gravity-well-regulate-difficulty) — walkthrough from the Bitcoin Stack Exchange.
- [block_chain](block_chain) — where KGW fits into ReddCoin's block chain architecture.
- [staking](staking) — the PoSV consensus layer that calls into KGW for difficulty.

