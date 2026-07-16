// Garment categories offered by the customizer. Blouse is fully built;
// the others are placeholders until the boutique finalises their
// measurement guides (each category will get its own field set, styles,
// and preview — mirror how src/types/measurements.ts and
// src/types/blouseDesign.ts define the blouse).

export interface CustomizerCategory {
    id: string;
    label: string;
    available: boolean;
    description: string;
}

export const CUSTOMIZER_CATEGORIES: readonly CustomizerCategory[] = [
    {
        id: 'blouse',
        label: 'Blouse',
        available: true,
        description: 'Custom-fitted saree blouses',
    },
    {
        id: 'shirt',
        label: 'Shirts',
        available: false,
        description: 'Coming soon',
    },
    {
        id: 'trousers',
        label: 'Trousers',
        available: false,
        description: 'Coming soon',
    },
];
