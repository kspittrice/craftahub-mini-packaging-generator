import { jsPDF } from 'jspdf';
import svg2pdf from 'svg2pdf.js';
import { PageSize, ScaleMode, TemplateDocument } from './types';

export const PAGE_SIZES_MM: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
};

export function scaleToMini(realMm: number, scale: ScaleMode): number {
  return scale === '1:6' ? realMm / 6 : realMm / 12;
}

export function mmToPx300(mm: number): number {
  return Math.round((mm / 25.4) * 300);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function isVectorType(type: string) {
  return type === 'svg';
}

export function toDataUrl(text: string, mime = 'image/svg+xml;charset=utf-8') {
  return `data:${mime},${encodeURIComponent(text)}`;
}

export function validateNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return false;
  if (value < min) return false;
  if (value > max) return false;
  return true;
}

export function pageWarning(doc: TemplateDocument, pageSize: PageSize) {
  const page = PAGE_SIZES_MM[pageSize];
  if (doc.boundsMm.width > page.width || doc.boundsMm.height > page.height) {
    return `The dieline exceeds ${pageSize}. Export will be cropped to page bounds.`;
  }
  return '';
}

export function serializeSvg(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return new XMLSerializer().serializeToString(clone);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSvg(svgEl: SVGSVGElement, filename: string) {
  const svgString = serializeSvg(svgEl);
  downloadBlob(new Blob([svgString], { type: 'image/svg+xml' }), filename);
}

export async function exportRaster(svgEl: SVGSVGElement, filename: string, format: 'png' | 'jpg') {
  const widthMm = Number(svgEl.getAttribute('data-export-width-mm') || '210');
  const heightMm = Number(svgEl.getAttribute('data-export-height-mm') || '297');
  const width = mmToPx300(widthMm);
  const height = mmToPx300(heightMm);
  const svgString = serializeSvg(svgEl);
  const image = new Image();
  image.src = toDataUrl(svgString);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Unable to rasterize SVG.'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = format === 'jpg' ? 0.98 : undefined;

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error(`Unable to export ${format.toUpperCase()}.`);
  downloadBlob(blob, filename);
}

export async function exportPdf(svgEl: SVGSVGElement, filename: string) {
  const widthMm = Number(svgEl.getAttribute('data-export-width-mm') || '210');
  const heightMm = Number(svgEl.getAttribute('data-export-height-mm') || '297');
  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  });
  await svg2pdf(svgEl, pdf, { xOffset: 0, yOffset: 0, scale: 1 });
  pdf.save(filename);
}

export function createId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
