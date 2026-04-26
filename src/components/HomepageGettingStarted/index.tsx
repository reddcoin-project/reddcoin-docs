import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type Path = {
  title: string;
  body: ReactNode;
};

const paths: Path[] = [
  {
    title: 'Running a ReddCoin node, setting up a wallet, configuring staking.',
    body: (
      <>
        Start with the <Link to="/guides">Operator Guides</Link> and the{' '}
        <Link to="/protocol/devguide/staking">staking page</Link>. The
        guides cover system requirements, installation, initial block
        download, and PoSV configuration; the protocol page explains the
        consensus mechanism behind it.
      </>
    ),
  },
  {
    title: 'Writing code that talks to ReddCoin.',
    body: (
      <>
        <Link to="/api/reddcoinjs-lib">
          <code>reddcoinjs-lib</code>
        </Link>{' '}
        covers JavaScript and TypeScript. The{' '}
        <Link to="/protocol/reference/rpc">JSON-RPC reference</Link> lists
        every call exposed by <code>reddcoind</code>, with parameters,
        return shapes, and curl examples. The{' '}
        <Link to="/protocol/examples">Examples</Link> section ties calls
        together with end-to-end walkthroughs (raw transactions, payment
        processing, P2P messages). Bitcore-family libraries arrive in a
        later phase.
      </>
    ),
  },
  {
    title: 'Understanding how the chain works under the hood.',
    body: (
      <>
        The{' '}
        <Link to="/protocol/devguide">Protocol Developer Guide</Link>{' '}
        walks through blocks, transactions, the P2P network, mining
        (historical), wallets, and PoSV. The{' '}
        <Link to="/protocol/reference">Reference</Link> section gives the
        on-the-wire formats.{' '}
        <Link to="/protocol/devguide/kimoto_gravity_well">
          Kimoto Gravity Well
        </Link>{' '}
        is worth a separate look if you're curious about difficulty
        retargeting.
      </>
    ),
  },
  {
    title: 'Helping shape the project.',
    body: (
      <>
        <Link to="/contribute">How to contribute</Link> covers running
        staking nodes, working on Core or the libraries, improving these
        docs, translating, testing release candidates, reporting bugs, and
        joining the community on Discord, Telegram, and X.
      </>
    ),
  },
];

export default function HomepageGettingStarted(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--8 col--offset-2')}>
            <Heading as="h2" className={styles.title}>
              Choose your path
            </Heading>
            <p className={styles.lede}>
              Pick the entry point that matches what you're trying to do:
            </p>
            <ul className={styles.paths}>
              {paths.map((p, i) => (
                <li key={i}>
                  <strong>{p.title}</strong> {p.body}
                </li>
              ))}
            </ul>
            <p className={styles.utility}>
              <strong>Looking up a specific term or symbol?</strong>{' '}
              The <Link to="/glossary">Glossary</Link> defines every concept
              used in the protocol docs; the{' '}
              <Link to="/glossary/terms">Terms</Link> page registers every{' '}
              <code>term-*</code> cross-reference target. Both pages are
              designed to be linked into directly — the per-term anchors are
              stable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
