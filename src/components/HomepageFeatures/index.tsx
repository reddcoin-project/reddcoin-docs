import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  to: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Protocol Reference',
    to: '/protocol',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        How the ReddCoin protocol works — blocks, transactions, the P2P
        network, PoSV staking — plus the full JSON-RPC reference and worked
        examples.
      </>
    ),
  },
  {
    title: 'User & Operator Guides',
    to: '/guides',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Hands-on guides for running a full node, setting up a wallet,
        configuring staking, and operating ReddCoin infrastructure.
      </>
    ),
  },
  {
    title: 'Library API Reference',
    to: '/api',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Auto-generated API docs for <code>reddcoinjs-lib</code> and the{' '}
        <code>bitcore-*-redd</code> library family. Built from source, so
        they never drift from the code.
      </>
    ),
  },
];

function Feature({title, to, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">
          <Link to={to}>{title}</Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
