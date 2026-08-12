import {
    BlouseAllowedVariations,
    VARIATION_KEYS,
    VARIATION_OPTIONS,
    withVariation,
} from '../types/blouseDesign';

// Server-side validation for blouse_designs.allowed_variations.
//
// The DB CHECK constraint guards only the shape (object, known keys,
// array values). The allowed *values* are checked here against the
// `as const` style enums, which stay the single source of truth — adding
// a new sleeve style needs no migration.

export type VariationValidation =
    | { ok: true; value: BlouseAllowedVariations | null }
    | { ok: false; error: string };

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((entry) => typeof entry === 'string');

/**
 * Normalises an incoming allowed_variations payload.
 *
 * Accepts null/undefined (= all options allowed) and an object with any
 * subset of the three keys. Empty lists and lists naming every option
 * are dropped, so "no constraint" is always stored as a missing key
 * rather than as noise; a payload that ends up empty becomes null.
 */
export function validateAllowedVariations(input: unknown): VariationValidation {
    if (input === null || input === undefined) return { ok: true, value: null };

    if (typeof input !== 'object' || Array.isArray(input)) {
        return { ok: false, error: 'allowedVariations must be an object or null' };
    }

    const source = input as Record<string, unknown>;
    const unknownKeys = Object.keys(source).filter(
        (key) => !(VARIATION_KEYS as readonly string[]).includes(key),
    );
    if (unknownKeys.length > 0) {
        return {
            ok: false,
            error: `allowedVariations has unknown key(s): ${unknownKeys.join(', ')}. Expected ${VARIATION_KEYS.join(', ')}.`,
        };
    }

    let result: BlouseAllowedVariations = {};
    for (const key of VARIATION_KEYS) {
        const raw = source[key];
        if (raw === undefined || raw === null) continue;
        if (!isStringArray(raw)) {
            return { ok: false, error: `allowedVariations.${key} must be an array of strings` };
        }

        const options = VARIATION_OPTIONS[key];
        const invalid = raw.filter((entry) => !options.includes(entry));
        if (invalid.length > 0) {
            return {
                ok: false,
                error: `allowedVariations.${key} has invalid value(s): ${invalid.join(', ')}. Allowed: ${options.join(', ')}.`,
            };
        }

        // De-duplicate and keep enum order so stored lists are canonical.
        const canonical = options.filter((option) => raw.includes(option));
        // An empty list and a complete list both mean "no constraint".
        if (canonical.length === 0 || canonical.length === options.length) continue;
        result = withVariation(result, key, canonical);
    }

    return { ok: true, value: Object.keys(result).length > 0 ? result : null };
}
