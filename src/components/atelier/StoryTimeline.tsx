import React from 'react';
import { RequestStatus, RequestStatusEvent } from '@/types/customDesignRequest';
import { STORY_COPY, STORY_FLOW } from '@/lib/designStoryCopy';

// The Design Story journal timeline. Server-rendered: chapters (status
// events) down a gold hairline, with the remaining canonical steps shown
// as faint "upcoming" entries. Renders on the public atelier page — keep
// it free of any contact details.

interface StoryTimelineProps {
    events: RequestStatusEvent[];
    currentStatus: RequestStatus;
}

// Minimal line icons, one per chapter — sized for a 36px gold medallion.
const STATUS_ICONS: Record<RequestStatus, React.ReactNode> = {
    submitted: (
        // folded letter
        <>
            <rect x="4" y="6.5" width="16" height="11" rx="1" />
            <path d="M4.5 7.5 L12 13 L19.5 7.5" />
        </>
    ),
    reviewed: (
        // designer's eye
        <>
            <path d="M3.5 12 C6.5 7.5 17.5 7.5 20.5 12 C17.5 16.5 6.5 16.5 3.5 12 Z" />
            <circle cx="12" cy="12" r="2.4" />
        </>
    ),
    quoted: (
        // price tag
        <>
            <path d="M12.5 4.5 H19 V11 L11.5 18.5 C11 19 10.2 19 9.7 18.5 L5 13.8 C4.5 13.3 4.5 12.5 5 12 Z" />
            <circle cx="16" cy="7.5" r="1.3" />
        </>
    ),
    confirmed: (
        // check
        <path d="M5 12.5 L10 17.5 L19 6.5" />
    ),
    in_stitching: (
        // needle with running thread
        <>
            <path d="M5 19 L17.5 6.5" />
            <circle cx="18.5" cy="5.5" r="1.6" />
            <path d="M4.5 13.5 C6.5 12 8.5 15 10.5 13.5" strokeDasharray="2 2" />
        </>
    ),
    ready: (
        // sparkle
        <>
            <path d="M12 4 L13.5 10.5 L20 12 L13.5 13.5 L12 20 L10.5 13.5 L4 12 L10.5 10.5 Z" />
        </>
    ),
    cancelled: (
        <path d="M7 7 L17 17 M17 7 L7 17" />
    ),
};

const dateFormat = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const StatusMedallion: React.FC<{ status: RequestStatus; upcoming?: boolean }> = ({ status, upcoming }) => (
    <span
        aria-hidden="true"
        className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full border shrink-0 ${
            upcoming
                ? 'bg-cream border-champagne-gold/30 text-champagne-gold/50'
                : 'bg-ivory border-champagne-gold text-champagne-gold-dark shadow-soft'
        }`}
    >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            {STATUS_ICONS[status]}
        </svg>
    </span>
);

const StoryTimeline: React.FC<StoryTimelineProps> = ({ events, currentStatus }) => {
    // "Upcoming" = canonical steps beyond the furthest chapter written.
    // A cancelled story shows no future — the closing chapter ends it.
    const reached = Math.max(
        STORY_FLOW.indexOf(currentStatus as (typeof STORY_FLOW)[number]),
        ...events.map((e) => STORY_FLOW.indexOf(e.status as (typeof STORY_FLOW)[number]))
    );
    const upcoming = currentStatus === 'cancelled' ? [] : STORY_FLOW.slice(reached + 1);

    return (
        <ol className="relative">
            {/* the gold thread */}
            <span aria-hidden="true" className="absolute left-[17px] top-4 bottom-4 w-px bg-champagne-gold/30" />

            {events.map((event) => {
                const copy = STORY_COPY[event.status];
                return (
                    <li key={event.id} className="relative flex gap-4 sm:gap-5 pb-8 last:pb-0">
                        <StatusMedallion status={event.status} />
                        <div className="pt-0.5 min-w-0">
                            <p className="label-caps text-[10px] text-warm-gray mb-1">
                                {event.createdAt ? dateFormat.format(new Date(event.createdAt)) : ''}
                            </p>
                            <h3 className="font-heading text-title text-ink">{copy.title}</h3>
                            <p className="text-body-sm text-warm-gray mt-1 max-w-prose">{copy.message}</p>
                            {event.note && (
                                <blockquote className="mt-3 border-l-2 border-champagne-gold/60 pl-3">
                                    <p className="font-accent italic text-body text-charcoal">{event.note}</p>
                                    <cite className="label-caps text-[9px] text-champagne-gold-dark not-italic block mt-1.5">
                                        — Kavya, your designer
                                    </cite>
                                </blockquote>
                            )}
                            {/* PHASE D SLOT: designer sketch-annotation summary for this
                                chapter ("Kavya added her thoughts to your design") renders
                                here when the annotations feature lands. */}
                        </div>
                    </li>
                );
            })}

            {upcoming.map((status) => (
                <li key={status} className="relative flex gap-4 sm:gap-5 pb-8 last:pb-0 opacity-60">
                    <StatusMedallion status={status} upcoming />
                    <div className="pt-1.5 min-w-0">
                        <h3 className="font-heading text-body text-warm-gray">{STORY_COPY[status].title}</h3>
                        <p className="label-caps text-[9px] text-warm-gray/70 mt-1">Upcoming</p>
                    </div>
                </li>
            ))}
        </ol>
    );
};

export default StoryTimeline;
