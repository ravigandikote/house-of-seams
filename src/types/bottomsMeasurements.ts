// Bottoms measurement field-set (salwar / churidar / palazzo / straight
// pants). All tape values in INCHES. The bottom opening's sensible range
// depends on the style — implemented as ONE field with a per-style
// rangeWhen override, not four separate fields.

import {
    CategoryMeasurementSpec,
    MeasurementFieldSpec,
    StyleAttributes,
    composeSpec,
    ownGroup,
} from './measurementSpec';

const fitted = (attrs: StyleAttributes) =>
    attrs.bottomStyle === 'churidar' || attrs.bottomStyle === 'straight_pant';
const churidarOnly = (attrs: StyleAttributes) => attrs.bottomStyle === 'churidar';

// Per-style bottom-opening ranges (churidar hugs, palazzo flows).
const OPENING_RANGES: Record<string, { min: number; max: number; defaultValue: number }> = {
    churidar: { min: 8, max: 14, defaultValue: 10 },
    straight_pant: { min: 12, max: 20, defaultValue: 16 },
    salwar: { min: 14, max: 24, defaultValue: 18 },
    palazzo: { min: 20, max: 40, defaultValue: 28 },
};

const FIT_FIELDS: readonly MeasurementFieldSpec[] = [
    {
        key: 'waistRound', label: 'Waist Round', group: 'bottoms-fit',
        description: 'Around the natural waist, where the bottoms will sit',
        unit: 'in', min: 24, max: 50, step: 0.25, defaultValue: 32,
    },
    {
        key: 'hipRound', label: 'Hip Round', group: 'bottoms-fit',
        description: 'Around the fullest part of the hips',
        unit: 'in', min: 28, max: 54, step: 0.25, defaultValue: 38,
    },
    {
        key: 'bodyRise', label: 'Body Rise', group: 'bottoms-fit',
        description: 'Seated: from the waist down to the chair — sets the crotch depth',
        unit: 'in', min: 9, max: 15, step: 0.25, defaultValue: 11,
    },
];

const LEG_FIELDS: readonly MeasurementFieldSpec[] = [
    {
        key: 'thighRound', label: 'Thigh Round', group: 'bottoms-legs',
        description: 'Around the fullest part of the thigh',
        unit: 'in', min: 16, max: 34, step: 0.25, defaultValue: 22,
    },
    {
        key: 'kneeRound', label: 'Knee Round', group: 'bottoms-legs',
        description: 'Around the knee, over the kneecap',
        unit: 'in', min: 12, max: 22, step: 0.25, defaultValue: 15,
    },
    {
        key: 'calfRound', label: 'Calf Round', group: 'bottoms-legs',
        description: 'Around the fullest part of the calf — for fitted legs',
        unit: 'in', min: 10, max: 20, step: 0.25, defaultValue: 13, visibleWhen: fitted,
    },
    {
        key: 'ankleRound', label: 'Ankle Round', group: 'bottoms-legs',
        description: 'Around the ankle bone — a churidar closes snugly here',
        unit: 'in', min: 8, max: 16, step: 0.25, defaultValue: 10, visibleWhen: churidarOnly,
    },
];

const LENGTH_FIELDS: readonly MeasurementFieldSpec[] = [
    {
        key: 'bottomLength', label: 'Bottom Length', group: 'bottoms-lengths',
        description: 'From the waist down the side to the ankle (or desired hem)',
        unit: 'in', min: 34, max: 44, step: 0.25, defaultValue: 39,
    },
    {
        key: 'bottomOpening', label: 'Bottom Opening', group: 'bottoms-lengths',
        description: 'Around one leg’s hem opening — snug for churidar, flowing for palazzo',
        unit: 'in', min: 8, max: 40, step: 0.25, defaultValue: 18,
        rangeWhen: (attrs) => OPENING_RANGES[String(attrs.bottomStyle)] ?? {},
    },
];

export const BOTTOMS_MEASUREMENT_SPEC: CategoryMeasurementSpec = composeSpec('bottoms', [
    ownGroup({ key: 'bottoms-fit', label: 'Fit' }, [...FIT_FIELDS]),
    ownGroup({ key: 'bottoms-legs', label: 'Legs' }, [...LEG_FIELDS]),
    ownGroup({ key: 'bottoms-lengths', label: 'Lengths & Opening' }, [...LENGTH_FIELDS]),
]);
