// Kurti/kameez measurement field-set. The torso IS the blouse's: the
// upper-body, neck, and arm-sleeve groups are imported unchanged from the
// blouse spec (one source of truth); kurti adds its own lengths and
// lower-body fields. All tape values in INCHES.
//
// NOTE: the plan asked to "reuse shoulderToWaist from blouse", but the
// blouse chart has no such field (closest is shoulderToUnderBust, which
// arrives with the imported upper-body group) — so shoulderToWaist is
// defined here as a kurti-own field.

import { BLOUSE_MEASUREMENT_SPEC } from './measurements';
import {
    CategoryMeasurementSpec,
    MeasurementFieldSpec,
    StyleAttributes,
    composeSpec,
    importGroups,
    ownGroup,
} from './measurementSpec';

const straightOnly = (attrs: StyleAttributes) => attrs.cut === 'straight';
const hasSlit = (attrs: StyleAttributes) => attrs.slit !== 'none';

const LENGTH_FIELDS: readonly MeasurementFieldSpec[] = [
    {
        key: 'kurtiLength', label: 'Kurti Length', group: 'kurti-lengths',
        description: 'From the shoulder at the neck point straight down to the desired hem',
        unit: 'in', min: 34, max: 50, step: 0.25, defaultValue: 42,
    },
    {
        key: 'shoulderToWaist', label: 'Shoulder to Waist', group: 'kurti-lengths',
        description: 'From the shoulder at the neck point down to the natural waistline',
        unit: 'in', min: 12, max: 22, step: 0.25, defaultValue: 16,
    },
    {
        key: 'slitLength', label: 'Slit Length', group: 'kurti-lengths',
        description: 'How far the slit opens upward from the hem',
        unit: 'in', min: 8, max: 18, step: 0.25, defaultValue: 12, visibleWhen: hasSlit,
    },
];

const LOWER_BODY_FIELDS: readonly MeasurementFieldSpec[] = [
    {
        key: 'waistRound', label: 'Waist Round', group: 'lower-body',
        description: 'Around the natural waist',
        unit: 'in', min: 24, max: 50, step: 0.25, defaultValue: 32,
    },
    {
        key: 'hipRound', label: 'Hip Round', group: 'lower-body',
        description: 'Around the fullest part of the hips',
        unit: 'in', min: 28, max: 54, step: 0.25, defaultValue: 38,
    },
    {
        key: 'thighRound', label: 'Thigh Round', group: 'lower-body',
        description: 'Around the fullest part of the thigh — keeps a straight cut from pulling',
        unit: 'in', min: 16, max: 34, step: 0.25, defaultValue: 22, visibleWhen: straightOnly,
    },
    {
        key: 'hemRound', label: 'Hem Round', group: 'lower-body',
        description: 'Total sweep of the hem — wider for A-line and flared cuts',
        unit: 'in', min: 32, max: 80, step: 0.25, defaultValue: 44,
        // A flared kurti physically needs more sweep — raise the floor.
        rangeWhen: (attrs) =>
            attrs.cut === 'flared' ? { min: 48, defaultValue: 60 } : {},
    },
];

export const KURTI_MEASUREMENT_SPEC: CategoryMeasurementSpec = composeSpec('kurti', [
    importGroups(BLOUSE_MEASUREMENT_SPEC, ['upper-body', 'neck', 'arm-sleeve']),
    ownGroup({ key: 'kurti-lengths', label: 'Lengths' }, [...LENGTH_FIELDS]),
    ownGroup({ key: 'lower-body', label: 'Lower Body' }, [...LOWER_BODY_FIELDS]),
]);
