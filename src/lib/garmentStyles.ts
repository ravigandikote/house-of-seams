import { categoryById } from '@/types/customizerCategories';

// Server-side validation of garment_designs.style_attributes against the
// owning category's `as const` enums, driven entirely by the manifest —
// a new category needs no changes here.

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export interface ValidatedStyleAttributes {
    attributes: Record<string, string>;
    error?: never;
}
export interface StyleValidationError {
    attributes?: never;
    error: string;
}

export function validateStyleAttributes(
    category: string,
    raw: unknown
): ValidatedStyleAttributes | StyleValidationError {
    const manifest = categoryById(category);
    if (!manifest || manifest.designSource !== 'garment_designs' || !manifest.styleEnums) {
        return { error: `Unknown or unsupported design category: ${category}` };
    }
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return { error: 'styleAttributes must be an object' };
    }
    const input = raw as Record<string, unknown>;
    const attributes: Record<string, string> = {};

    for (const [key, allowed] of Object.entries(manifest.styleEnums)) {
        const value = input[key];
        if (typeof value !== 'string' || !allowed.includes(value)) {
            return { error: `${key} must be one of: ${allowed.join(', ')}` };
        }
        attributes[key] = value;
    }

    const baseColor = input.baseColor;
    if (typeof baseColor !== 'string' || !HEX_COLOR.test(baseColor)) {
        return { error: 'baseColor must be a hex colour like #A4586A' };
    }
    attributes.baseColor = baseColor;

    // Reject anything beyond the category's enums + baseColor — nothing
    // unvalidated may reach the JSONB.
    const extras = Object.keys(input).filter((k) => k !== 'baseColor' && !(k in manifest.styleEnums!));
    if (extras.length > 0) {
        return { error: `Unknown style attribute(s): ${extras.join(', ')}` };
    }
    return { attributes };
}
