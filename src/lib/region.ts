'use client';

import { useEffect, useState } from 'react';
import { REGIONS, Region } from '@/types/commerce';

// Buyer region for Shopify Markets pricing (IN → INR, US → USD). A plain
// cookie, readable by client and server; defaulted once from the browser
// locale, never blocking anything.

const COOKIE = 'hos_region';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function readRegionCookie(): Region | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
    const value = match?.[1];
    return REGIONS.includes(value as Region) ? (value as Region) : null;
}

export function writeRegionCookie(region: Region): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${COOKIE}=${region}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

function guessRegion(): Region {
    if (typeof navigator === 'undefined') return 'IN';
    const languages = navigator.languages ?? [navigator.language];
    return languages.some((l) => /-US$/i.test(l ?? '')) ? 'US' : 'IN';
}

/** Client hook: current region + setter. SSR renders the IN default and
 *  the effect corrects it after mount (prices re-render, nothing blocks). */
export function useRegion(): [Region, (region: Region) => void] {
    const [region, setRegionState] = useState<Region>('IN');
    useEffect(() => {
        const stored = readRegionCookie();
        if (stored) {
            setRegionState(stored);
        } else {
            const guessed = guessRegion();
            writeRegionCookie(guessed);
            setRegionState(guessed);
        }
    }, []);
    const setRegion = (next: Region) => {
        writeRegionCookie(next);
        setRegionState(next);
    };
    return [region, setRegion];
}
