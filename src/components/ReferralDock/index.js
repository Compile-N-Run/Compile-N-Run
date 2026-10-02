import React, {useCallback, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import offers from './offers';
import styles from './styles.module.css';

const STORAGE_KEY = 'cnr_referral_dock';
const SNOOZE_MS = 24 * 60 * 60 * 1000; // dismissed bar stays collapsed for 1 day
const SHOW_DELAY_MS = 2500; // let the reader settle in before the dock slides up
const ROTATE_MS = 9000;

function readState() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeState(state) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* storage unavailable: ignore */
    }
}

export default function ReferralDock() {
    const [mode, setMode] = useState('hidden'); // hidden | open | collapsed
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [fading, setFading] = useState(false);
    const timerRef = useRef(null);

    // Initial mount: decide whether to open or stay collapsed, then delay the slide-in.
    useEffect(() => {
        const saved = readState();
        const snoozed = saved && saved.until && saved.until > Date.now();
        // Rotate the starting offer per page view so each one gets exposure.
        setIndex(Math.floor(Math.random() * offers.length));
        const t = window.setTimeout(() => setMode(snoozed ? 'collapsed' : 'open'), SHOW_DELAY_MS);
        return () => window.clearTimeout(t);
    }, []);

    // Reserve space so the dock never covers the page footer / last lines of text.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('referral-dock-open', mode === 'open');
        return () => root.classList.remove('referral-dock-open');
    }, [mode]);

    const goTo = useCallback((next) => {
        setFading(true);
        window.setTimeout(() => {
            setIndex(((next % offers.length) + offers.length) % offers.length);
            setFading(false);
        }, 180);
    }, []);

    // Auto-rotate while open, unless hovered/focused or tab hidden.
    useEffect(() => {
        if (mode !== 'open' || paused) return undefined;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return undefined;
        timerRef.current = window.setInterval(() => {
            if (document.visibilityState === 'visible') goTo(index + 1);
        }, ROTATE_MS);
        return () => window.clearInterval(timerRef.current);
    }, [mode, paused, index, goTo]);

    const dismiss = () => {
        writeState({until: Date.now() + SNOOZE_MS});
        setMode('collapsed');
    };

    const reopen = () => {
        writeState({until: 0});
        setMode('open');
    };

    if (mode === 'hidden') return null;

    if (mode === 'collapsed') {
        return (
            <button
                type="button"
                className={styles.pill}
                onClick={reopen}
                aria-label="Show referral offers"
                title="Referral offers">
                <span aria-hidden="true">🎁</span>
                <span className={styles.pillText}>Offers</span>
            </button>
        );
    }

    const offer = offers[index];

    return (
        <aside
            className={styles.dock}
            role="complementary"
            aria-label="Referral offers"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}>
            <div className={styles.inner}>
                <span className={styles.tag}>Referral</span>

                <button
                    type="button"
                    className={clsx(styles.nav, styles.navPrev)}
                    onClick={() => goTo(index - 1)}
                    aria-label="Previous offer">
                    ‹
                </button>

                <a
                    key={offer.id}
                    className={clsx(styles.offer, fading && styles.offerFading)}
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    style={{'--offer-accent': offer.accent}}>
                    <span className={styles.emoji} aria-hidden="true">{offer.emoji}</span>
                    <span className={styles.text}>
                        <span className={styles.headline}>
                            <span className={styles.brand}>{offer.brand}</span>
                            {offer.headline}
                        </span>
                        <span className={styles.body}>{offer.body}</span>
                    </span>
                    <span className={styles.cta}>
                        {offer.cta}
                        <span aria-hidden="true"> →</span>
                    </span>
                </a>

                <button
                    type="button"
                    className={clsx(styles.nav, styles.navNext)}
                    onClick={() => goTo(index + 1)}
                    aria-label="Next offer">
                    ›
                </button>

                <div className={styles.dots} aria-hidden="true">
                    {offers.map((o, i) => (
                        <button
                            key={o.id}
                            type="button"
                            tabIndex={-1}
                            className={clsx(styles.dot, i === index && styles.dotActive)}
                            onClick={() => goTo(i)}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    className={styles.close}
                    onClick={dismiss}
                    aria-label="Hide referral offers for today"
                    title="Hide for today">
                    ×
                </button>
            </div>
        </aside>
    );
}
