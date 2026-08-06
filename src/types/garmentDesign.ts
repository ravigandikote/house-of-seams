// Rows of the generic garment_designs table (all categories added by the
// expansion plan; blouse keeps its dedicated blouse_designs table).
// styleAttributes keys/values are validated against the owning category's
// manifest styleEnums (src/lib/garmentStyles.ts).

export interface GarmentDesign {
    id: string;
    category: string;
    name: string;
    slug: string;
    description?: string | null;
    styleAttributes: Record<string, string>;
    isSignature: boolean;
    designerNote?: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}
