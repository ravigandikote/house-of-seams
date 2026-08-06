import type { jsPDF } from 'jspdf';
import { BlouseDesignAttributes } from '../types/blouseDesign';
import {
    Measurements,
    MEASUREMENT_GROUPS,
    MEASUREMENT_LABELS,
} from '../types/measurements';
import { BlousePreferences } from '../types/customDesignRequest';

// Builds the "Custom Blouse Design Sheet" PDF. The layout function is
// pure (jsPDF instance + pre-rasterised preview images in, finished doc
// out) so it can be exercised headlessly in tests; the browser-only
// helpers below turn the live preview SVGs into those images.

export interface BlousePdfData {
    designName: string;
    design: BlouseDesignAttributes;
    color: string;
    measurements: Measurements;
    preferences: BlousePreferences;
    customerAge?: number | null;
    notes?: string | null;
    /** PNG data URLs of the front and back preview renders (5:4 aspect). */
    frontPng: string;
    backPng: string;
}

// Brand palette (matches tailwind.config.ts)
const INK: [number, number, number] = [45, 45, 45];
const MUTED: [number, number, number] = [107, 107, 107];
const ROSE_DEEP: [number, number, number] = [184, 122, 136];
const SAGE: [number, number, number] = [143, 168, 141];
const LINE: [number, number, number] = [223, 214, 208];

const PAGE_W = 210;
const MARGIN = 16;
const CW = PAGE_W - 2 * MARGIN;

function labelize(value: string): string {
    return value
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export function buildBlouseDesignPdf(doc: jsPDF, data: BlousePdfData, generatedOn: string): jsPDF {
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
    doc.text('Custom Blouse Design Sheet', PAGE_W / 2, 27, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${data.designName}  ·  ${generatedOn}`, PAGE_W / 2, 33, { align: 'center' });

    // ---- Preview images (5:4 aspect) ----
    const imgW = 82;
    const imgH = imgW * 0.8;
    const gap = CW - imgW * 2; // between the two images
    const imgY = 39;
    doc.setDrawColor(...LINE);
    doc.setFillColor(253, 248, 245); // cream card behind each render
    doc.roundedRect(MARGIN, imgY, imgW, imgH + 10, 2, 2, 'FD');
    doc.roundedRect(MARGIN + imgW + gap, imgY, imgW, imgH + 10, 2, 2, 'FD');
    doc.addImage(data.frontPng, 'PNG', MARGIN + 1, imgY + 1, imgW - 2, imgH - 2);
    doc.addImage(data.backPng, 'PNG', MARGIN + imgW + gap + 1, imgY + 1, imgW - 2, imgH - 2);
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text('Front', MARGIN + imgW / 2, imgY + imgH + 6, { align: 'center' });
    doc.text('Back', MARGIN + imgW + gap + imgW / 2, imgY + imgH + 6, { align: 'center' });

    // ---- Design details ----
    let y = imgY + imgH + 18;
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
    const d = data.design;
    doc.text(
        `${labelize(d.neckStyle)} neck  ·  ${labelize(d.backStyle)} back  ·  ${labelize(d.sleeveStyle)} sleeves  ·  ` +
        `${labelize(d.closure)} closure  ·  ${labelize(d.embellishment)}`,
        MARGIN,
        y
    );
    // colour swatch
    const swatchX = MARGIN + 2;
    y += 6;
    const rgb = hexToRgb(data.color);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.setDrawColor(...MUTED);
    doc.circle(swatchX, y - 1.2, 2, 'FD');
    doc.setTextColor(...MUTED);
    doc.setFontSize(9);
    doc.text(
        `Colour ${data.color}${data.customerAge ? `  ·  Age ${data.customerAge}` : ''}`,
        swatchX + 5,
        y
    );

    // ---- Measurements in two columns, grouped ----
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...ROSE_DEEP);
    doc.setCharSpace(1);
    doc.text('MEASUREMENTS (INCHES)', MARGIN, y);
    doc.setCharSpace(0);
    y += 2;

    const colW = (CW - 10) / 2;
    const col2X = MARGIN + colW + 10;
    const rowH = 5.4;
    const groupHeadH = 7.5;
    // Split groups across two columns: first two groups (12 fields) left,
    // remaining three (11 fields) right.
    const leftGroups = MEASUREMENT_GROUPS.slice(0, 2);
    const rightGroups = MEASUREMENT_GROUPS.slice(2);

    function drawGroups(groups: typeof MEASUREMENT_GROUPS, x: number, startY: number): number {
        let gy = startY;
        for (const group of groups) {
            gy += groupHeadH;
            doc.setFont('times', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(...INK);
            doc.text(group.label, x, gy);
            doc.setDrawColor(...ROSE_DEEP);
            doc.setLineWidth(0.5);
            doc.line(x, gy + 1.2, x + colW, gy + 1.2);
            doc.setLineWidth(0.2);
            gy += 1.6;
            for (const field of group.fields) {
                gy += rowH;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...MUTED);
                doc.text(MEASUREMENT_LABELS[field], x, gy);
                doc.setTextColor(...INK);
                doc.setFont('helvetica', 'bold');
                doc.text(`${data.measurements[field]}"`, x + colW, gy, { align: 'right' });
                doc.setDrawColor(...LINE);
                doc.line(x, gy + 1.4, x + colW, gy + 1.4);
            }
        }
        return gy;
    }

    const leftEnd = drawGroups(leftGroups, MARGIN, y);
    const rightEnd = drawGroups(rightGroups, col2X, y);
    y = Math.max(leftEnd, rightEnd) + 10;

    // ---- Additional details ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...ROSE_DEEP);
    doc.setCharSpace(1);
    doc.text('ADDITIONAL DETAILS', MARGIN, y);
    doc.setCharSpace(0);
    y += 5;
    const p = data.preferences;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(
        `${labelize(p.blouseOpening)} opening  ·  ${labelize(p.fitPreference)} fit  ·  ` +
        `${labelize(p.seamAllowance)} seam allowance  ·  Cup padding: ${p.cupPadding ? 'Yes' : 'No'}` +
        `${p.braSize ? `  ·  Inner-wear ${p.braSize}` : ''}`,
        MARGIN,
        y
    );

    if (data.notes?.trim()) {
        y += 7;
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
        doc.text(lines.slice(0, 4), MARGIN, y);
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
    doc.text('House of Seams  ·  Design Your Blouse', PAGE_W / 2, 290, { align: 'center' });

    return doc;
}

function hexToRgb(hex: string): [number, number, number] {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return [214, 166, 177]; // dusty rose fallback
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ------------------------------------------------------------------
// Browser-only helpers
// ------------------------------------------------------------------

/** Rasterise a preview <svg> element to a PNG data URL on a cream card. */
export async function svgElementToPngDataUrl(svg: SVGSVGElement, scale = 3): Promise<string> {
    const viewBox = svg.getAttribute('viewBox') ?? '0 0 300 240';
    const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
    let markup = svg.outerHTML;
    if (!markup.includes('xmlns=')) {
        markup = markup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    }
    // Force explicit raster dimensions WITHOUT duplicating attributes — a
    // second width/height on the root tag is invalid XML and the image
    // silently fails to load ("Could not rasterise the preview").
    markup = markup
        .replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1')
        .replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
        .replace('<svg ', `<svg width="${vw}" height="${vh}" `);

    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Could not rasterise the preview'));
            image.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = vw * scale;
        canvas.height = vh * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas is not available');
        ctx.fillStyle = '#FDF8F5'; // cream, matching the on-site preview card
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
    } finally {
        URL.revokeObjectURL(url);
    }
}

/** Generates and downloads the design sheet. jsPDF is loaded on demand. */
export async function downloadBlouseDesignPdf(
    data: Omit<BlousePdfData, 'frontPng' | 'backPng'>,
    frontSvg: SVGSVGElement,
    backSvg: SVGSVGElement
): Promise<void> {
    const [{ jsPDF }, frontPng, backPng] = await Promise.all([
        import('jspdf'),
        svgElementToPngDataUrl(frontSvg),
        svgElementToPngDataUrl(backSvg),
    ]);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const generatedOn = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    buildBlouseDesignPdf(doc, { ...data, frontPng, backPng }, generatedOn);
    const slug = data.designName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    doc.save(`house-of-seams-blouse-${slug || 'design'}.pdf`);
}
