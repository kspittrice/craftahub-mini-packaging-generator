export type ScaleMode = '1:6' | '1:12';
export type PageSize = 'A4' | 'A3';
export type ArtworkFileType = 'png' | 'jpg' | 'jpeg' | 'svg' | 'pdf';
export type ExportMode = 'print' | 'cricut';

export interface TemplateParameter {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  required?: boolean;
}

export interface ArtworkPlacement {
  id: string;
  fileName: string;
  fileType: ArtworkFileType;
  sourceUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  tiled: boolean;
  tileScale: number;
  tileOffsetX: number;
  tileOffsetY: number;
  tileRotation: number;
}

export interface TemplatePart {
  id: string;
  label: string;
  kind: 'panel' | 'flap' | 'lid' | 'base' | 'side' | 'glue' | 'insert' | 'decorative';
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
  shape?: 'rect' | 'ellipse';
  path?: string;
  fillColor: string;
  acceptsArtwork: boolean;
  acceptsFill: boolean;
  artworkPlacements: ArtworkPlacement[];
}

export interface TemplateDocument {
  templateId: string;
  title: string;
  parts: TemplatePart[];
  cutLines: string[];
  foldLines: string[];
  boundsMm: {
    width: number;
    height: number;
  };
  warnings: string[];
}

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  parameters: TemplateParameter[];
}
