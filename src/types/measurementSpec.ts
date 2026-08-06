// Category-generic measurement specification. Each garment category
// (blouse, lehenga, and future shirts/trousers) exports one
// CategoryMeasurementSpec; the slider editor, previews, and future
// guide/admin pages are driven entirely by these specs, so adding a
// category means adding config files — not touching the UI.

// Style attributes of the selected design (e.g. { silhouette: 'mermaid' }),
// used by fields that only apply to certain styles.
export type StyleAttributes = Record<string, string>;

export interface MeasurementFieldSpec {
    key: string;
    label: string;
    /** How the measurement is taken — shown as the info tooltip. */
    description: string;
    /** 'in' for tape measurements; 'level' for unitless scales (e.g. can-can volume). */
    unit: 'in' | 'level';
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    /** key of a MeasurementGroupDef */
    group: string;
    /** Whole numbers only (e.g. kali/panel count). */
    integer?: boolean;
    /** Informational — the boutique treats it as nice-to-have. */
    optional?: boolean;
    /** Hide the field unless the selected design's style attributes match. */
    visibleWhen?: (styleAttrs: StyleAttributes) => boolean;
    /**
     * Per-style range/default override (e.g. a flared kurti raises the hem
     * minimum; a palazzo widens the bottom opening). Return only what
     * changes — applied via effectiveField() so sliders, previews, and
     * server validation all see the same numbers.
     */
    rangeWhen?: (styleAttrs: StyleAttributes) => Partial<Pick<MeasurementFieldSpec, 'min' | 'max' | 'defaultValue'>>;
}

export interface MeasurementGroupDef {
    key: string;
    label: string;
    order: number;
}

export interface CategoryMeasurementSpec {
    category: string;
    groups: readonly MeasurementGroupDef[];
    fields: readonly MeasurementFieldSpec[];
    typicalDefaults: Record<string, number>;
}

// ------------------------------------------------------------------
// Spec composition — categories COMPOSE field groups from other specs
// instead of copy-pasting them. A kurti imports the blouse's upper-body
// groups; a child's pavadai imports the lehenga skirt with tightened
// ranges. Helpers return plain data (functions only in visibleWhen), so
// composed specs stay serialisable-friendly and each category file
// remains the single place its journey is defined.
// ------------------------------------------------------------------

/** A partial spec: some groups plus their fields, ready to compose. */
export interface SpecFragment {
    groups: MeasurementGroupDef[];
    fields: MeasurementFieldSpec[];
}

/** Everything overridable when importing a field (key/group stay put). */
export type FieldOverride = Partial<Omit<MeasurementFieldSpec, 'key' | 'group'>>;

export interface ImportGroupsOptions {
    /** Per-field overrides by field key (e.g. tighten a child's ranges). */
    overrides?: Record<string, FieldOverride>;
    /** Relabel imported groups (e.g. "Upper Body" → "Choli Fit"). */
    groupOverrides?: Record<string, Partial<Omit<MeasurementGroupDef, 'key'>>>;
}

/**
 * Import whole groups (and their fields) from another category's spec,
 * optionally overriding field ranges/labels. Everything is copied — the
 * source spec is never mutated.
 */
export function importGroups(
    source: CategoryMeasurementSpec,
    groupKeys: readonly string[],
    options: ImportGroupsOptions = {}
): SpecFragment {
    const missing = groupKeys.filter((k) => !source.groups.some((g) => g.key === k));
    if (missing.length > 0) {
        throw new Error(`importGroups: ${source.category} has no group(s): ${missing.join(', ')}`);
    }
    return {
        groups: source.groups
            .filter((g) => groupKeys.includes(g.key))
            .map((g) => ({ ...g, ...options.groupOverrides?.[g.key] })),
        fields: source.fields
            .filter((f) => groupKeys.includes(f.group))
            .map((f) => (options.overrides?.[f.key] ? { ...f, ...options.overrides[f.key] } : { ...f })),
    };
}

/** A category's own (non-imported) group with its fields. */
export function ownGroup(
    group: Omit<MeasurementGroupDef, 'order'> & { order?: number },
    fields: MeasurementFieldSpec[]
): SpecFragment {
    return { groups: [{ ...group, order: group.order ?? 0 }], fields };
}

export interface ComposeSpecOptions {
    /** Explicit typical values; defaults to each field's defaultValue. */
    typicalDefaults?: Record<string, number>;
}

/**
 * Assemble a category spec from fragments. Group order follows fragment
 * position; duplicate field or group keys fail fast at module init.
 */
export function composeSpec(
    category: string,
    fragments: readonly SpecFragment[],
    options: ComposeSpecOptions = {}
): CategoryMeasurementSpec {
    const groups = fragments.flatMap((f) => f.groups).map((g, i) => ({ ...g, order: i }));
    const fields = fragments.flatMap((f) => f.fields);
    const seenGroups = new Set<string>();
    for (const g of groups) {
        if (seenGroups.has(g.key)) throw new Error(`composeSpec(${category}): duplicate group "${g.key}"`);
        seenGroups.add(g.key);
    }
    const seenFields = new Set<string>();
    for (const f of fields) {
        if (seenFields.has(f.key)) throw new Error(`composeSpec(${category}): duplicate field "${f.key}"`);
        seenFields.add(f.key);
        if (!seenGroups.has(f.group)) throw new Error(`composeSpec(${category}): field "${f.key}" references missing group "${f.group}"`);
    }
    return {
        category,
        groups,
        fields,
        typicalDefaults:
            options.typicalDefaults ??
            Object.fromEntries(fields.map((f) => [f.key, f.defaultValue])),
    };
}

/** A field with any per-style range override applied. */
export function effectiveField(
    field: MeasurementFieldSpec,
    styleAttrs: StyleAttributes
): MeasurementFieldSpec {
    if (!field.rangeWhen) return field;
    const override = field.rangeWhen(styleAttrs);
    return Object.keys(override).length > 0 ? { ...field, ...override } : field;
}

/** Fields of a group, honoring visibleWhen against the given style
 *  attributes, with per-style range overrides applied. */
export function visibleFieldsForGroup(
    spec: CategoryMeasurementSpec,
    groupKey: string,
    styleAttrs: StyleAttributes
): MeasurementFieldSpec[] {
    return spec.fields
        .filter((f) => f.group === groupKey && (!f.visibleWhen || f.visibleWhen(styleAttrs)))
        .map((f) => effectiveField(f, styleAttrs));
}

/** Clamp a value into a field's range, respecting step/integer. */
export function clampToSpec(field: MeasurementFieldSpec, value: number): number {
    if (!Number.isFinite(value)) return field.defaultValue;
    let v = Math.min(field.max, Math.max(field.min, value));
    if (field.integer) v = Math.round(v);
    return v;
}
