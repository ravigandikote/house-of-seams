import type { jsPDF } from 'jspdf';
import { rasteriseSketchContainer } from './garmentDesignPdf';

// "Pattern Sheet" PDF — a printable summary of a sewing pattern built
// entirely from its pattern_profiles row: the sketch, difficulty, size
// range, formats, fabric notes, and what the purchase includes.
//
// TEMPORARY (see the note printed on the sheet itself): this stands in
// while Shopify checkout is not live. It is a SPEC SHEET, not the pattern
// — there are no cutting lines on it and nothing here can be sewn from.
// When checkout goes live the real tiled A4/A0 files are delivered by
// Shopify's Digital Downloads app and this button should be removed.
//
// The layout function is pure (jsPDF + a pre-rasterised sketch in,
// finished doc out) so it can be exercised without a browser.

export interface PatternSheetData {
    title: string;
    /** e.g. "Blouse · Princess-seam". */
    categoryLine: string;
    difficultyLabel: string;
    sizeRange: string;
    /** e.g. ["A4 print-at-home", "A0 copy-shop"]. */
    formats: string[];
    fabricNotes?: string | null;
    whatsIncluded: string[];
    /** Live price if Shopify has the product, else null ("coming soon"). */
    priceLine?: string | null;
    /** PNG data URL of the flattened sketch. */
    sketchPng: string;
    /** Sketch aspect as height ÷ width. */
    sketchAspect: number;
}

// Brand palette (matches tailwind.config.ts)
const INK: [number, number, number] = [45, 45, 45];
const MUTED: [number, number, number] = [107, 107, 107];
const ROSE_DEEP: [number, number, number] = [184, 122, 136];
const GOLD_DARK: [number, number, number] = [143, 109, 42];
const LINE: [number, number, number] = [223, 214, 208];

const PAGE_W = 210;
const MARGIN = 16;
const CW = PAGE_W - 2 * MARGIN;

function sectionHeading(doc: jsPDF, label: string, y: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...ROSE_DEEP);
    doc.setCharSpace(1);
    doc.text(label, MARGIN, y);
    doc.setCharSpace(0);
    return y + 5.5;
}

export function buildPatternSheetPdf(doc: jsPDF, data: PatternSheetData, generatedOn: string): jsPDF {
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
    doc.text(data.title, PAGE_W / 2, 27, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${data.categoryLine}  ·  ${generatedOn}`, PAGE_W / 2, 33, { align: 'center' });

    // ---- Sketch on a cream card ----
    const maxW = 88;
    const maxH = 80;
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
    // 'FAST' compression matters here: the sketch is a flat cream field with
    // a line drawing, which deflates to a fraction of the raw canvas bytes.
    doc.addImage(data.sketchPng, 'PNG', imgX, imgY, imgW, imgH, undefined, 'FAST');

    // ---- At a glance: three labelled facts across the page ----
    let y = imgY + imgH + 14;
    y = sectionHeading(doc, 'AT A GLANCE', y);
    const facts: [string, string][] = [
        ['Difficulty', data.difficultyLabel],
        ['Sizes', data.sizeRange],
        ['Formats', data.formats.length ? data.formats.join(' · ') : '—'],
    ];
    const colW = CW / 3;
    facts.forEach(([label, value], i) => {
        const x = MARGIN + i * colW;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(label.toUpperCase(), x, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...INK);
        doc.text(doc.splitTextToSize(value, colW - 4), x, y + 5);
    });
    y += 16;

    // ---- What's included ----
    if (data.whatsIncluded.length) {
        y = sectionHeading(doc, "WHAT'S INCLUDED", y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...INK);
        for (const item of data.whatsIncluded) {
            const lines: string[] = doc.splitTextToSize(item, CW - 6);
            doc.setTextColor(...GOLD_DARK);
            doc.text('·', MARGIN, y);
            doc.setTextColor(...INK);
            doc.text(lines, MARGIN + 4, y);
            y += lines.length * 5;
        }
        y += 5;
    }

    // ---- Fabric notes ----
    if (data.fabricNotes && data.fabricNotes.trim()) {
        y = sectionHeading(doc, 'FABRIC', y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...INK);
        const lines: string[] = doc.splitTextToSize(data.fabricNotes.trim(), CW);
        doc.text(lines, MARGIN, y);
        y += lines.length * 5 + 5;
    }

    // ---- Price, when Shopify has it ----
    if (data.priceLine) {
        y = sectionHeading(doc, 'PRICE', y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...INK);
        doc.text(data.priceLine, MARGIN, y);
        y += 8;
    }

    // ---- The honest footer: this is not the pattern ----
    doc.setDrawColor(...LINE);
    doc.line(MARGIN, 268, PAGE_W - MARGIN, 268);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const disclaimer: string[] = doc.splitTextToSize(
        'This is a pattern information sheet, not the sewing pattern itself — it carries no cutting lines ' +
            'and cannot be sewn from. The full tiled pattern files are delivered when you purchase. ' +
            'houseofseams.com',
        CW,
    );
    doc.text(disclaimer, PAGE_W / 2, 274, { align: 'center' });
    return doc;
}

/** Generates and downloads the pattern sheet. jsPDF is loaded on demand. */
export async function downloadPatternSheetPdf(
    data: Omit<PatternSheetData, 'sketchPng' | 'sketchAspect'>,
    container: HTMLElement,
): Promise<void> {
    const [{ jsPDF }, sketch] = await Promise.all([
        import('jspdf'),
        rasteriseSketchContainer(container),
    ]);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const generatedOn = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    buildPatternSheetPdf(
        doc,
        { ...data, sketchPng: sketch.png, sketchAspect: sketch.aspect },
        generatedOn,
    );
    const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    doc.save(`house-of-seams-pattern-${slug || 'sheet'}.pdf`);
}
