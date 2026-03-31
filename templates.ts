import { createId, scaleToMini } from './lib';
import { ScaleMode, TemplateDefinition, TemplateDocument, TemplateParameter, TemplatePart } from './types';

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: 'bag',
    title: 'Bag',
    description: 'Classic folded shopping bag.',
    parameters: [
      { key: 'length', label: 'Length', value: 120, min: 20, max: 600 },
      { key: 'width', label: 'Width', value: 50, min: 10, max: 300 },
      { key: 'height', label: 'Height', value: 160, min: 20, max: 800 },
      { key: 'fold', label: 'Fold', value: 18, min: 2, max: 120 },
      { key: 'glueFlap', label: 'Glue Flap Size', value: 8, min: 2, max: 50 },
    ],
  },
  {
    id: 'boxWithLid',
    title: 'Box with Lid',
    description: 'Two-piece rectangular box with lid.',
    parameters: [
      { key: 'length', label: 'Length', value: 120, min: 20, max: 600 },
      { key: 'width', label: 'Width', value: 80, min: 20, max: 400 },
      { key: 'height', label: 'Height', value: 40, min: 8, max: 200 },
      { key: 'lidHeight', label: 'Lid Height', value: 20, min: 4, max: 100 },
      { key: 'clearance', label: 'Clearance (%)', value: 2, min: 0, max: 10 },
      { key: 'glueFlap', label: 'Glue Flap Size', value: 8, min: 2, max: 40 },
    ],
  },
  {
    id: 'cardBox',
    title: 'Card Box',
    description: 'Folded carton with tuck and thumb hole.',
    parameters: [
      { key: 'length', label: 'Length', value: 100, min: 20, max: 600 },
      { key: 'width', label: 'Width', value: 30, min: 8, max: 300 },
      { key: 'height', label: 'Height', value: 140, min: 20, max: 600 },
      { key: 'thumbHole', label: 'Thumb Hole Diameter', value: 10, min: 0, max: 60 },
      { key: 'tuckFlap', label: 'Tuck Flap Size', value: 20, min: 4, max: 80 },
      { key: 'glueFlap', label: 'Glue Flap Size', value: 8, min: 2, max: 40 },
    ],
  },
  {
    id: 'coneTruncated',
    title: 'Cone (Truncated)',
    description: 'Frustum wrap with glue flap.',
    parameters: [
      { key: 'topDiameter', label: 'Top Diameter', value: 50, min: 10, max: 300 },
      { key: 'bottomDiameter', label: 'Bottom Diameter', value: 80, min: 12, max: 400 },
      { key: 'height', label: 'Height', value: 120, min: 20, max: 500 },
      { key: 'glueFlap', label: 'Glue Flap Size', value: 8, min: 2, max: 50 },
    ],
  },
  {
    id: 'counterDisplay',
    title: 'Counter Display',
    description: 'Counter display with fold-down front.',
    parameters: [
      { key: 'length', label: 'Length', value: 120, min: 20, max: 600 },
      { key: 'width', label: 'Width', value: 80, min: 20, max: 400 },
      { key: 'height', label: 'Height', value: 100, min: 20, max: 400 },
      { key: 'front', label: 'Front', value: 35, min: 5, max: 200 },
      { key: 'flapHeight', label: 'Flap Height', value: 18, min: 4, max: 120 },
    ],
  },
  {
    id: 'ellipticalBox',
    title: 'Elliptical Box',
    description: 'Elliptical body with base and lid caps.',
    parameters: [
      { key: 'length', label: 'Length', value: 110, min: 20, max: 600 },
      { key: 'width', label: 'Width', value: 70, min: 20, max: 400 },
      { key: 'height', label: 'Height', value: 50, min: 8, max: 200 },
      { key: 'lidHeight', label: 'Lid Height', value: 18, min: 4, max: 80 },
      { key: 'extraOffset', label: 'Extra Offset for Caps', value: 2, min: 0, max: 20 },
    ],
  },
  {
    id: 'envelope',
    title: 'Envelope',
    description: 'Simple envelope layout.',
    parameters: [
      { key: 'width', label: 'Width', value: 110, min: 20, max: 500 },
      { key: 'height', label: 'Height', value: 80, min: 20, max: 400 },
      { key: 'overlap', label: 'Overlap', value: 12, min: 2, max: 80 },
      { key: 'radius', label: 'Rounded Corners Radius', value: 2, min: 0, max: 20 },
    ],
  },
  {
    id: 'matchBox',
    title: 'Match Box',
    description: 'Sleeve and inner drawer.',
    parameters: [
      { key: 'length', label: 'Length', value: 80, min: 20, max: 500 },
      { key: 'width', label: 'Width', value: 40, min: 10, max: 200 },
      { key: 'height', label: 'Height', value: 20, min: 4, max: 100 },
      { key: 'thickness', label: 'Material Thickness', value: 0.5, min: 0.1, max: 4, step: 0.1 },
      { key: 'clearance', label: 'Clearance', value: 1, min: 0, max: 10, step: 0.1 },
    ],
  },
  {
    id: 'milkCarton',
    title: 'Milk Carton',
    description: 'Gable-top carton.',
    parameters: [
      { key: 'length', label: 'Length', value: 60, min: 12, max: 300 },
      { key: 'width', label: 'Width', value: 60, min: 12, max: 300 },
      { key: 'height', label: 'Height', value: 120, min: 30, max: 500 },
      { key: 'roofHeight', label: 'Roof Height', value: 20, min: 6, max: 120 },
      { key: 'topFlap', label: 'Top Flap', value: 14, min: 4, max: 80 },
    ],
  },
  {
    id: 'nestableTray',
    title: 'Nestable Tray',
    description: 'Tray with angled walls.',
    parameters: [
      { key: 'length', label: 'Length', value: 120, min: 20, max: 600 },
      { key: 'width', label: 'Width', value: 80, min: 20, max: 400 },
      { key: 'height', label: 'Height', value: 24, min: 4, max: 120 },
      { key: 'draftAngle', label: 'Draft Angle', value: 12, min: 0, max: 45 },
      { key: 'glueFlap', label: 'Glue Flap Size', value: 8, min: 2, max: 40 },
    ],
  },
  {
    id: 'passepartout',
    title: 'Passepartout',
    description: 'Frame with backing panel.',
    parameters: [
      { key: 'pictureLength', label: 'Picture Length', value: 100, min: 20, max: 400 },
      { key: 'pictureWidth', label: 'Picture Width', value: 70, min: 20, max: 400 },
      { key: 'height', label: 'Height', value: 4, min: 1, max: 30 },
      { key: 'frameWidth', label: 'Frame Width', value: 12, min: 2, max: 100 },
      { key: 'frameDepth', label: 'Frame Depth', value: 8, min: 2, max: 80 },
    ],
  },
  {
    id: 'pillowPack',
    title: 'Pillow Pack',
    description: 'Curved pillow pack.',
    parameters: [
      { key: 'length', label: 'Length', value: 120, min: 20, max: 500 },
      { key: 'width', label: 'Width', value: 60, min: 10, max: 300 },
      { key: 'height', label: 'Height', value: 24, min: 4, max: 120 },
      { key: 'glueFlap', label: 'Glue Flap Size', value: 8, min: 2, max: 40 },
      { key: 'thumbHole', label: 'Thumb Hole Diameter', value: 8, min: 0, max: 50 },
    ],
  },
  {
    id: 'polygonalBoxWithLid',
    title: 'Polygonal Box with Lid',
    description: 'Polygonal base and lid.',
    parameters: [
      { key: 'innerDiameter', label: 'Inner Diameter', value: 60, min: 10, max: 300 },
      { key: 'sides', label: 'Number of Sides', value: 6, min: 3, max: 12, step: 1 },
      { key: 'height', label: 'Height', value: 40, min: 8, max: 200 },
      { key: 'lidHeight', label: 'Lid Height', value: 18, min: 4, max: 100 },
      { key: 'clearance', label: 'Clearance (%)', value: 2, min: 0, max: 10 },
    ],
  },
  {
    id: 'roundBox',
    title: 'Round Box',
    description: 'Round base and lid.',
    parameters: [
      { key: 'diameter', label: 'Diameter', value: 70, min: 10, max: 300 },
      { key: 'height', label: 'Height', value: 40, min: 8, max: 200 },
      { key: 'lidHeight', label: 'Lid Height', value: 18, min: 4, max: 100 },
      { key: 'extraOffset', label: 'Extra Offset for Caps', value: 2, min: 0, max: 20 },
    ],
  },
  {
    id: 'shallowBox',
    title: 'Shallow Box',
    description: 'Shallow carton with dust flaps and tuck.',
    parameters: [
      { key: 'length', label: 'Length', value: 110, min: 20, max: 500 },
      { key: 'width', label: 'Width', value: 80, min: 20, max: 400 },
      { key: 'height', label: 'Height', value: 20, min: 4, max: 120 },
      { key: 'dustFlap', label: 'Dust Flap Size', value: 18, min: 2, max: 80 },
      { key: 'tuckFlap', label: 'Tuck Flap Size', value: 20, min: 4, max: 80 },
      { key: 'glueFlap', label: 'Glue Flap Size', value: 8, min: 2, max: 40 },
    ],
  },
];

function getParam(parameters: TemplateParameter[], key: string, scale: ScaleMode): number {
  const p = parameters.find((item) => item.key === key);
  if (!p) return 0;
  return key === 'clearance' || key === 'sides' || key === 'draftAngle' ? p.value : scaleToMini(p.value, scale);
}

function rectPart(label: string, kind: TemplatePart['kind'], x: number, y: number, width: number, height: number, fillColor = '#ffffff'): TemplatePart {
  return {
    id: createId('part'),
    label,
    kind,
    x,
    y,
    width,
    height,
    fillColor,
    acceptsArtwork: kind !== 'glue',
    acceptsFill: kind !== 'glue',
    artworkPlacements: [],
  };
}

function ellipsePart(label: string, kind: TemplatePart['kind'], x: number, y: number, width: number, height: number, fillColor = '#ffffff'): TemplatePart {
  return {
    id: createId('part'),
    label,
    kind,
    x,
    y,
    width,
    height,
    shape: 'ellipse',
    fillColor,
    acceptsArtwork: kind !== 'glue',
    acceptsFill: kind !== 'glue',
    artworkPlacements: [],
  };
}

function addRectCut(cutLines: string[], x: number, y: number, width: number, height: number) {
  cutLines.push(`M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`);
}

function addFoldVertical(foldLines: string[], x: number, y1: number, y2: number) {
  foldLines.push(`M ${x} ${y1} V ${y2}`);
}

function addFoldHorizontal(foldLines: string[], y: number, x1: number, x2: number) {
  foldLines.push(`M ${x1} ${y} H ${x2}`);
}

export function buildDocument(templateId: string, parameters: TemplateParameter[], scale: ScaleMode): TemplateDocument {
  const warnings: string[] = [];
  const parts: TemplatePart[] = [];
  const cutLines: string[] = [];
  const foldLines: string[] = [];
  const margin = 10;

  const glueFlap = getParam(parameters, 'glueFlap', scale);
  const height = getParam(parameters, 'height', scale);
  if (glueFlap && height && glueFlap >= height * 0.5) {
    warnings.push('Glue flap size must be less than 50% of the corresponding wall height.');
  }

  const pushRect = (label: string, kind: TemplatePart['kind'], x: number, y: number, width: number, h: number, fill = '#ffffff') => {
    parts.push(rectPart(label, kind, x, y, width, h, fill));
    addRectCut(cutLines, x, y, width, h);
  };

  switch (templateId) {
    case 'bag': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const F = getParam(parameters, 'fold', scale);
      const G = getParam(parameters, 'glueFlap', scale);
      const x = margin + G;
      const y = margin + F;
      pushRect('Glue Flap', 'glue', margin, y, G, H);
      pushRect('Front', 'panel', x, y, L, H);
      pushRect('Side Left', 'side', x + L, y, W, H);
      pushRect('Back', 'panel', x + L + W, y, L, H);
      pushRect('Side Right', 'side', x + 2 * L + W, y, W, H);
      pushRect('Bottom Fold Front', 'flap', x, y + H, L, F);
      pushRect('Bottom Fold Left', 'flap', x + L, y + H, W, F);
      pushRect('Bottom Fold Back', 'flap', x + L + W, y + H, L, F);
      pushRect('Bottom Fold Right', 'flap', x + 2 * L + W, y + H, W, F);
      for (const vx of [margin + G, x + L, x + L + W, x + 2 * L + W]) addFoldVertical(foldLines, vx, y, y + H);
      addFoldHorizontal(foldLines, y + H, x, x + 2 * L + 2 * W);
      return { templateId, title: 'Bag', parts, cutLines, foldLines, boundsMm: { width: x + 2 * L + 2 * W + margin, height: y + H + F + margin }, warnings };
    }
    case 'boxWithLid': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const lidH = getParam(parameters, 'lidHeight', scale);
      const clearance = getParam(parameters, 'clearance', scale) / 100;
      const G = getParam(parameters, 'glueFlap', scale);
      const baseX = margin;
      const baseY = margin;
      pushRect('Base Bottom', 'base', baseX + H, baseY + H, L, W);
      pushRect('Base Front', 'side', baseX + H, baseY, L, H);
      pushRect('Base Back', 'side', baseX + H, baseY + H + W, L, H);
      pushRect('Base Left', 'side', baseX, baseY + H, H, W);
      pushRect('Base Right', 'side', baseX + H + L, baseY + H, H, W);
      addFoldHorizontal(foldLines, baseY + H, baseX, baseX + H + L + H);
      addFoldHorizontal(foldLines, baseY + H + W, baseX, baseX + H + L + H);
      addFoldVertical(foldLines, baseX + H, baseY, baseY + H + W + H);
      addFoldVertical(foldLines, baseX + H + L, baseY, baseY + H + W + H);

      const lidL = L * (1 + clearance);
      const lidW = W * (1 + clearance);
      const lidX = margin;
      const lidY = baseY + H + W + H + 25;
      pushRect('Lid Top', 'lid', lidX + lidH, lidY + lidH, lidL, lidW);
      pushRect('Lid Front', 'lid', lidX + lidH, lidY, lidL, lidH);
      pushRect('Lid Back', 'lid', lidX + lidH, lidY + lidH + lidW, lidL, lidH);
      pushRect('Lid Left', 'lid', lidX, lidY + lidH, lidH, lidW);
      pushRect('Lid Right', 'lid', lidX + lidH + lidL, lidY + lidH, lidH, lidW);
      pushRect('Lid Glue Flap', 'glue', lidX + lidH + lidL + lidH, lidY + lidH, G, lidW);
      return { templateId, title: 'Box with Lid', parts, cutLines, foldLines, boundsMm: { width: lidX + lidH + lidL + lidH + G + margin, height: lidY + lidH + lidW + lidH + margin }, warnings };
    }
    case 'cardBox': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const tuck = getParam(parameters, 'tuckFlap', scale);
      const G = getParam(parameters, 'glueFlap', scale);
      const x = margin + G;
      const y = margin + tuck;
      pushRect('Glue Flap', 'glue', margin, y, G, H);
      pushRect('Front', 'panel', x, y, L, H);
      pushRect('Side Left', 'side', x + L, y, W, H);
      pushRect('Back', 'panel', x + L + W, y, L, H);
      pushRect('Side Right', 'side', x + 2 * L + W, y, W, H);
      pushRect('Top Flap', 'flap', x, margin, L, tuck);
      pushRect('Bottom Flap', 'flap', x, y + H, L, tuck);
      return { templateId, title: 'Card Box', parts, cutLines, foldLines, boundsMm: { width: x + 2 * L + 2 * W + margin, height: y + H + tuck + margin }, warnings };
    }
    case 'coneTruncated': {
      const t = getParam(parameters, 'topDiameter', scale);
      const b = getParam(parameters, 'bottomDiameter', scale);
      const h = getParam(parameters, 'height', scale);
      const g = getParam(parameters, 'glueFlap', scale);
      const width = Math.PI * b;
      const topWidth = Math.PI * t;
      const x = margin + g;
      const y = margin;
      parts.push({ id: createId('part'), label: 'Body', kind: 'panel', x, y, width, height: h, fillColor: '#ffffff', acceptsArtwork: true, acceptsFill: true, artworkPlacements: [], path: `M ${x} ${y} H ${x + topWidth} L ${x + width} ${y + h} H ${x} Z` });
      cutLines.push(`M ${x} ${y} H ${x + topWidth} L ${x + width} ${y + h} H ${x} Z`);
      pushRect('Glue Flap', 'glue', margin, y + h * 0.1, g, h * 0.8);
      return { templateId, title: 'Cone (Truncated)', parts, cutLines, foldLines, boundsMm: { width: x + width + margin, height: y + h + margin }, warnings };
    }
    case 'counterDisplay': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const front = getParam(parameters, 'front', scale);
      const flapH = getParam(parameters, 'flapHeight', scale);
      const x = margin;
      const y = margin + flapH;
      pushRect('Base', 'base', x + H, y + H, L, W);
      pushRect('Back Panel', 'panel', x + H, y, L, H);
      pushRect('Front Panel', 'panel', x + H, y + H + W, L, front);
      pushRect('Front Flap', 'flap', x + H, margin, L, flapH);
      pushRect('Side Left', 'side', x, y + H, H, W);
      pushRect('Side Right', 'side', x + H + L, y + H, H, W);
      return { templateId, title: 'Counter Display', parts, cutLines, foldLines, boundsMm: { width: x + H + L + H + margin, height: y + H + W + front + margin }, warnings };
    }
    case 'ellipticalBox': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const lidH = getParam(parameters, 'lidHeight', scale);
      const extra = getParam(parameters, 'extraOffset', scale);
      parts.push(ellipsePart('Base Cap', 'base', margin, margin, L, W));
      pushRect('Base Wall', 'side', margin + L + 10, margin, Math.PI * ((L + W) / 2), H);
      parts.push(ellipsePart('Lid Cap', 'lid', margin, margin + W + 25, L + extra * 2, W + extra * 2));
      pushRect('Lid Wall', 'lid', margin + L + 10, margin + W + 25, Math.PI * ((L + W) / 2), lidH);
      cutLines.push(`M ${margin + L / 2} ${margin} a ${L / 2} ${W / 2} 0 1 0 0.1 0`);
      return { templateId, title: 'Elliptical Box', parts, cutLines, foldLines, boundsMm: { width: margin + L + 10 + Math.PI * ((L + W) / 2) + margin, height: margin + W + 25 + W + extra * 2 + margin }, warnings };
    }
    case 'envelope': {
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const overlap = getParam(parameters, 'overlap', scale);
      const radius = getParam(parameters, 'radius', scale);
      pushRect('Center Body', 'panel', margin + H * 0.5, margin + H * 0.5, W, H);
      parts.push(rectPart('Top Flap', 'flap', margin + H * 0.5, margin, W, H * 0.5));
      parts.push(rectPart('Bottom Flap', 'flap', margin + H * 0.5, margin + H * 1.5, W, H * 0.5 + overlap));
      parts.push({ ...rectPart('Side Left', 'flap', margin, margin + H * 0.5, H * 0.5, H), rx: radius, ry: radius });
      parts.push({ ...rectPart('Side Right', 'flap', margin + H * 0.5 + W, margin + H * 0.5, H * 0.5, H), rx: radius, ry: radius });
      for (const p of parts) {
        if (p.shape !== 'ellipse' && !p.path) addRectCut(cutLines, p.x, p.y, p.width, p.height);
      }
      return { templateId, title: 'Envelope', parts, cutLines, foldLines, boundsMm: { width: margin + H * 0.5 + W + H * 0.5 + margin, height: margin + H * 0.5 + H + H * 0.5 + overlap + margin }, warnings };
    }
    case 'matchBox': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const c = getParam(parameters, 'clearance', scale);
      pushRect('Sleeve Front', 'panel', margin, margin, L + c, H);
      pushRect('Sleeve Back', 'panel', margin, margin + H + W, L + c, H);
      pushRect('Sleeve Left', 'side', margin, margin + H, L + c, W);
      pushRect('Drawer Base', 'base', margin + L + 25, margin + H, L, W);
      pushRect('Drawer Front', 'side', margin + L + 25, margin, L, H);
      pushRect('Drawer Back', 'side', margin + L + 25, margin + H + W, L, H);
      pushRect('Drawer Left', 'side', margin + L + 25 - H, margin + H, H, W);
      pushRect('Drawer Right', 'side', margin + L + 25 + L, margin + H, H, W);
      return { templateId, title: 'Match Box', parts, cutLines, foldLines, boundsMm: { width: margin + L + 25 + L + H + margin, height: margin + H + W + H + margin }, warnings };
    }
    case 'milkCarton': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const roof = getParam(parameters, 'roofHeight', scale);
      const top = getParam(parameters, 'topFlap', scale);
      const x = margin;
      const y = margin + roof + top;
      pushRect('Front', 'panel', x, y, L, H);
      pushRect('Right', 'side', x + L, y, W, H);
      pushRect('Back', 'panel', x + L + W, y, L, H);
      pushRect('Left', 'side', x + 2 * L + W, y, W, H);
      pushRect('Roof Front', 'flap', x, margin + top, L, roof);
      pushRect('Roof Back', 'flap', x + L + W, margin + top, L, roof);
      pushRect('Top Flap Front', 'flap', x, margin, L, top);
      pushRect('Top Flap Back', 'flap', x + L + W, margin, L, top);
      return { templateId, title: 'Milk Carton', parts, cutLines, foldLines, boundsMm: { width: x + 2 * L + 2 * W + margin, height: y + H + margin }, warnings };
    }
    case 'nestableTray': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const draft = getParam(parameters, 'draftAngle', scale);
      const shrink = Math.max(0, H * Math.tan((draft * Math.PI) / 180));
      pushRect('Base', 'base', margin + H, margin + H, L, W);
      parts.push({ ...rectPart('Front', 'side', margin + H, margin, L, H), width: Math.max(2, L - shrink) });
      parts.push({ ...rectPart('Back', 'side', margin + H, margin + H + W, L, H), width: Math.max(2, L - shrink) });
      pushRect('Left', 'side', margin, margin + H, H, W);
      pushRect('Right', 'side', margin + H + L, margin + H, H, W);
      return { templateId, title: 'Nestable Tray', parts, cutLines, foldLines, boundsMm: { width: margin + H + L + H + margin, height: margin + H + W + H + margin }, warnings };
    }
    case 'passepartout': {
      const pL = getParam(parameters, 'pictureLength', scale);
      const pW = getParam(parameters, 'pictureWidth', scale);
      const frameW = getParam(parameters, 'frameWidth', scale);
      const frameD = getParam(parameters, 'frameDepth', scale);
      const totalL = pL + frameW * 2;
      const totalW = pW + frameW * 2;
      pushRect('Outer Frame', 'decorative', margin, margin, totalL, totalW);
      pushRect('Inner Insert', 'insert', margin + frameW, margin + frameW, pL, pW);
      pushRect('Backing Panel', 'base', margin + totalL + 20, margin, totalL, totalW);
      pushRect('Support Strip Top', 'side', margin, margin + totalW + 15, totalL, frameD);
      return { templateId, title: 'Passepartout', parts, cutLines, foldLines, boundsMm: { width: margin + totalL + 20 + totalL + margin, height: margin + totalW + 15 + frameD + margin }, warnings };
    }
    case 'pillowPack': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const G = getParam(parameters, 'glueFlap', scale);
      const x = margin + G;
      const y = margin;
      parts.push({ id: createId('part'), label: 'Main Body', kind: 'panel', x, y, width: L, height: W, fillColor: '#ffffff', acceptsArtwork: true, acceptsFill: true, artworkPlacements: [], path: `M ${x} ${y + H} Q ${x + L * 0.5} ${y - H} ${x + L} ${y + H} V ${y + W - H} Q ${x + L * 0.5} ${y + W + H} ${x} ${y + W - H} Z` });
      cutLines.push(`M ${x} ${y + H} Q ${x + L * 0.5} ${y - H} ${x + L} ${y + H} V ${y + W - H} Q ${x + L * 0.5} ${y + W + H} ${x} ${y + W - H} Z`);
      pushRect('Glue Flap', 'glue', margin, y + H, G, W - H * 2);
      return { templateId, title: 'Pillow Pack', parts, cutLines, foldLines, boundsMm: { width: x + L + margin, height: y + W + margin }, warnings };
    }
    case 'polygonalBoxWithLid': {
      const d = getParam(parameters, 'innerDiameter', scale);
      const sides = Math.max(3, Math.round(getParam(parameters, 'sides', scale)));
      const H = getParam(parameters, 'height', scale);
      const lidH = getParam(parameters, 'lidHeight', scale);
      const sideWidth = (Math.PI * d) / sides;
      let cursorX = margin;
      for (let i = 0; i < sides; i += 1) {
        pushRect(`Base Segment ${i + 1}`, 'side', cursorX, margin, sideWidth, H);
        cursorX += sideWidth;
      }
      pushRect('Base Polygon Floor', 'base', margin, margin + H + 10, d, d);
      let lidX = margin;
      for (let i = 0; i < sides; i += 1) {
        pushRect(`Lid Segment ${i + 1}`, 'lid', lidX, margin + H + d + 35, sideWidth, lidH);
        lidX += sideWidth;
      }
      pushRect('Lid Polygon Top', 'lid', margin, margin + H + d + 35 + lidH + 10, d, d);
      return { templateId, title: 'Polygonal Box with Lid', parts, cutLines, foldLines, boundsMm: { width: Math.max(cursorX, d + margin * 2), height: margin + H + d + 35 + lidH + 10 + d + margin }, warnings };
    }
    case 'roundBox': {
      const d = getParam(parameters, 'diameter', scale);
      const H = getParam(parameters, 'height', scale);
      const lidH = getParam(parameters, 'lidHeight', scale);
      const extra = getParam(parameters, 'extraOffset', scale);
      parts.push(ellipsePart('Base Circle', 'base', margin, margin, d, d));
      pushRect('Base Wall', 'side', margin + d + 15, margin, Math.PI * d, H);
      parts.push(ellipsePart('Lid Circle', 'lid', margin, margin + d + 25, d + extra * 2, d + extra * 2));
      pushRect('Lid Wall', 'lid', margin + d + 15, margin + d + 25, Math.PI * (d + extra * 2), lidH);
      return { templateId, title: 'Round Box', parts, cutLines, foldLines, boundsMm: { width: margin + d + 15 + Math.PI * (d + extra * 2) + margin, height: margin + d + 25 + d + extra * 2 + margin }, warnings };
    }
    case 'shallowBox': {
      const L = getParam(parameters, 'length', scale);
      const W = getParam(parameters, 'width', scale);
      const H = getParam(parameters, 'height', scale);
      const dust = getParam(parameters, 'dustFlap', scale);
      const tuck = getParam(parameters, 'tuckFlap', scale);
      const G = getParam(parameters, 'glueFlap', scale);
      const x = margin + G;
      const y = margin + tuck;
      pushRect('Glue Flap', 'glue', margin, y, G, W);
      pushRect('Front', 'panel', x, y, L, H);
      pushRect('Top Cover', 'panel', x, y + H, L, W);
      pushRect('Back', 'panel', x, y + H + W, L, H);
      pushRect('Left', 'side', x - H, y + H, H, W);
      pushRect('Right', 'side', x + L, y + H, H, W);
      pushRect('Dust Flap Left', 'flap', x - dust, y + H, dust, W);
      pushRect('Dust Flap Right', 'flap', x + L + H, y + H, dust, W);
      pushRect('Tuck Flap', 'flap', x, margin, L, tuck);
      return { templateId, title: 'Shallow Box', parts, cutLines, foldLines, boundsMm: { width: x + L + H + dust + margin, height: y + H + W + H + margin }, warnings };
    }
    default:
      return { templateId, title: 'Template', parts, cutLines, foldLines, boundsMm: { width: 210, height: 297 }, warnings };
  }
}
