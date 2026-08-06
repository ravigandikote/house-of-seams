'use client';

import React, { useRef, useState } from 'react';
import BlousePreview from '@/components/customizer/BlousePreview';
import LehengaEnsemblePreview from '@/components/customizer/LehengaEnsemblePreview';
import { renderGarment } from '@/components/customizer/rendererRegistry';
import { categoryById } from '@/types/customizerCategories';
import SalwarSuitEnsemblePreview from '@/components/customizer/SalwarSuitEnsemblePreview';
import { BlouseDesignAttributes } from '@/types/blouseDesign';
import { BottomsDesignAttributes } from '@/types/bottomsDesign';
import { KurtiDesignAttributes } from '@/types/kurtiDesign';
import { LehengaDesignAttributes } from '@/types/lehengaDesign';
import { Measurements } from '@/types/measurements';
import { RequestCategory, SketchAnnotation, SketchView } from '@/types/customDesignRequest';

// "Design With Kavya" admin editor: numbered gold pins dropped directly on
// the client's submitted sketch. Pure overlay — an absolutely-positioned
// layer over the SVG container; BlousePreview internals are untouched.
// Coordinates are stored as PERCENTAGES of the rendered box, which equals
// the SVG viewBox proportionally, so the atelier page renders pins in
// exactly the same spots at any size.

interface SketchAnnotatorProps {
    category?: RequestCategory;
    design: BlouseDesignAttributes | LehengaDesignAttributes | KurtiDesignAttributes | BottomsDesignAttributes;
    measurements: Measurements | Record<string, number>;
    view: SketchView;
    annotations: SketchAnnotation[];
    onChange: (annotations: SketchAnnotation[]) => void;
    /** Lehenga ensembles: the choli worn above the skirt, and the dupatta. */
    choli?: BlouseDesignAttributes | null;
    /** Salwar suits: the bottoms worn under the kameez. */
    bottoms?: BottomsDesignAttributes | null;
    dupatta?: boolean;
}

const clampPct = (n: number) => Math.min(97, Math.max(3, n));

const newId = () => `pin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const SketchAnnotator: React.FC<SketchAnnotatorProps> = ({
    category = 'blouse',
    design,
    measurements,
    view,
    annotations,
    onChange,
    choli = null,
    bottoms = null,
    dupatta = false,
}) => {
    const [annotateMode, setAnnotateMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const editing = annotations.find((a) => a.id === editingId) ?? null;

    const pctFromEvent = (e: React.PointerEvent | React.MouseEvent) => {
        const rect = wrapperRef.current!.getBoundingClientRect();
        return {
            xPct: clampPct(((e.clientX - rect.left) / rect.width) * 100),
            yPct: clampPct(((e.clientY - rect.top) / rect.height) * 100),
        };
    };

    const startEditing = (a: SketchAnnotation) => {
        setEditingId(a.id);
        setDraft(a.note);
    };

    const placePin = (e: React.MouseEvent) => {
        if (!annotateMode || draggingId) return;
        const { xPct, yPct } = pctFromEvent(e);
        const pin: SketchAnnotation = {
            id: newId(),
            view,
            xPct,
            yPct,
            note: '',
            createdAt: new Date().toISOString(),
        };
        onChange([...annotations, pin]);
        setEditingId(pin.id);
        setDraft('');
    };

    const saveDraft = () => {
        if (!editing) return;
        const note = draft.trim();
        if (!note) {
            // A pin without a note is meaningless — placing then cancelling
            // (or saving empty) removes it.
            onChange(annotations.filter((a) => a.id !== editing.id));
        } else {
            onChange(annotations.map((a) => (a.id === editing.id ? { ...a, note } : a)));
        }
        setEditingId(null);
    };

    const deleteEditing = () => {
        if (!editing) return;
        onChange(annotations.filter((a) => a.id !== editing.id));
        setEditingId(null);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingId) return;
        const { xPct, yPct } = pctFromEvent(e);
        onChange(annotations.map((a) => (a.id === draggingId ? { ...a, xPct, yPct } : a)));
    };

    const visible = annotations
        .map((a, i) => ({ ...a, number: i + 1 }))
        .filter((a) => a.view === view);

    return (
        <div>
            <div className="flex justify-end mb-2">
                <button
                    type="button"
                    onClick={() => {
                        setAnnotateMode((m) => !m);
                        setEditingId(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        annotateMode
                            ? 'bg-champagne-gold-dark text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {annotateMode ? '✎ Annotating — click the sketch' : '✎ Annotate sketch'}
                </button>
            </div>

            <div
                ref={wrapperRef}
                onClick={placePin}
                onPointerMove={handlePointerMove}
                onPointerUp={() => setDraggingId(null)}
                onPointerLeave={() => setDraggingId(null)}
                className={`relative select-none ${annotateMode ? 'cursor-crosshair' : ''}`}
            >
                {category === 'lehenga' ? (
                    <LehengaEnsemblePreview
                        skirt={design as LehengaDesignAttributes}
                        choli={choli}
                        dupatta={dupatta}
                        measurements={measurements as Record<string, number>}
                    />
                ) : category === 'salwar_suit' && bottoms ? (
                    <SalwarSuitEnsemblePreview
                        kameez={design as unknown as KurtiDesignAttributes}
                        bottoms={bottoms}
                        dupatta={dupatta}
                        measurements={measurements as Record<string, number>}
                    />
                ) : category !== 'blouse' && categoryById(category)?.renderer?.kind === 'single' ? (
                    renderGarment(
                        (categoryById(category)!.renderer as { kind: 'single'; rendererId: 'blouse' | 'lehenga' | 'kurti' }).rendererId,
                        {
                            style: design as unknown as Record<string, string>,
                            measurements: measurements as Record<string, number>,
                        }
                    )
                ) : (
                    <BlousePreview
                        design={design as BlouseDesignAttributes}
                        measurements={measurements as Measurements}
                        view={view}
                        showCaption={false}
                    />
                )}
                {/* Pin overlay — absolute layer, renderer untouched */}
                {visible.map((a) => (
                    <button
                        key={a.id}
                        type="button"
                        aria-label={`Note ${a.number}: ${a.note || 'new note'}`}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setDraggingId(a.id);
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            startEditing(a);
                        }}
                        className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border-2 text-xs font-bold shadow-soft transition-transform ${
                            a.id === editingId
                                ? 'bg-deep-rose border-white text-white scale-110'
                                : 'bg-champagne-gold-dark border-white text-white hover:scale-110'
                        } ${draggingId === a.id ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
                        style={{ left: `${a.xPct}%`, top: `${a.yPct}%` }}
                    >
                        {a.number}
                    </button>
                ))}
            </div>

            {editing && (
                <div className="mt-2 bg-white border border-champagne-gold/40 rounded-lg p-3 shadow-soft">
                    <span className="block text-xs font-medium text-gray-500 mb-1.5">
                        Note {annotations.findIndex((a) => a.id === editing.id) + 1} · {view}
                    </span>
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={2}
                        maxLength={300}
                        autoFocus
                        placeholder="e.g. I'd raise this neckline half an inch for the zari border…"
                        className="block w-full text-sm border border-gray-200 rounded px-2 py-1.5"
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            type="button"
                            onClick={saveDraft}
                            className="text-xs font-medium px-3 py-1.5 rounded bg-dusty-rose text-white hover:bg-dusty-rose-dark transition-colors"
                        >
                            Save note
                        </button>
                        <button
                            type="button"
                            onClick={deleteEditing}
                            className="text-xs font-medium px-3 py-1.5 rounded bg-gray-100 text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Delete pin
                        </button>
                    </div>
                </div>
            )}

            {annotations.length > 0 && (
                <ol className="mt-3 space-y-1.5">
                    {annotations.map((a, i) => (
                        <li key={a.id}>
                            <button
                                type="button"
                                onClick={() => startEditing(a)}
                                className="w-full text-left text-xs text-charcoal bg-gray-50 hover:bg-gray-100 rounded px-2.5 py-1.5 flex gap-2 transition-colors"
                            >
                                <span className="shrink-0 w-5 h-5 rounded-full bg-champagne-gold-dark text-white text-[10px] font-bold flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <span className="min-w-0">
                                    <span className="text-gray-400 mr-1">[{a.view}]</span>
                                    {a.note || <em className="text-gray-400">unsaved</em>}
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default SketchAnnotator;
