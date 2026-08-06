'use client';

import React, { useRef, useState } from 'react';
import BlousePreview from '@/components/customizer/BlousePreview';
import { CornerFlourish } from '@/components/ui/decor';
import { BlouseDesignAttributes } from '@/types/blouseDesign';
import { Measurements } from '@/types/measurements';
import { SketchAnnotation } from '@/types/customDesignRequest';

// The atelier page's sketch section. When Kavya has annotated the design,
// her numbered gold pins appear on the sketch and her notes below —
// tapping a pin highlights its note and vice-versa. Pure overlay over the
// BlousePreview container; renderer internals untouched. Pins are 28px —
// comfortably above the 24px minimum touch target.

interface AnnotatedSketchProps {
    design: BlouseDesignAttributes;
    measurements: Measurements;
    annotations: SketchAnnotation[];
}

const AnnotatedSketch: React.FC<AnnotatedSketchProps> = ({ design, measurements, annotations }) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const noteRefs = useRef<Record<string, HTMLLIElement | null>>({});
    const sketchRef = useRef<HTMLDivElement>(null);

    const numbered = annotations.map((a, i) => ({ ...a, number: i + 1 }));

    const focusNote = (id: string) => {
        setActiveId(id);
        noteRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const focusPin = (id: string) => {
        setActiveId(id);
        sketchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div>
            <div ref={sketchRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto">
                {(['front', 'back'] as const).map((view) => (
                    <div
                        key={view}
                        className="relative paper-card border border-champagne-gold/40 rounded-sm p-5"
                    >
                        <CornerFlourish position="tl" />
                        <CornerFlourish position="br" />
                        <div className="relative">
                            <BlousePreview
                                design={design}
                                measurements={measurements}
                                view={view}
                                showCaption={false}
                            />
                            {numbered
                                .filter((a) => a.view === view)
                                .map((a) => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        aria-label={`Note ${a.number} from Kavya`}
                                        onClick={() => focusNote(a.id)}
                                        className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border-2 border-white text-xs font-bold text-white shadow-soft transition-transform duration-200 ${
                                            a.id === activeId
                                                ? 'bg-deep-rose scale-125'
                                                : 'bg-champagne-gold-dark hover:scale-110'
                                        }`}
                                        style={{ left: `${a.xPct}%`, top: `${a.yPct}%` }}
                                    >
                                        {a.number}
                                    </button>
                                ))}
                        </div>
                        <p className="font-accent italic text-body-sm text-warm-gray text-center mt-1">
                            {view === 'front' ? 'Front' : 'Back'}
                        </p>
                    </div>
                ))}
            </div>
            <p className="font-accent italic text-body-sm text-warm-gray text-center mt-3">
                Illustrative sketch — not to scale
            </p>

            {numbered.length > 0 && (
                <div className="mt-10 max-w-xl mx-auto">
                    <p className="label-caps text-champagne-gold-dark text-center mb-5">Notes from Kavya</p>
                    <ol className="space-y-3">
                        {numbered.map((a) => (
                            <li
                                key={a.id}
                                ref={(el) => {
                                    noteRefs.current[a.id] = el;
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => focusPin(a.id)}
                                    className={`w-full text-left flex gap-3.5 items-start bg-white border rounded-sm p-4 transition-all duration-300 ${
                                        a.id === activeId
                                            ? 'border-deep-rose shadow-lift'
                                            : 'border-champagne-gold/30 shadow-soft hover:border-champagne-gold/60'
                                    }`}
                                >
                                    <span
                                        className={`shrink-0 w-7 h-7 rounded-full text-xs font-bold text-white flex items-center justify-center ${
                                            a.id === activeId ? 'bg-deep-rose' : 'bg-champagne-gold-dark'
                                        }`}
                                        aria-hidden="true"
                                    >
                                        {a.number}
                                    </span>
                                    <span className="min-w-0 pt-0.5">
                                        <span className="font-accent italic text-body text-charcoal block">
                                            {a.note}
                                        </span>
                                        <span className="label-caps text-[9px] text-warm-gray block mt-1.5">
                                            On the {a.view} view
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
};

export default AnnotatedSketch;
