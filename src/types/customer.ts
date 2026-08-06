export const CUSTOMER_SOURCES = ['booking', 'custom-design', 'newsletter'] as const;
export type CustomerSource = (typeof CUSTOMER_SOURCES)[number];

export interface Customer {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    source?: CustomerSource | string | null;
    userId?: string | null;
    marketingOptIn: boolean;
    createdAt?: string;
    updatedAt?: string;
}
