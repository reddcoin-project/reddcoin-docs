#!/usr/bin/env node
/*
 * Normalise docs/glossary/index.md into a Docusaurus-friendly form.
 *
 * The raw rst2myst output of glossary.rst gives us inconsistent
 * structure: single-term entries land as Pandoc definition lists
 * (`Term\n\n: definition`) while multi-term entries fall back to
 * blockquotes (`Term1\nTerm2\n\n> definition`). Neither form
 * registers anchors with Docusaurus's heading-ID checker, so the
 * `{term}` cross-references in the protocol docs would generate
 * broken-anchor warnings even when they target real entries.
 *
 * This script rewrites every entry as one or more `## Term {#slug}`
 * headings:
 *
 *   - The first term in each group gets the full definition (including
 *     any `**Not to be confused with:**` follow-up).
 *   - Each additional term in a group gets its own H2 with a one-line
 *     redirect "See [Primary Term](#primary-slug)."
 *
 * Result: every term name, primary or synonym, has a real heading
 * with a kebab-case explicit ID, so `{term}` references rewritten by
 * scripts/postprocess-rst.mjs land on a registered anchor.
 *
 * One-shot. Runs against the just-converted glossary; not idempotent
 * past the first call. Re-run from raw if you need to regenerate.
 */

import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const FILE = join(repo, 'docs/glossary/index.md');

if (!existsSync(FILE)) {
  console.error(`glossary missing: ${FILE}`);
  process.exit(1);
}

const raw = readFileSync(FILE, 'utf8');

// Strip the H1; we'll re-emit it.
const body = raw.replace(/^# Glossary\s*\n+/, '');
const lines = body.split('\n');

// State machine: collect [terms, definition] pairs.
function parseEntries(lines) {
  const entries = [];
  let i = 0;

  function isTermLine(s) {
    if (!s) return false;
    if (s.startsWith(':') || s.startsWith('>') || s.startsWith(' ')) return false;
    // Skip directive / front-matter / heading-ish leftovers.
    if (s.startsWith('#')) return false;
    return true;
  }

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === '') i++;
    if (i >= lines.length) break;

    // Read consecutive term lines.
    const terms = [];
    while (i < lines.length && isTermLine(lines[i])) {
      terms.push(lines[i].trim());
      i++;
    }
    if (terms.length === 0) {
      // Skip non-term content (e.g. lingering directive remnants).
      i++;
      continue;
    }

    // Skip the blank between terms and definition.
    while (i < lines.length && lines[i].trim() === '') i++;

    // Read the definition until we see a blank followed by another
    // term line (or end of file).
    const defLines = [];
    while (i < lines.length) {
      const cur = lines[i];
      if (cur.trim() === '') {
        // Look ahead — is the next non-blank line a term?
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        if (j >= lines.length || isTermLine(lines[j])) {
          break;
        }
        defLines.push('');
        i = j;
        continue;
      }
      defLines.push(cur);
      i++;
    }

    // Strip the leading marker on each definition line.
    const cleaned = defLines.map(l => {
      if (l.startsWith(': ')) return l.slice(2);
      if (l === ':') return '';
      if (l.startsWith('> ')) return l.slice(2);
      if (l === '>') return '';
      // Continuation indents (definition lists use two-space indent).
      if (l.startsWith('  ')) return l.slice(2);
      return l;
    }).join('\n').trim();

    entries.push({terms, definition: cleaned});
  }

  return entries;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const entries = parseEntries(lines);

const header = `---
id: index
title: Glossary
description: ReddCoin and Bitcoin-family terminology used across the documentation.
slug: /
---

# Glossary

Terminology used across the ReddCoin documentation. Each term is an
anchor target for \`{term}\` cross-references from the protocol
pages.

`;

const sections = [];
for (const e of entries) {
  const primary = e.terms[0];
  const primarySlug = slugify(primary);

  sections.push(`## ${primary} {#${primarySlug}}`);
  sections.push('');
  sections.push(e.definition);
  sections.push('');

  // Synonym redirect entries.
  for (const syn of e.terms.slice(1)) {
    const synSlug = slugify(syn);
    if (synSlug === primarySlug) continue;
    sections.push(`## ${syn} {#${synSlug}}`);
    sections.push('');
    sections.push(`See [${primary}](#${primarySlug}).`);
    sections.push('');
  }
}

writeFileSync(FILE, header + sections.join('\n').trim() + '\n');
console.log(`rewrote ${FILE} with ${entries.length} entries (${entries.reduce((n, e) => n + e.terms.length, 0)} term anchors)`);
