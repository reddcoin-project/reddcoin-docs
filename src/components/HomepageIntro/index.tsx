import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function HomepageIntro(): ReactNode {
  return (
    <section className={styles.intro}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--8 col--offset-2')}>
            <Heading as="h2" className={styles.title}>
              What is ReddCoin?
            </Heading>
            <p>
              ReddCoin is a Bitcoin-family cryptocurrency designed for tipping,
              social payments, and everyday transactions. It uses{' '}
              <strong>Proof-of-Stake Velocity (PoSV)</strong> — a consensus
              mechanism that rewards both the amount you hold and how actively
              you move it. The longer coins sit unused, the less they earn;
              this favours circulation over hoarding. The chain has been
              running since 2014, with the Proof-of-Work era ending at block
              260,800.
            </p>
            <p>
              The codebase descends from Bitcoin Core, so most of what you
              know about Bitcoin carries over — addresses, transactions,
              scripts, the P2P network, the JSON-RPC interface. The
              differences are called out where they matter: PoSV consensus,
              network parameters, address versions, and the
              ReddCoin-specific RPC calls. If a term in these docs isn't
              familiar, the <Link to="/glossary">Glossary</Link>{' '}
              cross-references every one.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
