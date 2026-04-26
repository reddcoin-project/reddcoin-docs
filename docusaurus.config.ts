import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ReddCoin Docs',
  tagline: 'Protocol reference, library APIs, and operator guides for ReddCoin — The Social Currency',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.reddcoin.com',
  baseUrl: '/',

  organizationName: 'reddcoin-project',
  projectName: 'reddcoin-docs',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    // .md files parse as plain CommonMark (Docusaurus's heading-ID
    // syntax `## Heading {#id}` works), .mdx files parse as MDX. The
    // protocol docs are all .md and don't use JSX; src/pages/api.mdx
    // is the only file that needs MDX semantics.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Math support — Phase 1 protocol docs use $…$ and $$…$$ blocks
  // (e.g. the Kimoto Gravity Well derivation). Without these plugins
  // MDX tries to parse `\frac{a}{b}` as a JSX expression and crashes.
  // KaTeX CSS is added via headTags below so equations render
  // correctly on the client.

  // Apply math plugins to every plugin-content-docs instance.
  // (Docusaurus's `markdown.{remark,rehype}Plugins` only feeds the
  // preset's docs/blog; standalone plugin instances need their own
  // remark/rehype lists, which we do per-plugin below.)

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32x32.png'}},
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon-16x16.png'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', sizes: '180x180', href: '/img/apple-touch-icon.png'}},
    {tagName: 'link', attributes: {rel: 'manifest', href: '/site.webmanifest'}},
    {tagName: 'meta', attributes: {name: 'theme-color', content: '#E30613'}},
    {tagName: 'meta', attributes: {name: 'google-site-verification', content: '2JDRSLQQTViD-7KdP10DKAQcNdYmG9Qvaw1ydIJLYB4'}},
    // Open Graph — explicit type/site_name and image dimensions help
    // LinkedIn/Slack/Facebook scrapers render previews without
    // re-fetching the asset to measure it.
    {tagName: 'meta', attributes: {property: 'og:type', content: 'website'}},
    {tagName: 'meta', attributes: {property: 'og:site_name', content: 'ReddCoin Docs'}},
    {tagName: 'meta', attributes: {property: 'og:image:width', content: '1200'}},
    {tagName: 'meta', attributes: {property: 'og:image:height', content: '630'}},
    {tagName: 'meta', attributes: {property: 'og:image:type', content: 'image/png'}},
    {tagName: 'meta', attributes: {property: 'og:image:alt', content: 'ReddCoin — The Social Currency'}},
    // Site-wide JSON-LD on the homepage. Per-doc pages also emit
    // BreadcrumbList automatically via the content-docs plugin.
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'ReddCoin Docs',
        url: 'https://docs.reddcoin.com/',
        description: 'Protocol reference, library APIs, and operator guides for ReddCoin — The Social Currency',
        inLanguage: 'en',
        publisher: {
          '@type': 'Organization',
          name: 'ReddCoin Project',
          url: 'https://reddcoin.com/',
          logo: 'https://docs.reddcoin.com/img/logo.svg',
          sameAs: [
            'https://github.com/reddcoin-project',
            'https://brand.reddcoin.com/',
          ],
        },
      }),
    },
    // KaTeX CSS for client-side math rendering (Phase 1 protocol docs
    // contain MathJax/KaTeX-style equations).
    {tagName: 'link', attributes: {rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css', integrity: 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV', crossorigin: 'anonymous'}},
    // Google Fonts — Roboto (body), Rubik (UI labels), Roboto Mono
    // (code). Goldplay (display) is self-hosted from /fonts/ via
    // @font-face in custom.css.
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'}},
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Rubik:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap',
      },
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'protocol',
        path: 'docs/protocol',
        routeBasePath: 'protocol',
        sidebarPath: './sidebars/protocol.ts',
        editUrl: 'https://github.com/reddcoin-project/reddcoin-docs/tree/master/',
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'guides',
        path: 'docs/guides',
        routeBasePath: 'guides',
        sidebarPath: './sidebars/guides.ts',
        editUrl: 'https://github.com/reddcoin-project/reddcoin-docs/tree/master/',
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'contribute',
        path: 'docs/contribute',
        routeBasePath: 'contribute',
        sidebarPath: './sidebars/contribute.ts',
        editUrl: 'https://github.com/reddcoin-project/reddcoin-docs/tree/master/',
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'glossary',
        path: 'docs/glossary',
        routeBasePath: 'glossary',
        sidebarPath: './sidebars/glossary.ts',
        editUrl: 'https://github.com/reddcoin-project/reddcoin-docs/tree/master/',
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reddcoinjs-lib',
        path: 'api/reddcoinjs-lib',
        routeBasePath: 'api/reddcoinjs-lib',
        sidebarPath: './sidebars/reddcoinjs-lib.ts',
        // No editUrl — content is regenerated by scripts/sync-reddcoinjs.mjs
        // from the reddcoinjs-lib upstream and would be overwritten on the
        // next sync. Edit the source TSDoc upstream instead.
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Docs',
      logo: {
        alt: 'ReddCoin',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
        href: '/',
      },
      items: [
        {
          type: 'docSidebar',
          docsPluginId: 'protocol',
          sidebarId: 'protocol',
          position: 'left',
          label: 'Protocol',
        },
        {
          type: 'docSidebar',
          docsPluginId: 'guides',
          sidebarId: 'guides',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          docsPluginId: 'contribute',
          sidebarId: 'contribute',
          position: 'left',
          label: 'Contribute',
        },
        {
          type: 'dropdown',
          label: 'API Reference',
          position: 'left',
          items: [
            {label: 'reddcoinjs-lib', to: '/api/reddcoinjs-lib/'},
            {label: 'bitcore (coming soon)', to: '/api'},
          ],
        },
        {
          type: 'docSidebar',
          docsPluginId: 'glossary',
          sidebarId: 'glossary',
          position: 'left',
          label: 'Glossary',
        },
        {
          href: 'https://github.com/reddcoin-project/reddcoin-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Protocol', to: '/protocol'},
            {label: 'Guides', to: '/guides'},
            {label: 'Contribute', to: '/contribute'},
            {label: 'API Reference', to: '/api'},
            {label: 'Glossary', to: '/glossary'},
          ],
        },
        {
          title: 'ReddCoin',
          items: [
            {label: 'reddcoin.com', href: 'https://reddcoin.com'},
            {label: 'Wallet', href: 'https://wallet.reddcoin.com'},
            {label: 'Brand guide', href: 'https://brand.reddcoin.com'},
            {label: 'GitHub', href: 'https://github.com/reddcoin-project'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ReddCoin Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'diff', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
