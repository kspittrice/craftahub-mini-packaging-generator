import { useMemo, useState } from "react";

type ScaleMode = "1:6" | "1:12";
type PageSize = "A4" | "A3";
type ExportMode = "print" | "cricut";

type ParamDef = {
  key: string;
  label: string;
  defaultValue: number;
};

type TemplateDef = {
  id: string;
  name: string;
  description: string;
  dimensionLabels: {
    a: string;
    b: string;
    c?: string;
    d?: string;
    e?: string;
  };
  params: ParamDef[];
};

const templates: TemplateDef[] = [
  {
    id: "bag",
    name: "Bag",
    description: "Classic shopping bag style template.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height", d: "Fold" },
    params: [{ key: "glueFlap", label: "Glue Flap Size", defaultValue: 15 }],
  },
  {
    id: "box-with-lid",
    name: "Box with Lid",
    description: "Base and lid box template.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height", d: "Lid Height" },
    params: [
      { key: "clearance", label: "Clearance (%)", defaultValue: 4 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 10 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 45 },
    ],
  },
  {
    id: "card-box",
    name: "Card Box",
    description: "Slim folded box.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height" },
    params: [
      { key: "thumbHole", label: "Thumb Hole Diameter", defaultValue: 10 },
      { key: "tuckFlap", label: "Tuck Flap Size", defaultValue: 20 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 15 },
    ],
  },
  {
    id: "cone",
    name: "Cone (Truncated)",
    description: "Truncated cone template.",
    dimensionLabels: {
      a: "Top Diameter",
      b: "Bottom Diameter",
      c: "Height",
    },
    params: [
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 70 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 7 },
    ],
  },
  {
    id: "counter-display",
    name: "Counter Display",
    description: "Angled display tray.",
    dimensionLabels: {
      a: "Length",
      b: "Width",
      c: "Height",
      d: "Front",
      e: "Flap Height",
    },
    params: [],
  },
  {
    id: "elliptical-box",
    name: "Elliptical Box",
    description: "Oval box with lid.",
    dimensionLabels: {
      a: "Length",
      b: "Width",
      c: "Height",
      d: "Lid Height",
      e: "Extra Offset for Caps",
    },
    params: [
      { key: "clearance", label: "Clearance (%)", defaultValue: 3 },
      { key: "glueFlaps", label: "Number of Glue Flaps", defaultValue: 20 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 70 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 10 },
    ],
  },
  {
    id: "envelope",
    name: "Envelope",
    description: "Flat envelope template.",
    dimensionLabels: { a: "Width", b: "Height" },
    params: [
      { key: "overlap", label: "Overlap", defaultValue: 12.5 },
      { key: "radius", label: "Rounded Corners Radius", defaultValue: 7 },
    ],
  },
  {
    id: "match-box",
    name: "Match Box",
    description: "Tray-and-sleeve style box.",
    dimensionLabels: {
      a: "Length",
      b: "Width",
      c: "Height",
      d: "Material Thickness",
      e: "Clearance",
    },
    params: [
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 10 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 85 },
    ],
  },
  {
    id: "milk-carton",
    name: "Milk Carton",
    description: "Milk carton style package.",
    dimensionLabels: {
      a: "Length",
      b: "Width",
      c: "Height",
      d: "Roof Height",
      e: "Top Flap",
    },
    params: [
      { key: "radius", label: "Rounded Corners Radius", defaultValue: 8 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 30 },
      { key: "overlap", label: "Overlap", defaultValue: 20 },
    ],
  },
  {
    id: "nestable-tray",
    name: "Nestable Tray",
    description: "Tray with draft angle.",
    dimensionLabels: {
      a: "Length",
      b: "Width",
      c: "Height",
      d: "Draft Angle",
    },
    params: [
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 8 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 80 },
      { key: "thickness", label: "Material Thickness", defaultValue: 0.5 },
    ],
  },
  {
    id: "passepartout",
    name: "Passepartout",
    description: "Frame insert / shadow box style template.",
    dimensionLabels: {
      a: "Picture Length",
      b: "Picture Width",
      c: "Height",
      d: "Frame Width",
      e: "Frame Depth",
    },
    params: [
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 10 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 80 },
      { key: "thickness", label: "Material Thickness", defaultValue: 0.5 },
    ],
  },
  {
    id: "pillow-pack",
    name: "Pillow Pack",
    description: "Curved pillow style package.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height" },
    params: [
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 15 },
      { key: "thumbHole", label: "Thumb Hole Diameter", defaultValue: 10 },
    ],
  },
  {
    id: "polygonal-box",
    name: "Polygonal Box with Lid",
    description: "Polygon prism box with lid.",
    dimensionLabels: {
      a: "Inner Diameter",
      b: "Number of Sides",
      c: "Height",
      d: "Lid Height",
      e: "Clearance (%)",
    },
    params: [
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 14 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 80 },
    ],
  },
  {
    id: "round-box",
    name: "Round Box",
    description: "Round hat-box style package.",
    dimensionLabels: {
      a: "Diameter",
      b: "Height",
      c: "Lid Height",
      d: "Extra Offset for Caps",
    },
    params: [
      { key: "clearance", label: "Clearance (%)", defaultValue: 3 },
      { key: "glueFlaps", label: "Number of Glue Flaps", defaultValue: 20 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 70 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 10 },
    ],
  },
  {
    id: "shallow-box",
    name: "Shallow Box",
    description: "Shallow hinged box template.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height" },
    params: [
      { key: "dustFlap", label: "Dust Flap Size", defaultValue: 20 },
      { key: "thumbHole", label: "Thumb Hole Diameter", defaultValue: 15 },
      { key: "tuckFlap", label: "Tuck Flap Size", defaultValue: 15 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 30 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 85 },
      { key: "thickness", label: "Material Thickness", defaultValue: 0.5 },
    ],
  },
];

function scaleDivisor(scale: ScaleMode) {
  return scale === "1:6" ? 6 : 12;
}

function miniValue(real: number, scale: ScaleMode) {
  return Number((real / scaleDivisor(scale)).toFixed(2));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function EnvelopePreview({
  width,
  height,
  overlap,
  radius,
  fill,
}: {
  width: number;
  height: number;
  overlap: number;
  radius: number;
  fill: string;
}) {
  const W = clamp(width, 80, 260);
  const H = clamp(height, 50, 180);
  const O = clamp(overlap, 6, W * 0.12);
  const R = clamp(radius, 0, 14);

  const margin = 36;
  const sideDepth = W * 0.22;
  const topDepth = H * 0.48;
  const bottomDepth = H * 0.34;

  const bodyX = margin + sideDepth;
  const bodyY = margin + topDepth;
  const bodyW = W;
  const bodyH = H;

  const leftTopX = bodyX;
  const leftTopY = bodyY;
  const leftMidX = bodyX - sideDepth;
  const leftMidY = bodyY + bodyH / 2;
  const leftBottomX = bodyX;
  const leftBottomY = bodyY + bodyH;

  const rightTopX = bodyX + bodyW;
  const rightTopY = bodyY;
  const rightMidX = bodyX + bodyW + sideDepth;
  const rightMidY = bodyY + bodyH / 2;
  const rightBottomX = bodyX + bodyW;
  const rightBottomY = bodyY + bodyH;

  const topLeftX = bodyX;
  const topLeftY = bodyY;
  const topPeakX = bodyX + bodyW / 2;
  const topPeakY = bodyY - topDepth;
  const topRightX = bodyX + bodyW;
  const topRightY = bodyY;

  const bottomLeftX = bodyX;
  const bottomLeftY = bodyY + bodyH;
  const bottomPeakX = bodyX + bodyW / 2;
  const bottomPeakY = bodyY + bodyH + bottomDepth;
  const bottomRightX = bodyX + bodyW;
  const bottomRightY = bodyY + bodyH;

  const viewWidth = bodyX + bodyW + sideDepth + margin;
  const viewHeight = bodyY + bodyH + bottomDepth + margin;

  return (
    <div className="preview-card">
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="preview-svg"
        role="img"
      >
        <rect x="0" y="0" width={viewWidth} height={viewHeight} fill="#ffffff" />

        <polygon
          points={`${leftTopX},${leftTopY} ${leftMidX},${leftMidY} ${leftBottomX},${leftBottomY}`}
          fill={fill}
          stroke="#ff1493"
          strokeWidth="2.5"
        />

        <polygon
          points={`${rightTopX},${rightTopY} ${rightMidX},${rightMidY} ${rightBottomX},${rightBottomY}`}
          fill={fill}
          stroke="#ff1493"
          strokeWidth="2.5"
        />

        <polygon
          points={`
            ${topLeftX},${topLeftY}
            ${bodyX + O},${bodyY}
            ${topPeakX},${topPeakY}
            ${bodyX + bodyW - O},${bodyY}
            ${topRightX},${topRightY}
          `}
          fill={fill}
          stroke="#ff1493"
          strokeWidth="2.5"
        />

        <polygon
          points={`${bottomLeftX},${bottomLeftY} ${bottomPeakX},${bottomPeakY} ${bottomRightX},${bottomRightY}`}
          fill={fill}
          stroke="#ff1493"
          strokeWidth="2.5"
        />

        <rect
          x={bodyX}
          y={bodyY}
          width={bodyW}
          height={bodyH}
          rx={R}
          ry={R}
          fill={fill}
          stroke="#ff1493"
          strokeWidth="2.5"
        />

        <line
          x1={leftTopX}
          y1={leftTopY}
          x2={leftMidX}
          y2={leftMidY}
          stroke="#36a3ff"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <line
          x1={leftBottomX}
          y1={leftBottomY}
          x2={leftMidX}
          y2={leftMidY}
          stroke="#36a3ff"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />

        <line
          x1={rightTopX}
          y1={rightTopY}
          x2={rightMidX}
          y2={rightMidY}
          stroke="#36a3ff"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <line
          x1={rightBottomX}
          y1={rightBottomY}
          x2={rightMidX}
          y2={rightMidY}
          stroke="#36a3ff"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />

        <line
          x1={topLeftX}
          y1={topLeftY}
          x2={topPeakX}
          y2={topPeakY}
          stroke="#36a3ff"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <line
          x1={topRightX}
          y1={topRightY}
          x2={topPeakX}
          y2={topPeakY}
          stroke="#36a3ff"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />

        <line
          x1={bottomLeftX}
          y1={bottomLeftY}
          x2={bottomPeakX}
          y2={bottomPeakY}
          stroke="#36a3ff"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <line
          x1={bottomRightX}
          y1={bottomRightY}
          x2={bottomPeakX}
          y2={bottomPeakY}
          stroke="#36a3ff"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />

        <line
          x1={bodyX}
          y1={bodyY}
          x2={bodyX + bodyW}
          y2={bodyY + bodyH}
          stroke="#36a3ff"
          strokeWidth="1.2"
        />
        <line
          x1={bodyX + bodyW}
          y1={bodyY}
          x2={bodyX}
          y2={bodyY + bodyH}
          stroke="#36a3ff"
          strokeWidth="1.2"
        />

        <text x="20" y="24" fontSize="15" fill="#111">
          Envelope dieline preview
        </text>
      </svg>
    </div>
  );
}

function PlaceholderPreview({
  title,
  subtitle,
  fill,
}: {
  title: string;
  subtitle: string;
  fill: string;
}) {
  return (
    <div className="preview-card">
      <svg viewBox="0 0 520 360" className="preview-svg" role="img">
        <rect x="20" y="20" width="480" height="320" rx="18" fill="#ffffff" stroke="#d7d7d7" />
        <rect x="70" y="70" width="120" height="180" fill={fill} stroke="#111" strokeWidth="2" />
        <rect x="200" y="70" width="120" height="180" fill={fill} stroke="#111" strokeWidth="2" />
        <rect x="330" y="70" width="120" height="180" fill={fill} stroke="#111" strokeWidth="2" />
        <line x1="200" y1="70" x2="200" y2="250" stroke="#36a3ff" strokeWidth="2" />
        <line x1="330" y1="70" x2="330" y2="250" stroke="#36a3ff" strokeWidth="2" />
        <rect x="70" y="255" width="380" height="40" fill="none" stroke="#ff1493" strokeWidth="3" />
        <text x="40" y="45" fontSize="18" fill="#111">
          {title}
        </text>
        <text x="40" y="325" fontSize="16" fill="#555">
          {subtitle}
        </text>
      </svg>
    </div>
  );
}

export default function App() {
  const [templateId, setTemplateId] = useState<string>("bag");
  const [scale, setScale] = useState<ScaleMode>("1:6");
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [exportMode, setExportMode] = useState<ExportMode>("print");
  const [panelColor, setPanelColor] = useState<string>("#f5c1d6");

  const [a, setA] = useState<number>(80);
  const [b, setB] = useState<number>(50);
  const [c, setC] = useState<number>(150);
  const [d, setD] = useState<number>(20);
  const [e, setE] = useState<number>(15);

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0],
    [templateId]
  );

  const [paramValues, setParamValues] = useState<Record<string, number>>({
    glueFlap: 15,
    clearance: 4,
    glueAngle: 45,
    thumbHole: 10,
    tuckFlap: 20,
    radius: 7,
    overlap: 12.5,
    thickness: 0.5,
    glueFlaps: 20,
    dustFlap: 20,
  });

  function handleTemplateChange(nextId: string) {
    setTemplateId(nextId);

    if (nextId === "envelope") {
      setA(150);
      setB(100);
      setC(0);
      setD(0);
      setE(0);
    } else {
      setA(80);
      setB(50);
      setC(150);
      setD(20);
      setE(15);
    }
  }

  function updateParam(key: string, value: number) {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }

  const realValues = [a, b, c, d, e].filter((v) => v > 0);
  const miniValues = realValues.map((v) => miniValue(v, scale));

  const preview = useMemo(() => {
    if (templateId === "envelope") {
      return (
        <EnvelopePreview
          width={a}
          height={b}
          overlap={paramValues.overlap ?? 12.5}
          radius={paramValues.radius ?? 7}
          fill={panelColor}
        />
      );
    }

    return (
      <PlaceholderPreview
        title={activeTemplate.name}
        subtitle={`${scale} scale · ${pageSize} · ${exportMode === "print" ? "Print" : "Cricut"} mode`}
        fill={panelColor}
      />
    );
  }, [
    templateId,
    a,
    b,
    panelColor,
    paramValues.overlap,
    paramValues.radius,
    activeTemplate.name,
    scale,
    pageSize,
    exportMode,
  ]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Mini Packaging Generator</h1>
          <p>Create printable miniature packaging templates in 1:6 and 1:12 scale.</p>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar left">
          <section className="panel">
            <h2>Choose a template</h2>
            <select
              className="control"
              value={templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <p className="muted">{activeTemplate.description}</p>
          </section>

          <section className="panel">
            <h2>Choose scale</h2>
            <div className="radio-row">
              <label>
                <input
                  type="radio"
                  name="scale"
                  checked={scale === "1:6"}
                  onChange={() => setScale("1:6")}
                />
                1:6
              </label>
              <label>
                <input
                  type="radio"
                  name="scale"
                  checked={scale === "1:12"}
                  onChange={() => setScale("1:12")}
                />
                1:12
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Real-life dimensions (mm)</h2>

            <label className="field">
              <span>{activeTemplate.dimensionLabels.a}</span>
              <input
                className="control"
                type="number"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
              />
            </label>

            <label className="field">
              <span>{activeTemplate.dimensionLabels.b}</span>
              <input
                className="control"
                type="number"
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
              />
            </label>

            {activeTemplate.dimensionLabels.c && (
              <label className="field">
                <span>{activeTemplate.dimensionLabels.c}</span>
                <input
                  className="control"
                  type="number"
                  value={c}
                  onChange={(e) => setC(Number(e.target.value))}
                />
              </label>
            )}

            {activeTemplate.dimensionLabels.d && (
              <label className="field">
                <span>{activeTemplate.dimensionLabels.d}</span>
                <input
                  className="control"
                  type="number"
                  value={d}
                  onChange={(e) => setD(Number(e.target.value))}
                />
              </label>
            )}

            {activeTemplate.dimensionLabels.e && (
              <label className="field">
                <span>{activeTemplate.dimensionLabels.e}</span>
                <input
                  className="control"
                  type="number"
                  value={e}
                  onChange={(e) => setE(Number(e.target.value))}
                />
              </label>
            )}
          </section>

          <section className="panel">
            <h2>Miniature size preview</h2>
            <div className="mini-grid">
              {realValues.map((real, index) => (
                <div key={`${real}-${index}`} className="mini-item">
                  <strong>{real} mm</strong>
                  <span>{miniValues[index]} mm</span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="center-stage">
          <section className="panel">
            <h2>Live preview</h2>
            {preview}
          </section>

          <section className="panel">
            <h2>Project summary</h2>
            <div className="summary-grid">
              <div>
                <span className="summary-label">Template</span>
                <strong>{activeTemplate.name}</strong>
              </div>
              <div>
                <span className="summary-label">Scale</span>
                <strong>{scale}</strong>
              </div>
              <div>
                <span className="summary-label">Page size</span>
                <strong>{pageSize}</strong>
              </div>
              <div>
                <span className="summary-label">Export mode</span>
                <strong>{exportMode === "print" ? "Print" : "Cricut"}</strong>
              </div>
            </div>
          </section>
        </section>

        <aside className="sidebar right">
          <section className="panel">
            <h2>Optional parameters</h2>
            {activeTemplate.params.length === 0 ? (
              <p className="muted">This template has no extra parameters in this step.</p>
            ) : (
              activeTemplate.params.map((param) => (
                <label className="field" key={param.key}>
                  <span>{param.label}</span>
                  <input
                    className="control"
                    type="number"
                    value={paramValues[param.key] ?? param.defaultValue}
                    onChange={(e) => updateParam(param.key, Number(e.target.value))}
                  />
                </label>
              ))
            )}
          </section>

          <section className="panel">
            <h2>Panel color</h2>
            <input
              className="color-picker"
              type="color"
              value={panelColor}
              onChange={(e) => setPanelColor(e.target.value)}
            />
          </section>

          <section className="panel">
            <h2>Page size</h2>
            <div className="radio-column">
              <label>
                <input
                  type="radio"
                  name="page-size"
                  checked={pageSize === "A4"}
                  onChange={() => setPageSize("A4")}
                />
                A4
              </label>
              <label>
                <input
                  type="radio"
                  name="page-size"
                  checked={pageSize === "A3"}
                  onChange={() => setPageSize("A3")}
                />
                A3
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Export mode</h2>
            <div className="radio-column">
              <label>
                <input
                  type="radio"
                  name="export-mode"
                  checked={exportMode === "print"}
                  onChange={() => setExportMode("print")}
                />
                Print
              </label>
              <label>
                <input
                  type="radio"
                  name="export-mode"
                  checked={exportMode === "cricut"}
                  onChange={() => setExportMode("cricut")}
                />
                Cricut
              </label>
            </div>
            {exportMode === "cricut" && (
              <p className="warning">
                Vector artwork only. Raster files and patterns are excluded from Cricut SVG export.
              </p>
            )}
          </section>

          <section className="panel">
            <h2>Next features</h2>
            <ul className="feature-list">
              <li>SVG geometry per template</li>
              <li>Panel-by-panel artwork upload</li>
              <li>Move / resize / rotate</li>
              <li>Duplicate to another panel</li>
              <li>PDF / PNG / JPG / SVG export</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
