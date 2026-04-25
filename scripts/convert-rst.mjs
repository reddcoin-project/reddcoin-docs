#!/usr/bin/env node
/*
 * Phase 1: convert developer.reddcoin.com Sphinx/RST → MyST/Markdown.
 *
 * One-shot script. Walks the upstream source dirs, runs each .rst file
 * through `rst2myst stream` (from the project's .venv), and writes .md
 * output into the corresponding location in this repo. Per the plan,
 * the output of running this script is committed untouched as the
 * pre-cleanup baseline; subsequent commits do the post-process pass
 * (Sphinx :ref: rewrites, image moves, autocrossref expansion, etc.).
 *
 * After Phase 1 lands and post-process is complete, this script gets
 * archived (kept in git history; removed from scripts/ so npm run
 * tab-completion doesn't surface it). It is not a regenerable sync.
 *
 * Usage:
 *   node scripts/convert-rst.mjs                           # default upstream
 *   UPSTREAM_DIR=/path/to/developer.reddcoin.com node …    # custom upstream
 *
 * Requires: .venv with rst-to-myst installed
 *   python3 -m venv .venv
 *   .venv/bin/pip install -r requirements.txt
 */

import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {dirname, extname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = process.env.UPSTREAM_DIR || `${process.env.HOME}/Projects/developer.reddcoin.com`;
const RST2MYST = join(repo, '.venv', 'bin', 'rst2myst');

if (!existsSync(SRC)) {
  console.error(`upstream not found: ${SRC}`);
  process.exit(1);
}
if (!existsSync(RST2MYST)) {
  console.error(`rst2myst not found at ${RST2MYST}`);
  console.error(`run: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`);
  process.exit(1);
}

// Source path (relative to SRC) → target path (relative to repo).
// Directory entries walk recursively; file entries map 1:1.
const map = [
  {from: 'devguide',     to: 'docs/protocol/devguide'},
  {from: 'reference',    to: 'docs/protocol/reference'},
  {from: 'examples',     to: 'docs/protocol/examples'},
  {from: 'glossary.rst', to: 'docs/glossary/index.md'},
  {from: 'terms.rst',    to: 'tools/rst2md/_terms.md'},
];

function walkRst(dir, out = []) {
  for (const ent of readdirSync(dir)) {
    const p = join(dir, ent);
    const s = statSync(p);
    if (s.isDirectory()) walkRst(p, out);
    else if (extname(p) === '.rst') out.push(p);
  }
  return out;
}

function convertOne(srcAbs, dstAbs) {
  mkdirSync(dirname(dstAbs), {recursive: true});
  const r = spawnSync(RST2MYST, ['stream', srcAbs], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.status !== 0) {
    return {ok: false, warnings: 0, err: r.stderr};
  }
  writeFileSync(dstAbs, r.stdout);
  const warnings = r.stderr ? r.stderr.split('\n').filter(Boolean).length : 0;
  return {ok: true, warnings};
}

let ok = 0, fail = 0, warnings = 0;
const failures = [];

for (const entry of map) {
  const fromAbs = join(SRC, entry.from);
  if (!existsSync(fromAbs)) {
    console.warn(`skip (missing): ${entry.from}`);
    continue;
  }
  const isFile = statSync(fromAbs).isFile();

  if (isFile) {
    const dstAbs = join(repo, entry.to);
    const r = convertOne(fromAbs, dstAbs);
    warnings += r.warnings;
    if (r.ok) {
      ok++;
      process.stdout.write(`ok  ${entry.from} → ${entry.to}` + (r.warnings ? `  (${r.warnings} warnings)` : '') + '\n');
    } else {
      fail++;
      failures.push({src: entry.from, err: r.err});
      process.stdout.write(`FAIL  ${entry.from}\n`);
    }
    continue;
  }

  for (const f of walkRst(fromAbs)) {
    const rel = relative(fromAbs, f);
    const dstRel = rel.replace(/\.rst$/, '.md');
    const dstAbs = join(repo, entry.to, dstRel);
    const r = convertOne(f, dstAbs);
    warnings += r.warnings;
    if (r.ok) {
      ok++;
      if (r.warnings) {
        process.stdout.write(`ok  ${entry.from}/${rel} → ${entry.to}/${dstRel}  (${r.warnings} warnings)\n`);
      }
    } else {
      fail++;
      failures.push({src: `${entry.from}/${rel}`, err: r.err});
      process.stdout.write(`FAIL  ${entry.from}/${rel}\n`);
    }
  }
}

console.log(`\nsummary: ${ok} ok, ${fail} fail, ${warnings} docutils warnings total`);

if (failures.length) {
  console.log('\nfailures:');
  for (const f of failures) {
    console.log(`\n--- ${f.src} ---\n${f.err.split('\n').slice(0, 5).join('\n')}`);
  }
}

process.exit(fail ? 1 : 0);
