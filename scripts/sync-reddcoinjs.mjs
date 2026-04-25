#!/usr/bin/env node
/*
 * Sync the reddcoinjs-lib API reference into api/reddcoinjs-lib/.
 *
 * Strategy:
 *   1. Run TypeDoc (via the upstream's `doc:md` npm script) in the
 *      sibling reddcoinjs-lib checkout. The script invokes
 *      `typedoc --options typedoc.md.json` which uses
 *      typedoc-plugin-markdown.
 *   2. Wipe api/reddcoinjs-lib/ in this repo.
 *   3. Copy the generated docs-md/ into api/reddcoinjs-lib/.
 *
 * Idempotent — running twice with no upstream changes produces no
 * diff. Pin the upstream commit in UPSTREAM_COMMIT below; sync PRs
 * bump it together with the resulting content diff.
 *
 * Usage:
 *   node scripts/sync-reddcoinjs.mjs
 *   UPSTREAM_DIR=/path/to/reddcoinjs-lib node scripts/sync-reddcoinjs.mjs
 *   SKIP_TYPEDOC=1 node scripts/sync-reddcoinjs.mjs   # use existing docs-md/
 */

import {execSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const UPSTREAM_DIR = process.env.UPSTREAM_DIR
  || join(process.env.HOME, 'Projects/reddcoinjs-lib');

// Pinned upstream commit. Bump this in the same PR that updates the
// synced content so reviewers see both together.
const UPSTREAM_COMMIT = 'f29a7b0e';

const target = join(repo, 'api/reddcoinjs-lib');
const sourceDocs = join(UPSTREAM_DIR, 'docs-md');

if (!existsSync(UPSTREAM_DIR)) {
  console.error(`upstream not found: ${UPSTREAM_DIR}`);
  process.exit(1);
}

if (!process.env.SKIP_TYPEDOC) {
  console.log(`> running TypeDoc (markdown) in ${UPSTREAM_DIR}`);
  execSync('npm run doc:md', {cwd: UPSTREAM_DIR, stdio: 'inherit'});
} else {
  console.log(`> SKIP_TYPEDOC=1; using existing ${sourceDocs}`);
}

if (!existsSync(sourceDocs)) {
  console.error(`generated dir missing: ${sourceDocs}`);
  process.exit(1);
}

if (existsSync(target)) {
  console.log(`> wiping ${target}`);
  rmSync(target, {recursive: true});
}

mkdirSync(dirname(target), {recursive: true});
cpSync(sourceDocs, target, {recursive: true});
console.log(`> copied to ${target}`);

// Rewrite README links that point at typedoc's _media/ assets. We
// don't want to publish the upstream LICENSE / CONTRIBUTING.md as
// separate Docusaurus pages — link to the upstream GitHub instead.
const upstreamRepoUrl = 'https://github.com/reddcoin-project/reddcoinjs-lib';
const readme = join(target, 'README.md');
if (existsSync(readme)) {
  let r = readFileSync(readme, 'utf8');
  r = r.replace(/\]\(_media\/([^)]+)\)/g, `](${upstreamRepoUrl}/blob/master/$1)`);
  // Upstream README links `#examples` to a section that no longer
  // exists. Point at the integration tests, which act as examples.
  r = r.replace(/\]\(#examples\)/g, `](${upstreamRepoUrl}/tree/master/test/integration)`);
  writeFileSync(readme, r);
}
const mediaDir = join(target, '_media');
if (existsSync(mediaDir)) rmSync(mediaDir, {recursive: true});

// Every typedoc-generated README.md shares a breadcrumb preface
// before its real H1 (e.g. "[**reddcoinjs-lib v7.0.1-rdd.1**](…)
// • **Docs**\n\n***\n\n# payments"). Docusaurus's title extractor
// reads the first heading-like construct and lands on "README"
// (the doc id) instead. Prepend a `title:` frontmatter pulled from
// the H1 so the navbar / breadcrumbs / `<title>` are sensible.
function* walkReadmes(dir) {
  for (const ent of readdirSync(dir, {withFileTypes: true})) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) yield* walkReadmes(p);
    else if (ent.name === 'README.md') yield p;
  }
}
for (const path of walkReadmes(target)) {
  let body = readFileSync(path, 'utf8');
  if (/^---\n/.test(body)) continue; // already has frontmatter
  const m = body.match(/^#\s+(.+?)\s*$/m);
  const title = m ? m[1].trim() : 'reddcoinjs-lib';
  // For the top-level README, prefer the package name. For namespace
  // READMEs the H1 IS the namespace name, which is what we want.
  body = `---\ntitle: ${title}\n---\n\n` + body;
  writeFileSync(path, body);
}

console.log(`> upstream pinned at commit ${UPSTREAM_COMMIT}`);
