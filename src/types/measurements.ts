// Measurement fields for the blouse customizer. All values are INCHES
// (standard for Indian tailoring) — label the unit in the UI.
// Field order here is the display order in forms.

export const MEASUREMENT_FIELDS = [
    'bust',
    'waist',
    'shoulderWidth',
    'blouseLength',
    'sleeveLength',
    'armhole',
    'frontNeckDepth',
    'backNeckDepth',
] as const;
export type MeasurementField = (typeof MEASUREMENT_FIELDS)[number];

export type Measurements = Record<MeasurementField, number>;

// Human-readable labels shared by the admin form and the public customizer.
export const MEASUREMENT_LABELS: Record<MeasurementField, string> = {
    bust: 'Bust',
    waist: 'Waist',
    shoulderWidth: 'Shoulder Width',
    blouseLength: 'Blouse Length',
    sleeveLength: 'Sleeve Length',
    armhole: 'Armhole',
    frontNeckDepth: 'Front Neck Depth',
    backNeckDepth: 'Back Neck Depth',
};

// Sane input bounds (inches) for validation and preview clamping.
export const MEASUREMENT_RANGES: Record<MeasurementField, { min: number; max: number }> = {
    bust: { min: 20, max: 60 },
    waist: { min: 18, max: 56 },
    shoulderWidth: { min: 10, max: 22 },
    blouseLength: { min: 10, max: 24 },
    sleeveLength: { min: 0, max: 24 },
    armhole: { min: 10, max: 26 },
    frontNeckDepth: { min: 2, max: 12 },
    backNeckDepth: { min: 2, max: 14 },
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

// Find the bracket matching an age (undefined if none matches).
export function findBracketForAge(
    brackets: MeasurementDefault[],
    age: number
): MeasurementDefault | undefined {
    return brackets.find((b) => age >= b.ageMin && age <= b.ageMax);
}
