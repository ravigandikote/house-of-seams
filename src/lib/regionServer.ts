import { cookies } from 'next/headers';
import { REGIONS, Region } from '@/types/commerce';

// Server-side read of the buyer-region cookie (set client-side in
// lib/region.ts). Using cookies() opts the page into dynamic rendering —
// exactly right for pages that show live regional prices.

export function serverRegion(): Region {
    const value = cookies().get('hos_region')?.value;
    return REGIONS.includes(value as Region) ? (value as Region) : 'IN';
}
