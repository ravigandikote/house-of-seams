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

/** Fields of a group, honoring visibleWhen against the given style attributes. */
export function visibleFieldsForGroup(
    spec: CategoryMeasurementSpec,
    groupKey: string,
    styleAttrs: StyleAttributes
): MeasurementFieldSpec[] {
    return spec.fields.filter(
        (f) => f.group === groupKey && (!f.visibleWhen || f.visibleWhen(styleAttrs))
    );
}

/** Clamp a value into a field's range, respecting step/integer. */
export function clampToSpec(field: MeasurementFieldSpec, value: number): number {
    if (!Number.isFinite(value)) return field.defaultValue;
    let v = Math.min(field.max, Math.max(field.min, value));
    if (field.integer) v = Math.round(v);
    return v;
}
