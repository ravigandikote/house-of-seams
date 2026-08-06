import { RequestStatus } from '@/types/customDesignRequest';

// The Design Story page speaks in the atelier's voice. Every status has a
// chapter title + default message; Kavya's per-event note (when present)
// is shown alongside, never instead — the defaults keep the journal warm
// even when she writes nothing.

export interface StoryChapterCopy {
    title: string;
    message: string;
}

export const STORY_COPY: Record<RequestStatus, StoryChapterCopy> = {
    submitted: {
        title: 'Your sketch arrives at the atelier',
        message:
            'Your design and measurements have been received exactly as you set them, and a page has been opened for you in the atelier journal.',
    },
    reviewed: {
        title: "Under the designer's eye",
        message:
            'Kavya has studied your sketch and measurements — the neckline, the sleeves, the fall of the fabric — and is shaping her recommendations.',
    },
    quoted: {
        title: 'Your quote is ready',
        message:
            'A personal quote has been prepared for your design, along with fabric thoughts. Expect a call or message from the boutique.',
    },
    confirmed: {
        title: 'The order is confirmed',
        message:
            'It is decided — your garment will be made. Fabric, lining, and thread are being chosen for you.',
    },
    in_stitching: {
        title: 'On the cutting table',
        message:
            'Your garment is in the making — cut to your measurements, stitched by hand where it matters, tried against the sketch at every step.',
    },
    ready: {
        title: 'Ready for its first wearing',
        message:
            'Finished, pressed, and waiting for you. The boutique will arrange delivery or a pickup — with a final fitting if you wish.',
    },
    cancelled: {
        title: 'This chapter closes',
        message:
            'This request has been closed. The sketch remains yours — the atelier will be here whenever you wish to begin again.',
    },
};

// The canonical happy path, in order. Used to show faint "upcoming"
// chapters after the furthest point the request has reached.
export const STORY_FLOW = [
    'submitted',
    'reviewed',
    'quoted',
    'confirmed',
    'in_stitching',
    'ready',
] as const satisfies readonly RequestStatus[];
