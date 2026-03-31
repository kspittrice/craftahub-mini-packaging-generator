import { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { pageWarning, exportPdf, exportRaster, exportSvg, isVectorType, createId, scaleToMini } from './lib';
import { TEMPLATE_DEFINITIONS, buildDocument } from './templates';
import { ArtworkPlacement, ExportMode, PageSize, ScaleMode, TemplateParameter, TemplatePart } from './types';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

const defaultTemplate = TEMPLATE_DEFINITIONS[0];

function cloneParams(params: TemplateParameter[]) {
  return params.map((p) => ({ ...p }));
}

function cloneArtwork(artwork: ArtworkPlacement): ArtworkPlacement {
  return { ...artwork, id: createId('art') };
}

export default function App() {
  const [templateId, setTemplateId] = useState(defaultTemplate.id);
  const [parameters, setParameters] = useState<TemplateParameter[]>(cloneParams(defaultTemplate.parameters));
  const [scale, setScale] = useState<ScaleMode>('1:6');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingArtwork, setIsDraggingArtwork] = useState(false);
  const [activeArtworkId, setActiveArtworkId] = useState<string>('');
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const selected = TEMPLATE_DEFINITIONS.find((template) => template.id === templateId) ?? TEMPLATE_DEFINITIONS[0];
    setParameters(cloneParams(selected.parameters));
    setSelectedPartId('');
  }, [templateId]);

  const documentModel = useMemo(() => buildDocument(templateId, parameters, scale), [templateId, parameters, scale]);
  const selectedPart = documentModel.parts.find((part) => part.id === selectedPartId) ?? documentModel.parts[0];
  const selectedArtwork = selectedPart?.artworkPlacements.find((item) => item.id === activeArtworkId) ?? selectedPart?.artworkPlacements[0];
  const pageAlert = pageWarning(documentModel, pageSize);

  useEffect(() => {
    if (!selectedPartId && documentModel.parts.length) {
      setSelectedPartId(documentModel.parts[0].id);
    }
  }, [documentModel.parts, selectedPartId]);

  const setParameterValue = (key: string, value: number) => {
    setParameters((current) => current.map((param) => (param.key === key ? { ...param, value } : param)));
  };

  const updatePart = (partId: string, updater: (part: TemplatePart) => TemplatePart) => {
    setParameters((current) => {
      void current;
      return [...current];
    });
    documentModel.parts = documentModel.parts.map((part) => (part.id === partId ? updater(part) : part));
  };

  const forceRerender = () => setParameters((current) => [...current]);

  const updateSelectedPartFill = (fillColor: string) => {
    const part = documentModel.parts.find((item) => item.id === selectedPartId);
    if (!part) return;
    part.fillColor = fillColor;
    forceRerender();
  };

  const updateArtwork = (artworkId: string, updater: (art: ArtworkPlacement) => ArtworkPlacement) => {
    const part = documentModel.parts.find((item) => item.id === selectedPartId);
    if (!part) return;
    part.artworkPlacements = part.artworkPlacements.map((art) => (art.id === artworkId ? updater(art) : art));
    forceRerender();
  };

  const handleDuplicateArtwork = (targetPartId: string) => {
    const sourcePart = documentModel.parts.find((item) => item.id === selectedPartId);
    const targetPart = documentModel.parts.find((item) => item.id === targetPartId);
    const art = sourcePart?.artworkPlacements.find((item) => item.id === activeArtworkId);
    if (!sourcePart || !targetPart || !art) return;
    targetPart.artworkPlacements.push(cloneArtwork(art));
    forceRerender();
  };

  const parseUpload = async (file: File) => {
    const type = file.type.toLowerCase();
    if (type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 150 / 72 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas not available for PDF preview.');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      return {
        fileType: 'pdf' as const,
        sourceUrl: canvas.toDataURL('image/png'),
      };
    }
    const sourceUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('File upload failed.'));
      reader.readAsDataURL(file);
    });
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    return {
      fileType: (ext === 'jpeg' ? 'jpg' : ext) as ArtworkPlacement['fileType'],
      sourceUrl,
    };
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPart) return;
    const parsed = await parseUpload(file);
    const artwork: ArtworkPlacement = {
      id: createId('art'),
      fileName: file.name,
      fileType: parsed.fileType,
      sourceUrl: parsed.sourceUrl,
      x: selectedPart.width * 0.2,
      y: selectedPart.height * 0.2,
      width: selectedPart.width * 0.6,
      height: selectedPart.height * 0.6,
      rotation: 0,
      tiled: false,
      tileScale: 1,
      tileOffsetX: 0,
      tileOffsetY: 0,
      tileRotation: 0,
    };
    selectedPart.artworkPlacements.push(artwork);
    setActiveArtworkId(artwork.id);
    forceRerender();
    event.target.value = '';
  };

  const onSvgMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).dataset.role === 'artwork') return;
    setIsPanning(true);
    setDragOrigin({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  };

  const onSvgMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPan({ x: event.clientX - dragOrigin.x, y: event.clientY - dragOrigin.y });
    }
    if (isDraggingArtwork && selectedArtwork && selectedPart && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const svgX = ((event.clientX - rect.left - pan.x) / zoom) - selectedPart.x;
      const svgY = ((event.clientY - rect.top - pan.y) / zoom) - selectedPart.y;
      updateArtwork(selectedArtwork.id, (art) => ({ ...art, x: svgX - art.width / 2, y: svgY - art.height / 2 }));
    }
  };

  const onSvgMouseUp = () => {
    setIsPanning(false);
    setIsDraggingArtwork(false);
  };

  const handleArtworkMouseDown = (event: MouseEvent, artworkId: string) => {
    event.stopPropagation();
    setActiveArtworkId(artworkId);
    setIsDraggingArtwork(true);
  };

  const buildExportClone = (mode: ExportMode) => {
    const node = svgRef.current;
    if (!node) throw new Error('SVG not found');
    const clone = node.cloneNode(true) as SVGSVGElement;
    if (mode === 'cricut') {
      clone.querySelectorAll('[data-artwork-type]').forEach((element) => {
        const type = element.getAttribute('data-artwork-type') ?? '';
        if (!isVectorType(type)) {
          element.remove();
        }
      });
      clone.querySelectorAll('[data-pattern="true"]').forEach((element) => element.remove());
    }
    return clone;
  };

  const handleExport = async (kind: 'svg' | 'png' | 'jpg' | 'pdf', mode: ExportMode) => {
    const clone = buildExportClone(mode);
    clone.setAttribute('data-export-width-mm', String(documentModel.boundsMm.width));
    clone.setAttribute('data-export-height-mm', String(documentModel.boundsMm.height));
    const baseName = `${templateId}-${scale.replace(':', '-')}-${mode}`;
    if (kind === 'svg') return exportSvg(clone, `${baseName}.svg`);
    if (kind === 'pdf') return exportPdf(clone, `${baseName}.pdf`);
    return exportRaster(clone, `${baseName}.${kind}`, kind);
  };

  const renderPart = (part: TemplatePart) => {
    const isSelected = part.id === selectedPartId;
    const commonProps = {
      fill: part.acceptsFill ? part.fillColor : '#f4f4f4',
      stroke: isSelected ? '#f7b90c' : '#1f1f1f',
      strokeWidth: isSelected ? 0.8 : 0.4,
      onClick: () => setSelectedPartId(part.id),
      style: { cursor: 'pointer' },
    };

    return (
      <g key={part.id}>
        {part.path ? (
          <path d={part.path} {...commonProps} />
        ) : part.shape === 'ellipse' ? (
          <ellipse
            cx={part.x + part.width / 2}
            cy={part.y + part.height / 2}
            rx={part.width / 2}
            ry={part.height / 2}
            {...commonProps}
          />
        ) : (
          <rect x={part.x} y={part.y} width={part.width} height={part.height} rx={part.rx} ry={part.ry} {...commonProps} />
        )}
        {part.artworkPlacements.map((art) => {
          const patternId = `${part.id}-${art.id}-pattern`;
          const tiled = art.tiled;
          return (
            <g
              key={art.id}
              transform={`translate(${part.x + art.x} ${part.y + art.y}) rotate(${art.rotation} ${art.width / 2} ${art.height / 2})`}
              data-artwork-type={art.fileType}
              data-role="artwork"
              onMouseDown={(event) => handleArtworkMouseDown(event, art.id)}
              style={{ cursor: 'move' }}
            >
              {tiled ? (
                <>
                  <defs>
                    <pattern id={patternId} patternUnits="userSpaceOnUse" width={art.width / art.tileScale} height={art.height / art.tileScale} patternTransform={`rotate(${art.tileRotation}) translate(${art.tileOffsetX} ${art.tileOffsetY})`}>
                      <image href={art.sourceUrl} width={art.width / art.tileScale} height={art.height / art.tileScale} preserveAspectRatio="xMidYMid slice" />
                    </pattern>
                  </defs>
                  <rect width={art.width} height={art.height} fill={`url(#${patternId})`} stroke={activeArtworkId === art.id ? '#f7b90c' : '#555'} strokeWidth={0.4} data-pattern="true" />
                </>
              ) : art.fileType === 'svg' || art.fileType === 'png' || art.fileType === 'jpg' || art.fileType === 'jpeg' || art.fileType === 'pdf' ? (
                <image href={art.sourceUrl} width={art.width} height={art.height} preserveAspectRatio="xMidYMid meet" />
              ) : null}
              <rect width={art.width} height={art.height} fill="transparent" stroke={activeArtworkId === art.id ? '#f7b90c' : '#666'} strokeDasharray="2 2" strokeWidth={0.4} />
            </g>
          );
        })}
        <text x={part.x + part.width / 2} y={part.y + part.height / 2} textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fill="#666">
          {part.label}
        </text>
      </g>
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar left">
        <h1>Mini Packaging Generator</h1>
        <p className="sub">Create printable miniature packaging templates in 1:6 and 1:12 scale.</p>

        <label className="field">
          <span>Choose a template</span>
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {TEMPLATE_DEFINITIONS.map((template) => (
              <option key={template.id} value={template.id}>{template.title}</option>
            ))}
          </select>
        </label>

        <div className="row two">
          <label className="field">
            <span>Choose scale</span>
            <select value={scale} onChange={(e) => setScale(e.target.value as ScaleMode)}>
              <option value="1:6">1:6</option>
              <option value="1:12">1:12</option>
            </select>
          </label>
          <label className="field">
            <span>Page size</span>
            <select value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSize)}>
              <option value="A4">A4</option>
              <option value="A3">A3</option>
            </select>
          </label>
        </div>

        <h2>Real-life dimensions</h2>
        {parameters.map((param) => (
          <label className="field" key={param.key}>
            <span>{param.label}</span>
            <input
              type="number"
              value={param.value}
              min={param.min}
              max={param.max}
              step={param.step ?? 1}
              onChange={(e) => setParameterValue(param.key, Number(e.target.value))}
            />
            <small>Mini size: {['clearance', 'draftAngle', 'sides'].includes(param.key) ? param.value : scaleToMini(param.value, scale).toFixed(2)} {['sides', 'clearance', 'draftAngle'].includes(param.key) ? '' : 'mm'}</small>
          </label>
        ))}

        <h2>Selected panel</h2>
        <div className="field compact">
          <span>{selectedPart?.label ?? 'None selected'}</span>
          <input type="color" value={selectedPart?.fillColor ?? '#ffffff'} onChange={(e) => updateSelectedPartFill(e.target.value)} disabled={!selectedPart?.acceptsFill} />
        </div>

        <label className="upload">
          <span>Upload artwork</span>
          <input type="file" accept=".png,.jpg,.jpeg,.svg,.pdf" onChange={handleUpload} />
        </label>

        {pageAlert ? <div className="warning">{pageAlert}</div> : null}
        {documentModel.warnings.map((warning) => <div key={warning} className="warning">{warning}</div>)}
        <div className="note">Cricut SVG supports vector artwork only. Uploaded PNG, JPG, PDF artwork and pattern fills are not included in Cricut export.</div>
      </aside>

      <main className="canvas-panel">
        <div className="toolbar">
          <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(4, z + 0.1))}>+</button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset view</button>
        </div>
        <div
          className="viewport"
          ref={viewportRef}
          onMouseDown={onSvgMouseDown}
          onMouseMove={onSvgMouseMove}
          onMouseUp={onSvgMouseUp}
          onMouseLeave={onSvgMouseUp}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${documentModel.boundsMm.width} ${documentModel.boundsMm.height}`}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            data-export-width-mm={documentModel.boundsMm.width}
            data-export-height-mm={documentModel.boundsMm.height}
          >
            <rect x={0} y={0} width={documentModel.boundsMm.width} height={documentModel.boundsMm.height} fill="#fffdf8" />
            {documentModel.parts.map(renderPart)}
            {documentModel.cutLines.map((line, index) => <path key={`cut-${index}`} d={line} fill="none" stroke="#111" strokeWidth={0.35} />)}
            {documentModel.foldLines.map((line, index) => <path key={`fold-${index}`} d={line} fill="none" stroke="#666" strokeWidth={0.25} strokeDasharray="2 1.5" />)}
          </svg>
        </div>
      </main>

      <aside className="sidebar right">
        <h2>Layers</h2>
        <div className="parts-list">
          {documentModel.parts.map((part) => (
            <button key={part.id} className={part.id === selectedPartId ? 'part active' : 'part'} onClick={() => setSelectedPartId(part.id)}>
              {part.label}
            </button>
          ))}
        </div>

        {selectedPart ? (
          <>
            <h2>Artwork controls</h2>
            {selectedArtwork ? (
              <div className="controls">
                <label className="field"><span>X</span><input type="range" min={-selectedPart.width} max={selectedPart.width} step="0.5" value={selectedArtwork.x} onChange={(e) => updateArtwork(selectedArtwork.id, (art) => ({ ...art, x: Number(e.target.value) }))} /></label>
                <label className="field"><span>Y</span><input type="range" min={-selectedPart.height} max={selectedPart.height} step="0.5" value={selectedArtwork.y} onChange={(e) => updateArtwork(selectedArtwork.id, (art) => ({ ...art, y: Number(e.target.value) }))} /></label>
                <label className="field"><span>Width</span><input type="range" min="1" max={selectedPart.width * 2} step="0.5" value={selectedArtwork.width} onChange={(e) => updateArtwork(selectedArtwork.id, (art) => ({ ...art, width: Number(e.target.value) }))} /></label>
                <label className="field"><span>Height</span><input type="range" min="1" max={selectedPart.height * 2} step="0.5" value={selectedArtwork.height} onChange={(e) => updateArtwork(selectedArtwork.id, (art) => ({ ...art, height: Number(e.target.value) }))} /></label>
                <label className="field"><span>Rotation</span><input type="range" min="-180" max="180" step="1" value={selectedArtwork.rotation} onChange={(e) => updateArtwork(selectedArtwork.id, (art) => ({ ...art, rotation: Number(e.target.value) }))} /></label>
                <div className="button-row">
                  <button onClick={() => updateArtwork(selectedArtwork.id, (art) => ({ ...art, rotation: art.rotation - 15 }))}>Rotate -15°</button>
                  <button onClick={() => updateArtwork(selectedArtwork.id, (art) => ({ ...art, rotation: art.rotation + 15 }))}>Rotate +15°</button>
                  <button onClick={() => updateArtwork(selectedArtwork.id, (art) => ({ ...art, rotation: 0 }))}>Reset rotation</button>
                </div>
                <label className="checkbox"><input type="checkbox" checked={selectedArtwork.tiled} onChange={(e) => updateArtwork(selectedArtwork.id, (art) => ({ ...art, tiled: e.target.checked }))} /> Tile artwork</label>
                {selectedArtwork.tiled ? (
                  <>
                    <label className="field"><span>Pattern scale</span><input type="range" min="0.2" max="4" step="0.1" value={selectedArtwork.tileScale} onChange={(e) => updateArtwork(selectedArtwork.id, (art) => ({ ...art, tileScale: Number(e.target.value) }))} /></label>
                    <label className="field"><span>Pattern rotation</span><input type="range" min="-180" max="180" step="1" value={selectedArtwork.tileRotation} onChange={(e) => updateArtwork(selectedArtwork.id, (art) => ({ ...art, tileRotation: Number(e.target.value) }))} /></label>
                  </>
                ) : null}
                <label className="field">
                  <span>Duplicate to another panel</span>
                  <select defaultValue="" onChange={(e) => { if (e.target.value) handleDuplicateArtwork(e.target.value); e.currentTarget.value = ''; }}>
                    <option value="" disabled>Choose panel</option>
                    {documentModel.parts.filter((part) => part.id !== selectedPartId && part.acceptsArtwork).map((part) => <option key={part.id} value={part.id}>{part.label}</option>)}
                  </select>
                </label>
              </div>
            ) : <div className="note">Upload artwork to the selected panel to edit it here.</div>}
          </>
        ) : null}

        <h2>Export</h2>
        <div className="button-grid">
          <button onClick={() => handleExport('pdf', 'print')}>Download Print PDF</button>
          <button onClick={() => handleExport('png', 'print')}>Download Print PNG (300 DPI)</button>
          <button onClick={() => handleExport('jpg', 'print')}>Download Print JPG (300 DPI)</button>
          <button onClick={() => handleExport('svg', 'print')}>Download Print SVG</button>
          <button onClick={() => handleExport('svg', 'cricut')}>Download Cricut SVG</button>
        </div>
      </aside>
    </div>
  );
}
