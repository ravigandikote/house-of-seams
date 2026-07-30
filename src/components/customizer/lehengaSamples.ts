import { LehengaDesign } from '../../types/lehengaDesign';

// v1 sample designs (no lehenga_designs table yet — these are local
// typed constants, mirroring how blouse fallbackData works; replace with
// DB rows + admin CRUD when the lehenga backend lands).

export const SAMPLE_LEHENGA_DESIGNS: LehengaDesign[] = [
    {
        id: 'lehenga-sample-1',
        name: 'Classic A-Line',
        slug: 'classic-a-line',
        description: 'A graceful everyday silhouette that skims the hips and falls clean to the floor.',
        silhouette: 'a_line',
        closure: 'side_zip',
        embellishment: 'plain',
        baseColor: '#D6A6B1',
        isActive: true,
        sortOrder: 1,
    },
    {
        id: 'lehenga-sample-2',
        name: 'Grand Circular Twirl',
        slug: 'grand-circular-twirl',
        description: 'A full circular cut with maximum ghera — made for twirling photographs.',
        silhouette: 'circular',
        closure: 'drawstring',
        embellishment: 'zari',
        baseColor: '#8FA88D',
        isActive: true,
        sortOrder: 2,
    },
    {
        id: 'lehenga-sample-3',
        name: 'Mermaid Muse',
        slug: 'mermaid-muse',
        description: 'Fitted through the hip and thigh, flaring dramatically below the knee.',
        silhouette: 'mermaid',
        closure: 'side_zip',
        embellishment: 'sequin',
        baseColor: '#2D2D2D',
        isActive: true,
        sortOrder: 3,
    },
    {
        id: 'lehenga-sample-4',
        name: 'Paneled Heritage',
        slug: 'paneled-heritage',
        description: 'Traditional kali construction with bold mirror-work panels.',
        silhouette: 'paneled',
        closure: 'hook',
        embellishment: 'mirror',
        baseColor: '#B7C9B5',
        isActive: true,
        sortOrder: 4,
    },
];
