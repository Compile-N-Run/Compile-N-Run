import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import Head from '@docusaurus/Head';

function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className={clsx('container', styles.index_page_heading)}>
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/language/python">
                        Let's get started with Python!
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            description="The best website to learn any programming language for free!">
            <HomepageHeader/>
            <main className="homepage_content">
                <section className="container" style={{maxWidth: '860px', margin: '2.5rem auto 0', padding: '0 1rem'}}>
                    <h2>Learn Programming and Computer Science — for Free</h2>
                    <p>
                        <strong>Compile N Run</strong> is a free, open learning platform for developers, computer
                        science students, and self-taught programmers. We publish structured, hands-on tutorials that
                        take you from the fundamentals to production-grade skills — no sign-up, no paywall.
                    </p>
                    <p>
                        Our library spans more than a dozen programming languages, popular web frameworks, databases,
                        DevOps and observability tools, operating systems, and core CS topics such as data structures,
                        algorithms, computer networks, and interview preparation. Every guide is organized as a
                        progressive learning path with clear explanations, runnable code examples, and diagrams so you
                        can learn by doing.
                    </p>
                    <p>
                        New here? Pick a topic below to get started, or read more about{' '}
                        <Link to="/about">our mission and approach</Link>. Have feedback or found an error?{' '}
                        <Link to="/contact">Get in touch</Link> — we read every message.
                    </p>
                </section>
                <HomepageFeatures/>
            </main>
        </Layout>
    );
}
