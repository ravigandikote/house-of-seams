import type { jsPDF } from 'jspdf';
import { svgElementToPngDataUrl } from './blouseDesignPdf';

// Category-generic "Design Sheet" PDF — every journey beyond the blouse
// (which keeps its dedicated front+back builder) downloads through this.
// The layout function is pure (jsPDF + a pre-rasterised sketch in,
// finished doc out); the browser-only helper below flattens a preview
// container — including COMPOSED ensembles of several positioned SVGs
// (choli over skirt, kameez over bottoms, dupatta drape) — into one PNG
// by replaying each SVG at its DOM position, in z-order.

export interface GarmentPdfRow {
    /** Group heading; consecutive rows with the same group share one. */
    group: string;
    label: string;
    /** Pre-formatted display value (e.g. 34.5″ or 8). */
    value: string;
}

export interface GarmentPdfData {
    /** e.g. "Kurti / Kameez", "Lehenga Ensemble", "Salwar Suit". */
    categoryLabel: string;
    designName: string;
    /** Style attributes joined for display. */
    styleLine: string;
    /** Optional ensemble note ("With matching dupatta"). */
    ensembleLine?: string | null;
    rows: GarmentPdfRow[];
    notes?: string | null;
    /** PNG data URL of the flattened sketch. */
    sketchPng: string;
    /** Sketch aspect as height ÷ width. */
    sketchAspect: number;
}

// Brand palette (matches tailwind.config.ts)
const INK: [number, number, number] = [45, 45, 45];
const MUTED: [number, number, number] = [107, 107, 107];
const ROSE_DEEP: [number, number, number] = [184, 122, 136];
const SAGE: [number, number, number] = [143, 168, 141];
const LINE: [number, number, number] = [223, 214, 208];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CW = PAGE_W - 2 * MARGIN;

export function buildGarmentDesignPdf(doc: jsPDF, data: GarmentPdfData, generatedOn: string): jsPDF {
    // ---- Header ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(1.6);
    doc.text('HOUSE OF SEAMS', PAGE_W / 2, 18, { align: 'center' });
    doc.setCharSpace(0);
    doc.setFont('times', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(...INK);
    doc.text(`Custom ${data.categoryLabel} Design Sheet`, PAGE_W / 2, 27, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${data.designName}  ·  ${generatedOn}`, PAGE_W / 2, 33, { align: 'center' });

    // ---- Sketch (fit within 96×86mm, centred, on a cream card) ----
    const maxW = 96;
    const maxH = 86;
    let imgW = maxW;
    let imgH = imgW * data.sketchAspect;
    if (imgH > maxH) {
        imgH = maxH;
        imgW = imgH / data.sketchAspect;
    }
    const imgX = (PAGE_W - imgW) / 2;
    const imgY = 39;
    doc.setDrawColor(...LINE);
    doc.setFillColor(253, 248, 245);
    doc.roundedRect(imgX - 3, imgY - 3, imgW + 6, imgH + 6, 2, 2, 'FD');
    doc.addImage(data.sketchPng, 'PNG', imgX, imgY, imgW, imgH);

    // ---- Design line ----
    let y = imgY + imgH + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...ROSE_DEEP);
    doc.setCharSpace(1);
    doc.text('DESIGN', MARGIN, y);
    doc.setCharSpace(0);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(data.styleLine, MARGIN, y);
    if (data.ensembleLine) {
        y += 5;
        doc.setTextColor(...MUTED);
        doc.setFontSize(9);
        doc.text(data.ensembleLine, MARGIN, y);
    }

    // ---- Measurements: two columns, grouped, split by row count ----
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...ROSE_DEEP);
    doc.setCharSpace(1);
    doc.text('MEASUREMENTS', MARGIN, y);
    doc.setCharSpace(0);
    y += 2;

    const colW = (CW - 10) / 2;
    const col2X = MARGIN + colW + 10;
    const rowH = 5.2;
    const groupHeadH = 7.2;
    const half = Math.ceil(data.rows.length / 2);
    // Keep groups intact where possible: split at the nearest group edge.
    let splitAt = half;
    for (let i = half; i < data.rows.length; i++) {
        if (data.rows[i].group !== data.rows[i - 1].group) {
            splitAt = i;
            break;
        }
    }
    const columns = [data.rows.slice(0, splitAt), data.rows.slice(splitAt)];

    function drawColumn(rows: GarmentPdfRow[], x: number, startY: number): number {
        let gy = startY;
        let currentGroup = '';
        for (const row of rows) {
            if (row.group !== currentGroup) {
                currentGroup = row.group;
                gy += groupHeadH;
                doc.setFont('times', 'bold');
                doc.setFontSize(10.5);
                doc.setTextColor(...INK);
                doc.text(row.group, x, gy);
                doc.setDrawColor(...ROSE_DEEP);
                doc.setLineWidth(0.5);
                doc.line(x, gy + 1.2, x + colW, gy + 1.2);
                doc.setLineWidth(0.2);
                gy += 1.6;
            }
            gy += rowH;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...MUTED);
            doc.text(row.label, x, gy);
            doc.setTextColor(...INK);
            doc.setFont('helvetica', 'bold');
            doc.text(row.value, x + colW, gy, { align: 'right' });
            doc.setDrawColor(...LINE);
            doc.line(x, gy + 1.4, x + colW, gy + 1.4);
        }
        return gy;
    }

    const leftEnd = drawColumn(columns[0], MARGIN, y);
    const rightEnd = drawColumn(columns[1], col2X, y);
    y = Math.max(leftEnd, rightEnd) + 9;

    // ---- Notes ----
    if (data.notes?.trim() && y < PAGE_H - 30) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...ROSE_DEEP);
        doc.setCharSpace(1);
        doc.text('NOTES', MARGIN, y);
        doc.setCharSpace(0);
        y += 5;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        const lines = doc.splitTextToSize(data.notes.trim(), CW) as string[];
        doc.text(lines.slice(0, 3), MARGIN, y);
    }

    // ---- Footer ----
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...SAGE);
    doc.text(
        'Illustrative preview - not to scale. Final fit is confirmed by the boutique at your fitting.',
        PAGE_W / 2,
        285,
        { align: 'center' }
    );
    doc.setTextColor(...MUTED);
    doc.text(`House of Seams  ·  Design Your ${data.categoryLabel}`, PAGE_W / 2, 290, { align: 'center' });

    return doc;
}

// ------------------------------------------------------------------
// Browser-only helpers
// ------------------------------------------------------------------

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Could not rasterise the preview'));
        image.src = src;
    });
}

/**
 * Flatten a preview container (single sketch OR a composed ensemble of
 * positioned SVGs) into one PNG. Each SVG is rasterised and replayed at
 * its DOM position; inline z-indexes (ComposedPreview slots, the dupatta
 * drape) decide paint order.
 */
export async function rasteriseSketchContainer(
    container: HTMLElement,
    scale = 3
): Promise<{ png: string; aspect: number }> {
    const rect = container.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) throw new Error('The preview is not visible');

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available');
    ctx.fillStyle = '#FDF8F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const items = Array.from(container.querySelectorAll('svg'))
        .map((svg) => {
            let z = parseInt(svg.style.zIndex || '', 10);
            if (Number.isNaN(z)) {
                z = 0;
                let el: HTMLElement | null = svg.parentElement;
                while (el && el !== container) {
                    const zi = parseInt(el.style.zIndex || '', 10);
                    if (!Number.isNaN(zi)) {
                        z = zi;
                        break;
                    }
                    el = el.parentElement;
                }
            }
            return { svg, z };
        })
        .sort((a, b) => a.z - b.z);

    for (const { svg } of items) {
        const r = svg.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const png = await svgElementToPngDataUrl(svg, scale);
        const img = await loadImage(png);
        ctx.drawImage(
            img,
            (r.left - rect.left) * scale,
            (r.top - rect.top) * scale,
            r.width * scale,
            r.height * scale
        );
    }

    return { png: canvas.toDataURL('image/png'), aspect: rect.height / rect.width };
}

/** Generates and downloads the design sheet. jsPDF is loaded on demand. */
export async function downloadGarmentDesignPdf(
    data: Omit<GarmentPdfData, 'sketchPng' | 'sketchAspect'>,
    container: HTMLElement
): Promise<void> {
    const [{ jsPDF }, sketch] = await Promise.all([
        import('jspdf'),
        rasteriseSketchContainer(container),
    ]);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const generatedOn = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    buildGarmentDesignPdf(
        doc,
        { ...data, sketchPng: sketch.png, sketchAspect: sketch.aspect },
        generatedOn
    );
    const slug = data.designName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    doc.save(`house-of-seams-${slug || 'design'}.pdf`);
}
