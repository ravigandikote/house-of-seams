// Lehenga measurement field-set (v1 — pending the boutique's official
// measurement guide; expect labels/ranges/fields here to change when it
// arrives, with no UI changes needed). All tape values in INCHES.

import { CategoryMeasurementSpec, MeasurementFieldSpec, StyleAttributes } from './measurementSpec';

const mermaidOnly = (attrs: StyleAttributes) => attrs.silhouette === 'mermaid';

const FIELDS: readonly MeasurementFieldSpec[] = [
    // Skirt fit
    {
        key: 'waistRound', label: 'Waist Round', group: 'skirt-fit',
        description: 'Around the natural waist, where the lehenga will sit',
        unit: 'in', min: 22, max: 48, step: 0.25, defaultValue: 30,
    },
    {
        key: 'lowerWaistRound', label: 'Lower Waist Round', group: 'skirt-fit',
        description: 'Around the body an inch or two below the waist, if worn lower (optional)',
        unit: 'in', min: 24, max: 50, step: 0.25, defaultValue: 32, optional: true,
    },
    {
        key: 'hipRound', label: 'Hip Round', group: 'skirt-fit',
        description: 'Around the fullest part of the hips',
        unit: 'in', min: 28, max: 54, step: 0.25, defaultValue: 38,
    },
    {
        key: 'waistToHipDepth', label: 'Waist to Hip Depth', group: 'skirt-fit',
        description: 'From the waistline straight down to the fullest hip line',
        unit: 'in', min: 6, max: 12, step: 0.25, defaultValue: 8,
    },
    // Lengths
    {
        key: 'lehengaLength', label: 'Lehenga Length', group: 'lengths',
        description: 'From the waist to the desired hem, usually just above the floor',
        unit: 'in', min: 34, max: 48, step: 0.25, defaultValue: 42,
    },
    {
        key: 'waistToKneeLength', label: 'Waist to Knee', group: 'lengths',
        description: 'From the waist to the knee — sets where a mermaid flare begins',
        unit: 'in', min: 18, max: 28, step: 0.25, defaultValue: 23, visibleWhen: mermaidOnly,
    },
    // Silhouette rounds (fitted shapes only)
    {
        key: 'thighRound', label: 'Thigh Round', group: 'silhouette-rounds',
        description: 'Around the fullest part of the thigh — for fitted silhouettes',
        unit: 'in', min: 16, max: 32, step: 0.25, defaultValue: 22, visibleWhen: mermaidOnly,
    },
    {
        key: 'kneeRound', label: 'Knee Round', group: 'silhouette-rounds',
        description: 'Around the knee — the narrowest point of a mermaid cut',
        unit: 'in', min: 12, max: 22, step: 0.25, defaultValue: 15, visibleWhen: mermaidOnly,
    },
    // Flare & construction
    {
        key: 'flareGhera', label: 'Flare (Ghera)', group: 'flare-construction',
        description: 'Total circumference of the hem — more ghera, more twirl',
        unit: 'in', min: 60, max: 240, step: 2, defaultValue: 120,
    },
    {
        key: 'kaliCount', label: 'Kali (Panel) Count', group: 'flare-construction',
        description: 'Number of fabric panels stitched into the skirt',
        unit: 'level', min: 4, max: 24, step: 1, defaultValue: 8, integer: true,
    },
    {
        key: 'waistbandWidth', label: 'Waistband Width', group: 'flare-construction',
        description: 'Height of the waistband at the top of the skirt',
        unit: 'in', min: 1, max: 3, step: 0.25, defaultValue: 1.5,
    },
    {
        key: 'canCanVolume', label: 'Can-Can Volume', group: 'flare-construction',
        description: 'Underskirt fullness, 0 (none) to 3 (maximum bridal volume)',
        unit: 'level', min: 0, max: 3, step: 1, defaultValue: 1, integer: true,
    },
];

export const LEHENGA_MEASUREMENT_SPEC: CategoryMeasurementSpec = {
    category: 'lehenga',
    groups: [
        { key: 'skirt-fit', label: 'Skirt Fit', order: 0 },
        { key: 'lengths', label: 'Lengths', order: 1 },
        { key: 'silhouette-rounds', label: 'Silhouette Rounds', order: 2 },
        { key: 'flare-construction', label: 'Flare & Construction', order: 3 },
    ],
    fields: FIELDS,
    typicalDefaults: Object.fromEntries(FIELDS.map((f) => [f.key, f.defaultValue])),
};
