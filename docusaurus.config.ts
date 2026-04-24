import {themes as prismThemes} from 'prism-react-renderer';
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

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

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
        editUrl: 'https://github.com/reddcoin-project/reddcoin-docs/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'guides',
        path: 'docs/guides',
        routeBasePath: 'guides',
        sidebarPath: './sidebars/guides.ts',
        editUrl: 'https://github.com/reddcoin-project/reddcoin-docs/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'contribute',
        path: 'docs/contribute',
        routeBasePath: 'contribute',
        sidebarPath: './sidebars/contribute.ts',
        editUrl: 'https://github.com/reddcoin-project/reddcoin-docs/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'glossary',
        path: 'docs/glossary',
        routeBasePath: 'glossary',
        sidebarPath: './sidebars/glossary.ts',
        editUrl: 'https://github.com/reddcoin-project/reddcoin-docs/tree/main/',
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
            {label: 'reddcoinjs-lib (coming soon)', to: '/api'},
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
