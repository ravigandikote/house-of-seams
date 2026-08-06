// Salwar-suit measurement field-set = the kameez (kurti) chart + the
// bottoms chart, composed with the shared body fields DEDUPED — the
// customer measures her waist once, not twice. composeSpec's duplicate
// guard is the forcing function here: any overlap left behind throws at
// module init.
//
// Dedupe decisions:
//   * waistRound/hipRound live in the kameez's Lower Body group (dropped
//     from the bottoms Fit group, leaving Body Rise).
//   * thighRound comes from the BOTTOMS side (always needed for the
//     bottoms) — the kurti's straight-cut-only copy is dropped.

import { KURTI_MEASUREMENT_SPEC } from './kurtiMeasurements';
import { BOTTOMS_MEASUREMENT_SPEC } from './bottomsMeasurements';
import { CategoryMeasurementSpec, composeSpec, importGroups } from './measurementSpec';

const kameez = importGroups(KURTI_MEASUREMENT_SPEC, [
    'upper-body',
    'neck',
    'arm-sleeve',
    'kurti-lengths',
    'lower-body',
], {
    groupOverrides: { 'lower-body': { label: 'Waist & Hips' } },
});
kameez.fields = kameez.fields.filter((f) => f.key !== 'thighRound');

const bottoms = importGroups(BOTTOMS_MEASUREMENT_SPEC, [
    'bottoms-fit',
    'bottoms-legs',
    'bottoms-lengths',
], {
    groupOverrides: { 'bottoms-fit': { label: 'Bottoms Rise' } },
});
bottoms.fields = bottoms.fields.filter((f) => f.key !== 'waistRound' && f.key !== 'hipRound');

export const SALWAR_SUIT_MEASUREMENT_SPEC: CategoryMeasurementSpec = composeSpec(
    'salwar_suit',
    [kameez, bottoms]
);
