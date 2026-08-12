import { categoryById } from '@/types/customizerCategories';
import {
    PATTERN_CATEGORIES,
    PATTERN_DIFFICULTIES,
    PatternProfile,
} from '@/types/pattern';

// Server-side validation for admin pattern-profile writes. Preview style
// values validate against the renderer's category enums where the
// manifest knows them, so a typo can't produce a broken sketch.

const HANDLE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RENDERERS = ['blouse', 'lehenga', 'kurti', 'bottoms'] as const;

export function validatePatternProfile(body: Partial<PatternProfile>): string | null {
    if (!body.shopifyHandle?.trim() || !HANDLE_RE.test(body.shopifyHandle.trim())) {
        return 'shopifyHandle must be kebab-case (e.g. princess-cut-blouse-pattern)';
    }
    if (!body.title?.trim()) return 'Title is required';
    if (!body.category || !PATTERN_CATEGORIES.includes(body.category)) {
        return `category must be one of: ${PATTERN_CATEGORIES.join(', ')}`;
    }
    if (!body.patternType?.trim()) return 'patternType is required';
    if (!body.difficulty || !PATTERN_DIFFICULTIES.includes(body.difficulty)) {
        return `difficulty must be one of: ${PATTERN_DIFFICULTIES.join(', ')}`;
    }
    if (!body.sizeRange?.trim()) return 'sizeRange is required';
    if (
        !body.formats ||
        typeof body.formats.a4 !== 'boolean' ||
        typeof body.formats.a0 !== 'boolean' ||
        typeof body.formats.projector !== 'boolean'
    ) {
        return 'formats must set a4/a0/projector booleans';
    }
    if (body.whatsIncluded !== undefined && !Array.isArray(body.whatsIncluded)) {
        return 'whatsIncluded must be a list';
    }
    if (body.relatedDesignSlugs !== undefined && !Array.isArray(body.relatedDesignSlugs)) {
        return 'relatedDesignSlugs must be a list';
    }

    const preview = body.previewConfig;
    if (!preview || typeof preview !== 'object') return 'previewConfig is required';
    if (!RENDERERS.includes(preview.renderer as (typeof RENDERERS)[number])) {
        return `previewConfig.renderer must be one of: ${RENDERERS.join(', ')}`;
    }
    if (typeof preview.style !== 'object' || preview.style === null) {
        return 'previewConfig.style must be an object';
    }
    // Where the manifest knows the renderer's enums, enforce them.
    const manifest = categoryById(preview.renderer);
    if (manifest?.styleEnums) {
        for (const [key, allowed] of Object.entries(manifest.styleEnums)) {
            const value = preview.style[key];
            if (typeof value !== 'string' || !allowed.includes(value)) {
                return `previewConfig.style.${key} must be one of: ${allowed.join(', ')}`;
            }
        }
    }
    return null;
}
