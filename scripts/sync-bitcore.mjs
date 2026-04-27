#!/usr/bin/env node
/*
 * Sync bitcore package documentation into api/bitcore/<package>/.
 *
 * Strategy:
 *   1. For each PACKAGES entry, read the upstream package's README.md
 *      and docs/*.md from the bitcore (reddcore) monorepo.
 *   2. Wipe api/bitcore/<package>/ and re-emit the files.
 *   3. Flatten docs/*.md into the package directory (alongside the
 *      package README), rewrite the "docs/" prefix on README links,
 *      and prepend a `title:` frontmatter so Docusaurus picks up the
 *      H1 instead of falling back to the file id.
 *
 * Adding more packages is a one-line change to PACKAGES once their
 * docs are ready.
 *
 * Idempotent — running twice with no upstream changes produces no
 * diff. Pin the upstream commit in UPSTREAM_COMMIT below; sync PRs
 * bump it together with the resulting content diff.
 *
 * Usage:
 *   node scripts/sync-bitcore.mjs
 *   UPSTREAM_DIR=/path/to/reddcore node scripts/sync-bitcore.mjs
 */

import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {basename, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const UPSTREAM_DIR = process.env.UPSTREAM_DIR
  || join(process.env.HOME, 'Projects/bitpay/reddcore');

// Pinned upstream commit. Bump this in the same PR that updates the
// synced content so reviewers see both together.
const UPSTREAM_COMMIT = 'f678ddffa';

// Packages to sync, in priority order. Remaining packages
// (bitcore-wallet-*, …) get appended here as their docs are ready.
const PACKAGES = [
  'bitcore-lib-redd',
  'bitcore-p2p-redd',
  'bitcore-mnemonic',
  'bitcore-node',
];

const target = join(repo, 'api/bitcore');

if (!existsSync(UPSTREAM_DIR)) {
  console.error(`upstream not found: ${UPSTREAM_DIR}`);
  process.exit(1);
}

if (existsSync(target)) {
  console.log(`> wiping ${target}`);
  rmSync(target, {recursive: true});
}
mkdirSync(target, {recursive: true});

for (const name of PACKAGES) {
  syncPackage(name);
}

console.log(`> upstream pinned at commit ${UPSTREAM_COMMIT}`);

function syncPackage(name) {
  const srcPkg = join(UPSTREAM_DIR, 'packages', name);
  if (!existsSync(srcPkg)) {
    console.error(`package missing: ${srcPkg}`);
    process.exit(1);
  }
  const dstPkg = join(target, name);
  mkdirSync(dstPkg, {recursive: true});

  const readmeSrc = join(srcPkg, 'README.md');
  const docsSrc = join(srcPkg, 'docs');

  const hasReadme = existsSync(readmeSrc);
  // When a top-level README and docs/index.md both exist, both
  // resolve to the same Docusaurus directory-index route. Rename
  // docs/index.md → docs.md on output and rewrite any link targets
  // in the README so they continue to resolve.
  const indexRename = hasReadme && existsSync(join(docsSrc, 'index.md'))
    ? {from: 'index.md', to: 'docs.md'}
    : null;

  // Build a list of doc filenames present in this package so we can
  // detect cross-package relative links (e.g. mnemonic referencing
  // hierarchical.md, which only lives in bitcore-lib-redd).
  const localDocs = existsSync(docsSrc)
    ? new Set(readdirSync(docsSrc).filter(f => f.endsWith('.md')))
    : new Set();

  // Copy docs/*.md flat into the package output dir.
  if (existsSync(docsSrc)) {
    for (const ent of readdirSync(docsSrc, {withFileTypes: true})) {
      if (!ent.isFile() || !ent.name.endsWith('.md')) continue;
      const outName = indexRename && ent.name === indexRename.from
        ? indexRename.to
        : ent.name;
      let body = readFileSync(join(docsSrc, ent.name), 'utf8');
      body = rewriteCrossPackageLinks(body, name, localDocs);
      const fallbackTitle = outName.replace(/\.md$/, '');
      const out = withFrontmatter(
        normalizeAnchors(body),
        {title: extractTitle(body) || fallbackTitle},
      );
      writeFileSync(join(dstPkg, outName), out);
    }
  }

  // Package README sits alongside the docs as the package's index page.
  // Docusaurus serves `<dir>/README.md` at `/<dir>/` automatically — no
  // explicit slug needed.
  if (hasReadme) {
    let body = readFileSync(readmeSrc, 'utf8');
    // The upstream README links into its own docs/ subdirectory
    // (`[Addresses](docs/address.md)` or `./docs/address.md`); we've
    // flattened docs/* into the package root, so strip the prefix.
    body = body.replace(/\]\((?:\.\/)?docs\//g, '](');
    if (indexRename) {
      // After the docs/ strip, `(./docs/index.md)` is `(index.md)` —
      // point at the renamed file.
      body = body.replace(
        new RegExp(`]\\(${indexRename.from}([)#])`, 'g'),
        `](${indexRename.to}$1`,
      );
      // Fix the same pattern that was just resolved by rewriteCrossPackageLinks
      // for the README itself (cross-package fallback).
      body = rewriteCrossPackageLinks(body, name, localDocs);
    }
    const out = withFrontmatter(
      normalizeAnchors(body),
      {title: extractTitle(body) || name},
    );
    writeFileSync(join(dstPkg, 'README.md'), out);
  }

  console.log(`> synced ${name}`);
}

function extractTitle(body) {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

// The bitcore docs use GitHub-rendered anchor targets like
// `#Fee_calculation`. Docusaurus generates `#fee-calculation` from
// the same heading. Normalise in-page anchor link targets so they
// match Docusaurus's slug algorithm (lowercase, `_` → `-`).
// Cross-page links (`./other.md#X`) are left alone.
// Resolve relative `.md` links that don't have a target in the current
// package. bitcore-lib-redd is the canonical home for shared concepts
// (HDPrivateKey, Address, etc.), so we fall back to it for any relative
// link whose target file lives there. Untouched if the file exists
// neither locally nor in lib-redd — that's a genuine upstream bug.
function rewriteCrossPackageLinks(body, currentPkg, localDocs) {
  if (currentPkg === 'bitcore-lib-redd') return body;
  const libDocsDir = join(UPSTREAM_DIR, 'packages/bitcore-lib-redd/docs');
  const libDocs = existsSync(libDocsDir)
    ? new Set(readdirSync(libDocsDir).filter(f => f.endsWith('.md')))
    : new Set();
  return body.replace(/]\(([^)#]+\.md)(#[^)]*)?\)/g, (m, file, frag) => {
    if (file.includes('/')) return m; // not a bare relative link
    if (localDocs.has(file)) return m;
    if (libDocs.has(file)) {
      const slug = file.replace(/\.md$/, '');
      return `](/api/bitcore/bitcore-lib-redd/${slug}${frag || ''})`;
    }
    return m;
  });
}

function normalizeAnchors(body) {
  return body.replace(/]\(#([^)]+)\)/g, (_, frag) => {
    const norm = frag.toLowerCase().replace(/_/g, '-');
    return `](#${norm})`;
  });
}

function withFrontmatter(body, fields) {
  if (/^---\n/.test(body)) return body; // already has frontmatter
  const lines = ['---'];
  for (const [k, v] of Object.entries(fields)) {
    if (v == null) continue;
    lines.push(`${k}: ${v}`);
  }
  lines.push('---', '');
  return lines.join('\n') + body;
}
