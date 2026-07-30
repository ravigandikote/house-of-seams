// Measurement fields for the blouse customizer. All values are INCHES
// (standard for Indian tailoring) — label the unit in the UI.
// The set and grouping follow the boutique's standard blouse measurement
// guide (23 fields in 5 groups). Field order = display order in forms.

export const MEASUREMENT_FIELDS = [
    // Upper body
    'shoulderWidth',
    'acrossFront',
    'acrossBack',
    'bust',
    'upperBust',
    'underBust',
    'apexToApex',
    'shoulderToApex',
    'shoulderToUnderBust',
    // Neck
    'frontNeckDepth',
    'backNeckDepth',
    'neckWidth',
    // Arm & sleeve
    'armhole',
    'sleeveRound',
    'elbowRound',
    'wristRound',
    'sleeveLength',
    // Lengths
    'blouseLength',
    'frontLength',
    'backLength',
    'sideSeamLength',
    // Waist & hips
    'waist',
    'hip',
] as const;
export type MeasurementField = (typeof MEASUREMENT_FIELDS)[number];

export type Measurements = Record<MeasurementField, number>;

// Human-readable labels shared by the admin form, the public customizer,
// and the measurement guide.
export const MEASUREMENT_LABELS: Record<MeasurementField, string> = {
    shoulderWidth: 'Shoulder Width',
    acrossFront: 'Across Front',
    acrossBack: 'Across Back',
    bust: 'Bust',
    upperBust: 'Upper Bust',
    underBust: 'Under Bust',
    apexToApex: 'Apex to Apex',
    shoulderToApex: 'Shoulder to Apex',
    shoulderToUnderBust: 'Shoulder to Under Bust',
    frontNeckDepth: 'Front Neck Depth',
    backNeckDepth: 'Back Neck Depth',
    neckWidth: 'Neck Width',
    armhole: 'Armhole Round',
    sleeveRound: 'Sleeve Round (Bicep)',
    elbowRound: 'Elbow Round',
    wristRound: 'Wrist Round',
    sleeveLength: 'Sleeve Length',
    blouseLength: 'Blouse Length',
    frontLength: 'Front Length',
    backLength: 'Back Length',
    sideSeamLength: 'Side Seam Length',
    waist: 'Waist',
    hip: 'Hip',
};

// How each measurement is taken — wording from the boutique's guide.
export const MEASUREMENT_DESCRIPTIONS: Record<MeasurementField, string> = {
    shoulderWidth: 'Shoulder tip to shoulder tip',
    acrossFront: 'From armhole edge to armhole edge across the fullest part',
    acrossBack: 'From armhole edge to armhole edge across the back',
    bust: 'Around the fullest part of the bust',
    upperBust: 'Around the body above the bust',
    underBust: 'Around the body just below the bust',
    apexToApex: 'Bust point to bust point',
    shoulderToApex: 'From shoulder tip to bust point',
    shoulderToUnderBust: 'From shoulder tip to the under-bust line',
    frontNeckDepth: 'From shoulder point to the desired front neck depth',
    backNeckDepth: 'From the nape (neck bone) to the desired back neck depth',
    neckWidth: 'Around the base of the neck',
    armhole: 'Around the armhole',
    sleeveRound: 'Around the fullest part of the upper arm',
    elbowRound: 'Around the elbow (for longer sleeves)',
    wristRound: 'Around the wrist (for full sleeves)',
    sleeveLength: 'From the shoulder tip to the desired sleeve end',
    blouseLength: 'From the shoulder (HPS) to the blouse hem',
    frontLength: 'From the shoulder (HPS) to the waist, at the front',
    backLength: 'From the nape to the waist, at the back',
    sideSeamLength: 'From the underarm to the waist',
    waist: 'Around the natural waistline',
    hip: 'Around the fullest part of the hips (optional)',
};

// Display groups, matching the boutique's guide sections.
export interface MeasurementGroup {
    id: string;
    label: string;
    fields: readonly MeasurementField[];
}
export const MEASUREMENT_GROUPS: readonly MeasurementGroup[] = [
    {
        id: 'upper-body',
        label: 'Upper Body',
        fields: ['shoulderWidth', 'acrossFront', 'acrossBack', 'bust', 'upperBust', 'underBust', 'apexToApex', 'shoulderToApex', 'shoulderToUnderBust'],
    },
    { id: 'neck', label: 'Neck', fields: ['frontNeckDepth', 'backNeckDepth', 'neckWidth'] },
    {
        id: 'arm-sleeve',
        label: 'Arm & Sleeve',
        fields: ['armhole', 'sleeveRound', 'elbowRound', 'wristRound', 'sleeveLength'],
    },
    { id: 'lengths', label: 'Lengths', fields: ['blouseLength', 'frontLength', 'backLength', 'sideSeamLength'] },
    { id: 'waist-hips', label: 'Waist & Hips', fields: ['waist', 'hip'] },
];

// Sane input bounds (inches) for validation and preview clamping.
export const MEASUREMENT_RANGES: Record<MeasurementField, { min: number; max: number }> = {
    shoulderWidth: { min: 10, max: 22 },
    acrossFront: { min: 10, max: 20 },
    acrossBack: { min: 10, max: 20 },
    bust: { min: 20, max: 60 },
    upperBust: { min: 20, max: 58 },
    underBust: { min: 18, max: 54 },
    apexToApex: { min: 5, max: 14 },
    shoulderToApex: { min: 7, max: 16 },
    shoulderToUnderBust: { min: 10, max: 20 },
    frontNeckDepth: { min: 2, max: 12 },
    backNeckDepth: { min: 2, max: 14 },
    neckWidth: { min: 10, max: 20 },
    armhole: { min: 10, max: 26 },
    sleeveRound: { min: 7, max: 22 },
    elbowRound: { min: 6, max: 18 },
    wristRound: { min: 4, max: 12 },
    sleeveLength: { min: 0, max: 24 },
    blouseLength: { min: 10, max: 24 },
    frontLength: { min: 10, max: 22 },
    backLength: { min: 10, max: 22 },
    sideSeamLength: { min: 4, max: 14 },
    waist: { min: 18, max: 56 },
    hip: { min: 24, max: 62 },
};

// A complete, typical set of values (the 18–25 bracket) used as the
// safety-net default wherever a full Measurements object is needed:
// design-card previews, the dev harness, and pre-fill fallback when a
// bracket is missing a newly added field.
export const TYPICAL_MEASUREMENTS: Measurements = {
    shoulderWidth: 14,
    acrossFront: 13,
    acrossBack: 13.5,
    bust: 34,
    upperBust: 33,
    underBust: 29,
    apexToApex: 7,
    shoulderToApex: 9.5,
    shoulderToUnderBust: 15,
    frontNeckDepth: 6.5,
    backNeckDepth: 7,
    neckWidth: 14,
    armhole: 15.5,
    sleeveRound: 11,
    elbowRound: 9.5,
    wristRound: 6.5,
    sleeveLength: 6,
    blouseLength: 14,
    frontLength: 14.5,
    backLength: 15,
    sideSeamLength: 8,
    waist: 28,
    hip: 36,
};

// One age bracket of admin-editable default measurements (rough
// pre-fill starting points only — the customer edits everything).
export interface MeasurementDefault extends Measurements {
    id: string;
    label: string;
    ageMin: number;
    ageMax: number;
    createdAt?: string;
    updatedAt?: string;
}

// ------------------------------------------------------------------
// Category-generic spec (see src/types/measurementSpec.ts), derived from
// the constants above so there is exactly one source of truth. The
// slider editor and future category-generic UI consume this; the
// existing named exports above remain unchanged for current consumers.
// ------------------------------------------------------------------
import { CategoryMeasurementSpec } from './measurementSpec';

function groupOf(field: MeasurementField): string {
    return MEASUREMENT_GROUPS.find((g) => g.fields.includes(field))?.id ?? 'other';
}

export const BLOUSE_MEASUREMENT_SPEC: CategoryMeasurementSpec = {
    category: 'blouse',
    groups: MEASUREMENT_GROUPS.map((g, i) => ({ key: g.id, label: g.label, order: i })),
    fields: MEASUREMENT_FIELDS.map((f) => ({
        key: f,
        label: MEASUREMENT_LABELS[f],
        description: MEASUREMENT_DESCRIPTIONS[f],
        unit: 'in' as const,
        min: MEASUREMENT_RANGES[f].min,
        max: MEASUREMENT_RANGES[f].max,
        step: 0.25,
        defaultValue: TYPICAL_MEASUREMENTS[f],
        group: groupOf(f),
        optional: f === 'hip',
    })),
    typicalDefaults: TYPICAL_MEASUREMENTS,
};

// Find the bracket matching an age (undefined if none matches).
export function findBracketForAge(
    brackets: MeasurementDefault[],
    age: number
): MeasurementDefault | undefined {
    return brackets.find((b) => age >= b.ageMin && age <= b.ageMax);
}

// A bracket's value for a field, falling back to the typical value when
// the bracket predates a newly added measurement column.
export function bracketValue(bracket: MeasurementDefault, field: MeasurementField): number {
    const value = bracket[field];
    return typeof value === 'number' && Number.isFinite(value) ? value : TYPICAL_MEASUREMENTS[field];
}
