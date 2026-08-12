'use client';

import React from 'react';
import BlousePreview from './BlousePreview';
import { BlouseDesignAttributes } from '../../types/blouseDesign';
import { Measurements } from '../../types/measurements';

// One horizontal row of variation options for the "Make It Yours" step:
// the same design drawn once per option with a single attribute swapped.
//
// Thumbnails are drawn from the CHOSEN design, not from the customer's
// running selection, so a row never redraws while they browse it — which
// is what makes the memo below worth having. The hero preview above the
// rows is the one that shows the live combination.

export type VariationAttribute = 'sleeveStyle' | 'neckStyle' | 'backStyle';

// "three-quarter" -> "Three Quarter"
function labelize(value: string): string {
    return value
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

interface ThumbProps {
    option: string;
    isSelected: boolean;
    view: 'front' | 'back';
    measurements: Measurements;
    // Spread as primitives rather than one object so React.memo's shallow
    // compare actually holds between renders.
    neckStyle: BlouseDesignAttributes['neckStyle'];
    backStyle: BlouseDesignAttributes['backStyle'];
    sleeveStyle: BlouseDesignAttributes['sleeveStyle'];
    closure: BlouseDesignAttributes['closure'];
    embellishment: BlouseDesignAttributes['embellishment'];
    baseColor: string;
    onPick: (option: string) => void;
}

const VariationThumb: React.FC<ThumbProps> = ({
    option,
    isSelected,
    view,
    measurements,
    neckStyle,
    backStyle,
    sleeveStyle,
    closure,
    embellishment,
    baseColor,
    onPick,
}) => (
    <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => onPick(option)}
        className={`shrink-0 snap-start w-[104px] rounded-sm border bg-white text-center transition-all duration-300 touch-manipulation ${
            isSelected
                ? 'border-champagne-gold ring-1 ring-champagne-gold shadow-lift'
                : 'border-champagne-gold/25 shadow-soft active:border-champagne-gold [@media(hover:hover)]:hover:border-champagne-gold/60 [@media(hover:hover)]:hover:shadow-lift'
        }`}
    >
        <div className="paper-card p-1.5 rounded-t-sm">
            <BlousePreview
                design={{ neckStyle, backStyle, sleeveStyle, closure, embellishment, baseColor }}
                measurements={measurements}
                view={view}
                showCaption={false}
            />
        </div>
        <span
            className={`label-caps text-[9px] block px-1 py-2 border-t border-champagne-gold/20 ${
                isSelected ? 'text-champagne-gold-dark' : 'text-warm-gray'
            }`}
        >
            {labelize(option)}
        </span>
    </button>
);

// Every prop is a primitive except measurements and onPick, both of which
// the parent keeps stable — so this compare is sound and stops all 17
// sketches redrawing on each tap.
const MemoThumb = React.memo(VariationThumb);

interface VariationPickerProps {
    label: string;
    /** Copy under the label, e.g. "cut for this design". */
    hint?: string;
    options: readonly string[];
    value: string;
    /** The chosen design the thumbnails are drawn from. */
    baseDesign: BlouseDesignAttributes;
    attribute: VariationAttribute;
    view: 'front' | 'back';
    measurements: Measurements;
    onPick: (option: string) => void;
}

const VariationPicker: React.FC<VariationPickerProps> = ({
    label,
    hint,
    options,
    value,
    baseDesign,
    attribute,
    view,
    measurements,
    onPick,
}) => {
    // A single option is not a choice — the design is simply cut that way.
    if (options.length < 2) return null;

    return (
        <div className="mb-7">
            <div className="flex items-baseline justify-between mb-2">
                <span className="label-caps text-champagne-gold-dark">{label}</span>
                <span className="font-accent italic text-body-sm text-warm-gray">
                    {hint ?? labelize(value)}
                </span>
            </div>
            {/* Horizontal at every width: on a 380px phone this is a swipe
                strip, on desktop the row simply fits. */}
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
                {options.map((option) => (
                    <MemoThumb
                        key={option}
                        option={option}
                        isSelected={option === value}
                        view={view}
                        measurements={measurements}
                        neckStyle={
                            attribute === 'neckStyle'
                                ? (option as BlouseDesignAttributes['neckStyle'])
                                : baseDesign.neckStyle
                        }
                        backStyle={
                            attribute === 'backStyle'
                                ? (option as BlouseDesignAttributes['backStyle'])
                                : baseDesign.backStyle
                        }
                        sleeveStyle={
                            attribute === 'sleeveStyle'
                                ? (option as BlouseDesignAttributes['sleeveStyle'])
                                : baseDesign.sleeveStyle
                        }
                        closure={baseDesign.closure}
                        embellishment={baseDesign.embellishment}
                        baseColor={baseDesign.baseColor}
                        onPick={onPick}
                    />
                ))}
            </div>
        </div>
    );
};

export default VariationPicker;
