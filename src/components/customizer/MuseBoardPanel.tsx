'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MUSE_MAX_IMAGES, MUSE_NOTE_MAX_LENGTH } from '../../types/customDesignRequest';

// "Your Muse Board" — optional inspiration images + occasion note,
// collected on the final customizer step and uploaded AFTER the request
// is created (see /api/customize/muse-upload). Never blocks submit;
// skippable by simply not adding anything.

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

interface MuseBoardPanelProps {
    files: File[];
    note: string;
    onFilesChange: (files: File[]) => void;
    onNoteChange: (note: string) => void;
}

const MuseBoardPanel: React.FC<MuseBoardPanelProps> = ({ files, note, onFilesChange, onNoteChange }) => {
    const [previews, setPreviews] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Object URLs for the cream-card previews, revoked on change/unmount.
    useEffect(() => {
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [files]);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        setError(null);
        const next = [...files];
        for (const file of Array.from(incoming)) {
            if (next.length >= MUSE_MAX_IMAGES) {
                setError(`Up to ${MUSE_MAX_IMAGES} images — a tight edit says more.`);
                break;
            }
            if (!ALLOWED.includes(file.type)) {
                setError('JPG, PNG, or WebP please — screenshots and phone photos work perfectly.');
                continue;
            }
            if (file.size > MAX_SIZE) {
                setError('Each image can be at most 5MB.');
                continue;
            }
            next.push(file);
        }
        onFilesChange(next);
        if (inputRef.current) inputRef.current.value = '';
    };

    const removeAt = (index: number) => {
        setError(null);
        onFilesChange(files.filter((_, i) => i !== index));
    };

    return (
        <div className="mt-8">
            <div className="border-b border-champagne-gold/40 pb-2 mb-2">
                <span className="label-caps text-champagne-gold-dark">Your Muse Board</span>
                <span className="label-caps text-[9px] text-warm-gray ml-2">Optional</span>
            </div>
            <p className="font-accent italic text-body-sm text-warm-gray mb-4">
                Sarees, Pinterest finds, a blouse you loved at a wedding — show Kavya what&apos;s
                inspiring you.
            </p>

            <div
                className="grid grid-cols-4 gap-3 mb-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    addFiles(e.dataTransfer.files);
                }}
            >
                {previews.map((src, i) => (
                    <div
                        key={src}
                        className="relative aspect-square bg-cream border border-champagne-gold/30 rounded-sm overflow-hidden shadow-soft"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            aria-label={`Remove inspiration image ${i + 1}`}
                            onClick={() => removeAt(i)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/70 text-cream text-xs leading-none hover:bg-deep-rose transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                {files.length < MUSE_MAX_IMAGES && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="aspect-square border border-dashed border-champagne-gold/50 rounded-sm bg-ivory/60 text-warm-gray hover:border-deep-rose hover:text-deep-rose transition-colors flex flex-col items-center justify-center"
                    >
                        <span className="text-headline leading-none" aria-hidden="true">+</span>
                        <span className="label-caps text-[8px] mt-1">Add</span>
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
            />
            {error && <p className="text-body-sm text-red-500 mb-3" role="alert">{error}</p>}

            <label className="label-caps block text-warm-gray">Tell Kavya about the occasion</label>
            <input
                type="text"
                value={note}
                maxLength={MUSE_NOTE_MAX_LENGTH}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="My sister's December wedding — gold-heavy kanjeevaram…"
                className="mt-1.5 block w-full rounded-sm px-3 py-2.5"
            />
            <p className="text-caption text-warm-gray text-right mt-1">
                {note.length}/{MUSE_NOTE_MAX_LENGTH}
            </p>
        </div>
    );
};

export default MuseBoardPanel;
