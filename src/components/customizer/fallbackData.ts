import { BlouseDesign } from '../../types/blouseDesign';
import { GarmentDesign } from '../../types/garmentDesign';
import { MeasurementDefault, Measurements, TYPICAL_MEASUREMENTS } from '../../types/measurements';

// Fallback data mirroring supabase/seed.sql, used only when Supabase is
// not configured (same convention as the products page JSON fallback).

export const FALLBACK_DESIGNS: BlouseDesign[] = [
    {
        id: 'fallback-1',
        name: 'Classic Round',
        slug: 'classic-round',
        description: 'A timeless everyday silhouette with a modest round neckline and short sleeves.',
        neckStyle: 'round',
        backStyle: 'round',
        sleeveStyle: 'short',
        closure: 'hook',
        embellishment: 'plain',
        baseColor: '#D6A6B1',
        isActive: true,
        sortOrder: 1,
    },
    {
        id: 'fallback-2',
        name: 'Elegant Sweetheart',
        slug: 'elegant-sweetheart',
        description: 'A romantic sweetheart neckline with a deep round back, perfect for receptions.',
        neckStyle: 'sweetheart',
        backStyle: 'deep-round',
        sleeveStyle: 'cap',
        closure: 'zip',
        embellishment: 'embroidery',
        baseColor: '#B87A88',
        isActive: true,
        sortOrder: 2,
    },
    {
        id: 'fallback-3',
        name: 'Regal Zari High-Neck',
        slug: 'regal-zari-high-neck',
        description: 'A high neckline with rich zari work and elbow sleeves for a stately bridal look.',
        neckStyle: 'high',
        backStyle: 'keyhole',
        sleeveStyle: 'elbow',
        closure: 'button',
        embellishment: 'zari',
        baseColor: '#8FA88D',
        isActive: true,
        sortOrder: 3,
    },
    {
        id: 'fallback-4',
        name: 'Boat Neck Minimal',
        slug: 'boat-neck-minimal',
        description: 'A clean boat neck with three-quarter sleeves for a contemporary festive style.',
        neckStyle: 'boat',
        backStyle: 'v',
        sleeveStyle: 'three-quarter',
        closure: 'zip',
        embellishment: 'plain',
        baseColor: '#2D2D2D',
        isActive: true,
        sortOrder: 4,
    },
    {
        id: 'fallback-5',
        name: 'Mirror-Work Deep V',
        slug: 'mirror-work-deep-v',
        description: 'A statement V-neck with mirror embellishment and a tie back.',
        neckStyle: 'v',
        backStyle: 'tie',
        sleeveStyle: 'sleeveless',
        closure: 'tie',
        embellishment: 'mirror',
        baseColor: '#B7C9B5',
        isActive: true,
        sortOrder: 5,
    },
    {
        id: 'fallback-6',
        name: 'Stone-Studded Square',
        slug: 'stone-studded-square',
        description: 'A square neckline studded with stones, full sleeves for a winter wedding.',
        neckStyle: 'square',
        backStyle: 'round',
        sleeveStyle: 'full',
        closure: 'hook',
        embellishment: 'stone',
        baseColor: '#D6A6B1',
        isActive: true,
        sortOrder: 6,
    },
];

function bracket(
    id: string,
    label: string,
    ageMin: number,
    ageMax: number,
    overrides: Partial<Measurements>
): MeasurementDefault {
    return { id, label, ageMin, ageMax, ...TYPICAL_MEASUREMENTS, ...overrides };
}

export const FALLBACK_BRACKETS: MeasurementDefault[] = [
    bracket('fallback-b1', 'Under 18', 13, 17, {
        shoulderWidth: 13.5, acrossFront: 12.5, acrossBack: 13, bust: 32, upperBust: 31,
        underBust: 27, apexToApex: 6.5, shoulderToApex: 9, shoulderToUnderBust: 14,
        frontNeckDepth: 6, backNeckDepth: 7, neckWidth: 13.5, armhole: 15, sleeveRound: 10,
        elbowRound: 9, wristRound: 6, sleeveLength: 6, blouseLength: 13.5, frontLength: 14,
        backLength: 14.5, sideSeamLength: 7.5, waist: 26, hip: 34,
    }),
    // 18-25 is exactly the typical set
    bracket('fallback-b2', '18-25', 18, 25, {}),
    bracket('fallback-b3', '26-40', 26, 40, {
        shoulderWidth: 14.5, acrossFront: 13.5, acrossBack: 14, bust: 36, upperBust: 35,
        underBust: 31, apexToApex: 7.5, shoulderToApex: 10, shoulderToUnderBust: 15.5,
        frontNeckDepth: 6.5, backNeckDepth: 7.5, neckWidth: 14.5, armhole: 16.5, sleeveRound: 12,
        elbowRound: 10, wristRound: 7, sleeveLength: 6.5, blouseLength: 14.5, frontLength: 15,
        backLength: 15.5, sideSeamLength: 8.5, waist: 31, hip: 39,
    }),
    bracket('fallback-b4', '41 and above', 41, 99, {
        shoulderWidth: 15, acrossFront: 14, acrossBack: 14.5, bust: 38, upperBust: 37,
        underBust: 33, apexToApex: 8, shoulderToApex: 10.5, shoulderToUnderBust: 16,
        frontNeckDepth: 6, backNeckDepth: 7, neckWidth: 15, armhole: 17.5, sleeveRound: 13,
        elbowRound: 10.5, wristRound: 7.5, sleeveLength: 7, blouseLength: 15, frontLength: 15.5,
        backLength: 16, sideSeamLength: 9, waist: 34, hip: 42,
    }),
];

// Demo-mode lehenga skirt designs (mirror of the seeded garment_designs
// rows — the live journey loads those; this keeps demo mode walkable).
export const FALLBACK_LEHENGA_DESIGNS: GarmentDesign[] = [
    {
        id: 'fallback-lehenga-1',
        category: 'lehenga',
        name: 'Classic A-Line',
        slug: 'classic-a-line',
        description: 'A graceful everyday silhouette that skims the hips and falls clean to the floor.',
        styleAttributes: { silhouette: 'a_line', closure: 'side_zip', embellishment: 'plain', baseColor: '#D6A6B1' },
        isSignature: false,
        sortOrder: 1,
        isActive: true,
    },
    {
        id: 'fallback-lehenga-2',
        category: 'lehenga',
        name: 'Grand Circular Twirl',
        slug: 'grand-circular-twirl',
        description: 'A full circular cut with maximum ghera — made for twirling photographs.',
        styleAttributes: { silhouette: 'circular', closure: 'drawstring', embellishment: 'zari', baseColor: '#8FA88D' },
        isSignature: true,
        sortOrder: 2,
        isActive: true,
    },
    {
        id: 'fallback-lehenga-3',
        category: 'lehenga',
        name: 'Mermaid Muse',
        slug: 'mermaid-muse',
        description: 'Fitted through the hip and thigh, flaring dramatically below the knee.',
        styleAttributes: { silhouette: 'mermaid', closure: 'side_zip', embellishment: 'sequin', baseColor: '#2D2D2D' },
        isSignature: false,
        sortOrder: 3,
        isActive: true,
    },
    {
        id: 'fallback-lehenga-4',
        category: 'lehenga',
        name: 'Paneled Heritage',
        slug: 'paneled-heritage',
        description: 'Traditional kali construction with bold mirror-work panels.',
        styleAttributes: { silhouette: 'paneled', closure: 'hook', embellishment: 'mirror', baseColor: '#B7C9B5' },
        isSignature: false,
        sortOrder: 4,
        isActive: true,
    },
];
