#!/usr/bin/env node
/*
 * Phase 1 post-process pass over the raw RST→MyST import.
 *
 * Goal of this pass: get `npm run build` green by stripping or
 * rewriting the patterns that Docusaurus's MDX loader rejects. This
 * is the cheap automatable rewrite; the proper :ref:/_autocrossref
 * resolution, image moves, sidebar wiring, and `{eval-rst}` block
 * conversion happen as separate passes.
 *
 * Idempotent — running twice produces no diff after the first run.
 *
 * Usage:
 *   node scripts/postprocess-rst.mjs
 */

import {existsSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, extname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const TARGET_DIRS = ['docs/protocol', 'docs/glossary'];

function walkMd(dir, out = []) {
  for (const ent of readdirSync(dir)) {
    const p = join(dir, ent);
    const s = statSync(p);
    if (s.isDirectory()) walkMd(p, out);
    else if (extname(p) === '.md') out.push(p);
  }
  return out;
}

// Build a name → URL map for autocrossref-resolve. The map lets the
// {ref} rewrites turn `{ref}\`text <anchor>\`` into a proper Markdown
// link instead of dropping it to plain text. Two sources:
//
// 1. docs/glossary/terms.md — published by scripts/publish-terms.mjs.
//    Holds the full term-* registry from upstream's terms.rst, each
//    entry exposed as a heading + HTML anchor.
// 2. (name)= MyST anchor labels embedded inline in the raw protocol
//    docs (only a handful — `blocksig`, `txin`, `coinstake`, etc.).
//
// docs/glossary/terms.md must exist before postprocess runs. The
// publish step is one-shot; postprocess assumes it has already run.
function buildAnchorMap() {
  const map = new Map();

  // (1) terms.md — recognise `{#id}` heading-IDs.
  const termsPath = join(repo, 'docs/glossary/terms.md');
  if (existsSync(termsPath)) {
    const t = readFileSync(termsPath, 'utf8');
    for (const m of t.matchAll(/\{#([a-z][a-z0-9_-]*)\}/g)) {
      map.set(m[1], `/glossary/terms#${m[1]}`);
    }
  }

  // (1b) glossary/index.md — same `{#id}` form, different route.
  const glossaryPath = join(repo, 'docs/glossary/index.md');
  if (existsSync(glossaryPath)) {
    const g = readFileSync(glossaryPath, 'utf8');
    for (const m of g.matchAll(/\{#([a-z0-9][a-z0-9_-]*)\}/g)) {
      if (!map.has(m[1])) map.set(m[1], `/glossary/#${m[1]}`);
    }
  }

  // (2) Inline (name)= anchors inside docs/protocol. terms.md wins for
  //     name collisions because it's the canonical published target.
  const protocolDir = join(repo, 'docs/protocol');
  if (existsSync(protocolDir)) {
    for (const file of walkMd(protocolDir)) {
      const content = readFileSync(file, 'utf8');
      const matches = [...content.matchAll(/^\(([a-z][a-z0-9_-]*)\)=$/gm)];
      if (matches.length === 0) continue;
      let route = '/protocol/' + relative(protocolDir, file).replace(/\.md$/, '');
      // index.md collapses to its parent route.
      route = route.replace(/\/index$/, '');
      for (const m of matches) {
        if (!map.has(m[1])) map.set(m[1], `${route}#${m[1]}`);
      }
    }
  }

  return map;
}

const anchorMap = buildAnchorMap();

// Slugify a term name into a Docusaurus heading-id slug.
// Lowercase, runs of non-alphanumeric collapsed to a single hyphen.
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Each pass either runs over the full document body (default) or
// line-by-line while tracking ```-fence state (for rewrites that must
// not reach inside code blocks).

const passes = [
  // 1. Drop the {{ Warning icon }} placeholder. The surrounding bold
  //    text already says "warning"; the icon was rendered by Sphinx.
  {name: 'jinja-warning-icon', re: /\{\{\s*Warning icon\s*\}\}\s*/g, sub: ''},

  // 1b. Strip the Pandoc-style `% …` license-header comment block at
  //     the very top of 150+ RPC pages. rst2myst preserved them but
  //     they render as a visible paragraph and — worse, on index.md
  //     pages — block Docusaurus's H1-based title extraction (the
  //     /protocol/reference/rpc/ landing was reading as "index"
  //     instead of "RPC API Reference"). The licence already lives in
  //     LICENSE; no need to repeat it on every page.
  {
    name: 'strip-leading-license-comments',
    re: /^(?:%[^\n]*\n)+\s*\n/,
    sub: '',
  },

  // 2. Sphinx role wrappers. {doc} becomes a relative link; {ref} and
  //    {term} drop the wrapper, leaving the human-readable text (the
  //    cross-ref restoration step rebuilds proper links from the
  //    autocrossref table).
  {name: 'doc-with-text', re: /\{doc\}`([^`<]+?)\s*<([^`>]+)>`/g, sub: '[$1]($2)'},
  {name: 'doc-bare',      re: /\{doc\}`([^`<>]+)`/g,              sub: '[$1]($1)'},

  // {ref} resolution via the anchor map built from docs/glossary/terms.md
  // and the inline (name)= anchors in docs/protocol. If the anchor is
  // known, emit a Markdown link to its resolved URL; otherwise fall
  // through to plain text (keeps the human-readable hint visible even
  // when the cross-ref target was lost in conversion).
  {
    name: 'autocrossref-with-text',
    re: /\{ref\}`([^`<]+?)\s*<([^`>]+)>`/g,
    sub: (_, text, anchor) => {
      const url = anchorMap.get(anchor);
      return url ? `[${text}](${url})` : text;
    },
  },
  {
    name: 'autocrossref-bare',
    re: /\{ref\}`([^`<>]+)`/g,
    sub: (_, anchor) => {
      const url = anchorMap.get(anchor);
      return url ? `[${anchor}](${url})` : anchor;
    },
  },

  // {term} resolution against the published glossary. Slugify the
  // term name and look it up in the anchor map (which includes every
  // glossary entry's explicit `{#slug}` ID). When the slug isn't in
  // the map (e.g. terms not in our glossary) we fall through to plain
  // text so the build doesn't surface a broken-anchor warning for
  // every miss.
  {
    name: 'term-with-text',
    re: /\{term\}`([^`<]+?)\s*<([^`>]+)>`/g,
    sub: (_, text, term) => {
      const slug = slugify(term);
      const url = anchorMap.get(slug);
      return url ? `[${text}](${url})` : text;
    },
  },
  {
    name: 'term-bare',
    re: /\{term\}`([^`<>]+)`/g,
    sub: (_, term) => {
      const slug = slugify(term);
      const url = anchorMap.get(slug);
      return url ? `[${term}](${url})` : term;
    },
  },
  {name: 'actual',   re: /\{actual\}`([^`]+)`/g,   sub: '$1'},
  {name: 'expected', re: /\{expected\}`([^`]+)`/g, sub: '$1'},
  {name: 'target',   re: /\{target\}`([^`]+)`/g,   sub: '$1'},
  {name: 'raw',      re: /\{raw\}`([^`]+)`/g,      sub: '$1'},

  // 3. Code-fence cleanup.
  //    `.. highlight::` survives as ```{highlight} LANG; rewrite to plain
  //    ```LANG. Then strip the empty `text`-only blocks the directive
  //    leaves behind.
  {name: 'highlight-fence',  re: /^```\{highlight\}\s+(\S+)/gm,    sub: '```$1'},
  {name: 'empty-text-fence', re: /^```text\s*\n```\s*\n?/gm,       sub: ''},

  // 3b. Fold "sandwich" fences. rst2myst sometimes emits the content
  //     of an RST `::` literal block as plain text *between* two
  //     empty fences (artifact of the `.. highlight::` + `::` pattern).
  //     The text usually contains script pseudo-code (`<sig>`,
  //     `<Hash160(redeemScript)>`) which then trips MDX. Fold the
  //     six lines back into a single code block.
  //
  //     ```                ←  empty fence opens
  //                        ←
  //     ```                ←  empty fence closes
  //     <content>          ←  was meant to be inside the fence
  //     ```                ←  empty fence opens
  //                        ←
  //     ```                ←  empty fence closes
  {
    name: 'fold-sandwich-fences',
    re: /^```\s*\n\s*\n```\s*\n([\s\S]+?)\n```\s*\n\s*\n```\s*$/gm,
    sub: '```\n$1\n```',
  },

  // 3c. Fold the "empty-lang-prefix" variant. rst2myst sometimes
  //     emits an RST `.. highlight:: <lang>` followed by a separate
  //     fence holding the actual content. Combine them into a single
  //     ```{lang} block.
  //
  //     Two layouts to handle, with and without a blank line between
  //     the two empty fences. Run the four-fence variant first so it
  //     doesn't get mis-matched by the three-fence one.
  //
  //     four-fence:        three-fence:
  //     ```python          ```python
  //     ```                ```
  //                        <content>
  //     ```                ```
  //     <content>
  //     ```
  {
    name: 'fold-empty-lang-prefix-4fence',
    re: /^```(\S+)\s*\n```\s*\n\s*\n```\s*\n([\s\S]+?)\n```\s*$/gm,
    sub: '```$1\n$2\n```',
  },
  {
    name: 'fold-empty-lang-prefix-3fence',
    re: /^```(\S+)\s*\n```\s*\n([\s\S]+?)\n```\s*$/gm,
    sub: '```$1\n$2\n```',
  },

  // 3d. Pull prose that ended up *inside* an empty ```{lang} fence
  //     back out above it. Sometimes rst2myst lifts a `.. code-block::`
  //     directive's caption / preceding paragraph into the fence
  //     itself, leaving a layout like:
  //
  //       ```shell
  //       Bump the fee, get the new transaction's txid:
  //                                ←  blank
  //       ```                      ←  fake close
  //       reddcoin-cli bumpfee <txid>
  //       ```                      ←  real close
  //
  //     becomes:
  //
  //       Bump the fee, get the new transaction's txid:
  //
  //       ```shell
  //       reddcoin-cli bumpfee <txid>
  //       ```
  {
    name: 'unbury-prose-from-empty-lang-block',
    re: /^```(\S+)\s*\n([^\n`]+)\n\s*\n```\s*\n([^\n`]+)\n```\s*$/gm,
    sub: '$2\n\n```$1\n$3\n```',
  },

  // 4. Strip `{toctree}` and `{contents}` blocks — Docusaurus owns
  //    sidebar / TOC; the upstream blocks would conflict.
  {name: 'toctree-block',  re: /^```\{toctree\}\s*\n[\s\S]*?\n```\s*\n?/gm,  sub: ''},
  {name: 'contents-block', re: /^```\{contents\}\s*\n[\s\S]*?\n```\s*\n?/gm, sub: ''},

  // 5. Strip the outer :::{glossary} wrapper, keep contents as plain
  //    Markdown definition lists (the multi-term blockquote → defn
  //    list normalisation is a separate cosmetic concern).
  {name: 'glossary-directive', re: /^:::\{glossary\}\s*\n([\s\S]*?)\n:::\s*$/gm, sub: '$1'},

  // 5b. Strip the .html extension on relative cross-doc links left
  //     over from the Sphinx HTML build (Docusaurus uses extensionless
  //     relative paths). Preserves any #anchor.
  {name: 'strip-html-ext', re: /\]\(([^)]+?)\.html(#[^)]*)?\)/g, sub: ']($1$2)'},

  // 5c. Trailing /index on relative cross-doc links — Docusaurus
  //     resolves /protocol/<section>/index to /protocol/<section>/
  //     because the index doc owns the section root. Drop /index from
  //     the link so it matches the actual route.
  {name: 'strip-index-suffix', re: /\]\((\.\.\/[^)]+?)\/index(#[^)]*)?\)/g, sub: ']($1$2)'},

  // 5d. Specific auto-slug → explicit-id link fixup. The Sphinx-era
  //     link `#block-signature` referenced the heading auto-slug, but
  //     `myst-anchor-to-heading-id` now overrides that heading with
  //     the MyST short label `{#blocksig}`, so the auto-slug no
  //     longer resolves. One known reference; rewrite it to point at
  //     the explicit ID. Add similar entries here when other auto-slug
  //     references surface in the build warnings.
  {name: 'fixup-block-signature-anchor', re: /#block-signature\b/g, sub: '#blocksig'},

  // 5e. Bitcoin-fork legacy: the upstream RST kept `#bitcoin-uri`
  //     after rebrand. The actual heading in payment_processing.md is
  //     `### reddcoin: URI` (auto-slug `reddcoin-uri`).
  {name: 'fixup-bitcoin-uri-anchor', re: /#bitcoin-uri\b/g, sub: '#reddcoin-uri'},

  // 5f. The upstream link `#locktime_parsing_rules` referenced a
  //     `:ref:` label that was never defined in the source. The
  //     intended target is the "Locktime And Sequence Number" section
  //     in devguide/transactions.md (auto-slug
  //     `locktime-and-sequence-number`), which covers the parsing
  //     rules.
  {name: 'fixup-locktime-anchor', re: /#locktime_parsing_rules\b/g, sub: '#locktime-and-sequence-number'},

  // 5g. Image dir reorg per MIGRATION_PLAN.md Section 5: the upstream
  //     img/{dev,full-node,icons} subtree lives under
  //     static/img/protocol/ in the new layout. Rewrite all references
  //     to match. Idempotent — won't re-match `/img/protocol/...`.
  {
    name: 'rewrite-image-paths-to-protocol',
    re: /\/img\/(dev|full-node|icons)\//g,
    sub: '/img/protocol/$1/',
  },

  // 5h. Stray backticks inside single-quoted curl payloads. The
  //     upstream RST wrapped the JSON in inline code, and rst2myst
  //     emitted literal backticks at the boundaries:
  //
  //         curl … --data-binary '`{"jsonrpc": …}`' …
  //
  //     Those backticks would be passed verbatim to the server. Strip
  //     them. Pattern is narrow enough that legit `'…'` quoted
  //     content with backticks at both ends is unaffected — match
  //     requires no quotes or backticks inside.
  {name: 'strip-quoted-payload-backticks', re: /'`([^'`]+)`'/g, sub: "'$1'"},

  // 6. <https://…> autolinks → [URL](URL). MDX reads `<` as the start
  //    of a JSX tag and chokes on the `://` slashes.
  {name: 'autolink-url', re: /<((?:https?|ftp|mailto):[^>\s]+)>/g, sub: '[$1]($1)'},

  // 7. RPC-spec lines that wrap a command in outer backticks AND
  //    contain inner backticks around JSON literals — these are
  //    Markdown-invalid (single backtick can't contain backticks).
  //    Rewrite the whole line into a fenced code block, stripping
  //    the inner backticks so the content is plain.
  {
    // Require ≥1 non-backtick char before the inner backtick so a
    // bare ``` line doesn't match (which would explode every code
    // fence into an empty sandwich and undo fold-sandwich-fences).
    name: 'malformed-inline-code-line',
    re: /^`([^`\n]+`[^\n]*)`$/gm,
    sub: (_, inner) => '```\n' + inner.replace(/`/g, '') + '\n```',
  },

  // 8. JSON literals in prose like `{"includeWatching":true}` — wrap
  //    in inline code so MDX doesn't read braces as JSX expressions.
  //    Handles up to one level of nested braces. Fence-aware so it
  //    doesn't reach into already-fenced code blocks.
  {
    name: 'json-literal-in-prose',
    re: /(?<!`)\{"[^"]*"\s*:(?:[^{}]|\{[^{}]*\})*\}(?!`)/g,
    sub: '`$&`',
    fenceAware: true,
  },

  // 3e. Final structural pass: collapse alternating fence runs that
  //     leave commands stranded outside fences. Stateful — see
  //     balanceAlternatingFences().
  {name: 'balance-alternating-fences', fn: balanceAlternatingFences},

  // 3f. MyST block directives that Docusaurus doesn't know about and
  //     would render as undefined components.
  {name: 'figure-directives',    fn: convertFigureDirectives},
  {name: 'container-directives', fn: stripContainerDirectives},
  {name: 'note-directives',      fn: convertNoteDirectives},
  {name: 'list-table-directives', fn: convertListTables},

  // 3g. MyST `(name)=` anchor labels followed by a heading become a
  //     Docusaurus explicit heading ID on the heading line. With
  //     `markdown.format: 'detect'` in docusaurus.config.ts the .md
  //     files parse as plain Markdown (not MDX), so the `{#id}`
  //     syntax is honoured by the anchor scanner — cross-doc links
  //     to `#id` resolve cleanly.
  {
    name: 'myst-anchor-to-heading-id',
    re: /^\(([a-z][a-z0-9_-]*)\)=\s*\n\s*\n(#{1,6}\s+[^\n]+?)\s*$/gm,
    sub: '$2 {#$1}',
  },

  // 6. Brand-capitalisation: rewrite `Reddcoin` → `ReddCoin` in
  //    user-visible prose. The protocol docs were imported from a
  //    bitcoin.org fork that pre-dated the project's brand rule of
  //    "ReddCoin" (double-D) for user-visible text. Skip:
  //      - fenced code blocks (state-machine on ```)
  //      - text inside single-backtick inline code spans (e.g. the
  //        Windows path `%APPDATA%\Reddcoin\` is the actual directory
  //        name on disk and must not be rewritten)
  //      - URLs / domains (already lowercase: `reddcoin.com`,
  //        `developer.reddcoin.com`, `reddcoin-cli`, `reddcoind`,
  //        `reddcoinjs-lib`) — `\bReddcoin\b` only matches the
  //        capitalised form, so these are safe.
  {name: 'brand-capitalisation', fn: applyBrandCapitalisation},
];

function applyBrandCapitalisation(content) {
  const lines = content.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    // Split on backticks; alternating segments are outside/inside
    // inline code (segment 0, 2, 4, … are outside; 1, 3, 5, … inside).
    const parts = lines[i].split('`');
    for (let k = 0; k < parts.length; k += 2) {
      parts[k] = parts[k].replace(/\bReddcoin\b/g, 'ReddCoin');
    }
    lines[i] = parts.join('`');
  }
  return content === lines.join('\n') ? content : lines.join('\n');
}

// Detect a line that is entirely a single-backtick inline-code span
// — `cmd [arg1] [arg2]`. Such lines aren't prose; their `{…}` braces
// are already inside inline code, and the JSON-wrap pass should leave
// them alone.
function isInlineCodeLine(line) {
  return /^`[^`\n]+`$/.test(line);
}

// Convert :::{figure} blocks to plain Markdown images with caption.
// Sphinx's `figure` directive carries an :alt:, optional class, and a
// caption block. Docusaurus has no `figure` component registered, so
// MDX renders it as <figure /> and crashes ("figure is not defined").
//
//   :::{figure} /img/dev/foo.svg
//   :alt: Some alt text
//
//   Some caption.
//   :::
//
// becomes:
//
//   ![Some alt text](/img/dev/foo.svg)
//
//   Some caption.
function convertFigureDirectives(content) {
  return content.replace(
    /^:::\{figure\}\s+(\S+)\s*\n([\s\S]*?)\n:::\s*$/gm,
    (_, src, body) => {
      const altMatch = body.match(/^:alt:\s*(.+)$/m);
      const alt = altMatch ? altMatch[1].trim() : '';
      const caption = body
        .split('\n')
        .filter(line => !/^:[a-z][a-z-]*:/i.test(line))
        .join('\n')
        .trim();
      const img = `![${alt}](${src})`;
      return caption ? `${img}\n\n${caption}` : img;
    },
  );
}

// :::{container} <classes>… ::: → keep the inner content, drop the
// wrapper. Docusaurus has no `container` component either.
function stripContainerDirectives(content) {
  return content.replace(
    /^:::\{container\}[^\n]*\n([\s\S]*?)\n:::\s*$/gm,
    '$1',
  );
}

// :::{note}…::: → :::note…::: (Docusaurus admonition).
function convertNoteDirectives(content) {
  return content.replace(
    /^:::\{note\}\s*\n([\s\S]*?)\n:::\s*$/gm,
    ':::note\n$1\n:::',
  );
}

// ```{eval-rst}\n.. list-table:: …\n``` → real Markdown table.
// rst2myst couldn't translate `.. list-table::` so it wrapped it in
// an `{eval-rst}` block, which renders as raw RST inside a code
// block — that's the "Result" section mess on most RPC pages.
//
// Each row in the source looks like:
//
//   * - Name
//     - Type
//     - Description
//   * - str
//     - string
//     - The resulting raw transaction
//
// We honour `:header-rows: N` and ignore other options (`:widths:`
// has no Markdown equivalent). Cells are joined with " " on
// continuation lines and pipes are escaped.
function convertListTables(content) {
  const escape = c => c.replace(/\|/g, '\\|');

  return content.replace(
    /^```\{eval-rst\}\s*\n\.\. list-table::[^\n]*\n([\s\S]*?)\n```$/gm,
    (match, body) => {
      const lines = body.split('\n');
      let i = 0;
      let headerRows = 0;
      // Skip directive options at top.
      while (i < lines.length && /^\s*:[a-z-]+:/.test(lines[i])) {
        const m = lines[i].match(/header-rows:\s*(\d+)/);
        if (m) headerRows = parseInt(m[1], 10);
        i++;
      }
      while (i < lines.length && lines[i].trim() === '') i++;

      const rows = [];
      let cur = null;
      while (i < lines.length) {
        const line = lines[i];
        if (/^\s*\*\s+-/.test(line)) {
          if (cur) rows.push(cur);
          cur = [line.replace(/^\s*\*\s+-\s?/, '').trimEnd()];
        } else if (/^\s+-\s/.test(line) && cur) {
          cur.push(line.replace(/^\s+-\s?/, '').trimEnd());
        } else if (line.trim() && cur) {
          cur[cur.length - 1] = (cur[cur.length - 1] + ' ' + line.trim()).trim();
        }
        i++;
      }
      if (cur) rows.push(cur);

      if (rows.length === 0) return match;
      const cols = Math.max(...rows.map(r => r.length));
      for (const r of rows) while (r.length < cols) r.push('');

      const out = [];
      if (headerRows >= 1) {
        out.push('| ' + rows[0].map(escape).join(' | ') + ' |');
        out.push('|' + rows[0].map(() => ' --- ').join('|') + '|');
        for (let r = 1; r < rows.length; r++) {
          out.push('| ' + rows[r].map(escape).join(' | ') + ' |');
        }
      } else {
        out.push('|' + Array(cols).fill('   ').join('|') + '|');
        out.push('|' + Array(cols).fill(' --- ').join('|') + '|');
        for (const r of rows) {
          out.push('| ' + r.map(escape).join(' | ') + ' |');
        }
      }
      return out.join('\n');
    },
  );
}

// Balance alternating-fence regions like:
//     ```shell        ← lang opens
//     cmd1            ← content
//     ```             ← close
//     cmd2            ← orphan plain text
//     ```             ← orphan open
//     cmd3            ← content
//     ```             ← close
//     ...
// Collapse the run into a single ```{lang} block holding all the
// command lines. Visually compresses what was meant to be N adjacent
// code blocks into one, but keeps the build green and preserves all
// content. A later manual pass can re-split into separate blocks if
// needed.
function balanceAlternatingFences(content) {
  const lines = content.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (/^```\S/.test(lines[i])) {
      const lang = lines[i].slice(3).trim();
      let j = i + 1;
      const contentLines = [];
      let expectingContent = true;
      while (j < lines.length) {
        if (expectingContent) {
          if (lines[j] === '' || /^```/.test(lines[j])) break;
          contentLines.push(lines[j]);
          j++;
          expectingContent = false;
        } else {
          if (lines[j] !== '```') break;
          j++;
          expectingContent = true;
        }
      }
      // ≥ 2 content lines = an actual alternation; collapse it.
      if (contentLines.length >= 2) {
        out.push('```' + lang);
        out.push(...contentLines);
        out.push('```');
        i = j;
        continue;
      }
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n');
}

function applyPass(pass, content) {
  if (pass.fn) {
    const before = content;
    const after = pass.fn(content);
    return {content: after, hits: before === after ? 0 : 1};
  }
  if (!pass.fenceAware) {
    const matches = content.match(pass.re);
    if (!matches) return {content, hits: 0};
    return {content: content.replace(pass.re, pass.sub), hits: matches.length};
  }

  // Line-by-line, tracking ```-fence state. We only count and rewrite
  // outside fenced code blocks. Also skip lines that are entirely a
  // single-backtick inline-code span.
  const lines = content.split('\n');
  let inFence = false;
  let hits = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (isInlineCodeLine(lines[i])) continue;
    const matches = lines[i].match(pass.re);
    if (matches) {
      lines[i] = lines[i].replace(pass.re, pass.sub);
      hits += matches.length;
    }
  }
  return {content: lines.join('\n'), hits};
}

let totalFiles = 0;
let totalChanged = 0;
const perPassHits = Object.fromEntries(passes.map(p => [p.name, 0]));

for (const dir of TARGET_DIRS) {
  for (const file of walkMd(join(repo, dir))) {
    totalFiles++;
    const orig = readFileSync(file, 'utf8');
    let content = orig;
    for (const pass of passes) {
      const r = applyPass(pass, content);
      content = r.content;
      perPassHits[pass.name] += r.hits;
    }
    if (content !== orig) {
      writeFileSync(file, content);
      totalChanged++;
    }
  }
}

console.log(`scanned ${totalFiles} files, modified ${totalChanged}`);
console.log('rewrites by pass:');
for (const [name, hits] of Object.entries(perPassHits)) {
  if (hits) console.log(`  ${name.padEnd(28)} ${hits}`);
}
