---
id: translations
title: Translating ReddCoin Core
description: How to contribute translations to the ReddCoin Core user interface.
sidebar_position: 4
---

# Translating ReddCoin Core

ReddCoin Core inherits its translation infrastructure from upstream
Bitcoin Core, which uses [Transifex](https://www.transifex.com/).
The user-interface strings — wallet messages, menu items, dialogs,
error text — are extracted into translation files that anyone can
contribute to.

## Quick path

1. Create a [Transifex](https://www.transifex.com/) account.

2. Find the ReddCoin Core translation project. The maintainers list
   the current Transifex project URL in the
   [`reddcoin-project/reddcoin`](https://github.com/reddcoin-project/reddcoin)
   README. (If you can't find it there, open a Discussion or ask on
   Discord — the project may have shifted to a different platform.)

3. On the project page, click **Join team** near the top and pick the
   languages you want to contribute to.

4. Once joined, choose a release/branch you want to contribute to,
   then the language, then the resource. Untranslated strings appear
   on the left; type the translation on the right and save.

5. Reviewed translations get pulled into the next ReddCoin Core
   release.

## Without Transifex

If you'd rather contribute translations directly via GitHub — for
example to add a new language not yet on Transifex, or to fix a typo
in an already-translated string — open an issue or PR against
[`reddcoin-project/reddcoin`](https://github.com/reddcoin-project/reddcoin)
describing the change. The maintainers can either merge the patch
directly or open the corresponding Transifex pull on your behalf.

## Translating this site

The documentation site itself is currently English-only. Docusaurus
has built-in [i18n support](https://docusaurus.io/docs/i18n/introduction);
turning it on for additional languages is on the long-term roadmap
but not active today. If you'd like to drive that effort —
particularly for major communities (Spanish, Chinese, Russian,
Indonesian) — open an issue at
[`reddcoin-project/reddcoin-docs`](https://github.com/reddcoin-project/reddcoin-docs)
describing your plan and the languages you'd cover.

## Questions

Ask in
[GitHub Discussions](https://github.com/reddcoin-project/reddcoin/discussions),
on the project's Discord, or on Telegram. The translation maintainers
listed on Transifex (where applicable) are the authoritative source
for tooling questions.
