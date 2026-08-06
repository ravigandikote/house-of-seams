'use client';

import React from 'react';
import BlousePreview from './BlousePreview';
import BottomsPreview from './BottomsPreview';
import KurtiPreview from './KurtiPreview';
import LehengaPreview from './LehengaPreview';
import { RendererId } from '../../types/customizerCategories';
import { BlouseDesignAttributes } from '../../types/blouseDesign';
import { BottomsDesignAttributes } from '../../types/bottomsDesign';
import { KurtiDesignAttributes } from '../../types/kurtiDesign';
import { LehengaDesignAttributes } from '../../types/lehengaDesign';
import { Measurements } from '../../types/measurements';

// Client-side mapping from manifest renderer ids to the actual preview
// components. The manifest (src/types/customizerCategories.ts) must stay
// server-importable, so it references renderers by id only; anything that
// needs to DRAW a garment from manifest data goes through here.

export interface GarmentRenderProps {
    /** Style attributes incl. baseColor — shape depends on the renderer. */
    style: Record<string, string>;
    measurements: Record<string, number>;
    /** Only meaningful for renderers with multiple views (blouse). */
    view?: 'front' | 'back';
    className?: string;
}

export function renderGarment(id: RendererId, props: GarmentRenderProps): React.ReactNode {
    switch (id) {
        case 'blouse':
            return (
                <BlousePreview
                    design={props.style as unknown as BlouseDesignAttributes}
                    measurements={props.measurements as Measurements}
                    view={props.view ?? 'front'}
                    showCaption={false}
                    className={props.className}
                />
            );
        case 'lehenga':
            return (
                <LehengaPreview
                    styleAttributes={props.style as unknown as LehengaDesignAttributes}
                    measurements={props.measurements}
                    className={props.className}
                />
            );
        case 'kurti':
            return (
                <KurtiPreview
                    design={props.style as unknown as KurtiDesignAttributes}
                    measurements={props.measurements}
                    className={props.className}
                />
            );
        case 'bottoms':
            return (
                <BottomsPreview
                    design={props.style as unknown as BottomsDesignAttributes}
                    measurements={props.measurements}
                    className={props.className}
                />
            );
    }
}
