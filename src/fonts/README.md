# Fonts

Self-hosted font files wired into the site via `@font-face` rules at
the top of `src/css/custom.css`. Webpack bundles them with content
hashes into `/assets/fonts/Goldplay-*-<hash>.woff2` at build time, so
they cache well and purge cleanly on updates.

These live under `src/fonts/` (not `static/fonts/`) on purpose —
files under `static/` are mirrored verbatim into the build output,
which would produce a second unhashed copy. Keeping them here means
only one copy ships.

## Goldplay

The `Goldplay-*.woff2` files in this directory are copied verbatim
from the ReddCoin branding repo:

- Upstream: `reddcoin-project/branding` — `~/Projects/Branding/fonts/`
- Live: `https://brand.reddcoin.com/fonts/`

Goldplay is a **commercial / licensed typeface** — not Open Font
License. The files ship here because the same licence that covers
their use at `brand.reddcoin.com` covers their use here (both are
ReddCoin project properties).

If the provenance of this repo or the licence coverage changes — for
example if this repo is forked, republished under a different owner,
or a partner wants to reuse the site scaffold — the Goldplay files
must be removed and the `--font-logo` stack in `custom.css` falls
back to the system stack. The branding repo's `README.md` section
*Fonts* is the authoritative note on Goldplay licensing; check there
before changing anything.

### How to update

When Goldplay is updated in the branding repo, copy the new `.woff2`
files in:

```bash
cp ~/Projects/Branding/fonts/Goldplay-*.woff2 static/fonts/
```

Version bumps are intentional — don't script them into the build.

## Other fonts

**Roboto**, **Rubik**, and **Roboto Mono** are loaded from Google Fonts
via `<link>` tags in `docusaurus.config.ts`. They are not self-hosted
because they're freely redistributable and Google's CDN is fine for
them. Same stack the brand guide uses.
