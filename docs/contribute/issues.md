---
id: issues
title: Contribute Bug Reports
description: Reporting bugs and security issues for ReddCoin Core and related projects.
sidebar_position: 2
---

# Contribute Bug Reports

If you discover a bug or other problem with ReddCoin Core, please
report it. There are two different processes:
[responsible disclosure](#responsible-disclosure) for security bugs
and [public issue tracking](#public-issue-tracking) for everything else.

:::warning

**Don't open an issue to ask for support.** See the
[Tech support](support) page for how to get help.

:::

## Responsible disclosure

For security-sensitive issues — vulnerabilities that could affect the
chain, wallets, or user funds — do **not** file a public issue.
Instead, contact the ReddCoin Core maintainers directly through the
private security channels listed on the
[`reddcoin-project/reddcoin`](https://github.com/reddcoin-project/reddcoin)
README (or via a maintainer on Discord / Telegram if you're already
known there). The maintainers will coordinate disclosure, fixes, and
timing of any release.

## Public issue tracking

For non-security problems, please
[search for similar issues](https://github.com/reddcoin-project/reddcoin/issues)
first; if you don't find any,
[open a new issue](https://github.com/reddcoin-project/reddcoin/issues/new)
including the information below.

1. **A clear description of the problem.** If possible, describe how
   to reproduce it. (For general guidelines on writing reproduction
   steps, see
   [Mozilla's bug-writing guidelines](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Bug_writing_guidelines).)

2. **What version of ReddCoin Core you're running.** If you downloaded
   a release, paste the version string. If you built from source,
   include the commit (`git log -1`) and any extra patches you applied.

3. **Relevant entries from your `debug.log` file.** This file can
   contain private information, so review it before posting — or ask
   in the issue to email it directly to a maintainer instead of
   posting publicly. Logs can be shared via a paste service like
   [0bin.net](https://0bin.net/) if you'd rather not commit them to
   the issue itself.

   By default, `debug.log` lives at:

   - **Windows:** `%APPDATA%\Reddcoin\debug.log`
   - **macOS:** `$HOME/Library/Application Support/Reddcoin/debug.log`
   - **Linux:** `$HOME/.reddcoin/debug.log`

4. **Anything specific about your environment** that might be
   relevant — operating system version, network setup (Tor, VPN,
   firewall rules), stake activity, recent upgrades or downgrades.

The best way to get an issue fixed quickly is to make it as easy as
possible for a maintainer to track down the problem and write a fix.
More information, organised well, helps significantly.

## Bugs in libraries

For bugs in `reddcoinjs-lib` or the bitcore-family libraries, file
issues against the relevant repository under
[`reddcoin-project`](https://github.com/reddcoin-project) — same
guidelines apply.
