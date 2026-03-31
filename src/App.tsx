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

function EnvelopeReference({
  fill,
}: {
  fill: string;
}) {
  return (
    <div className="ref-card">
      <div className="ref-photo">
        <svg viewBox="0 0 420 300" className="ref-svg" role="img">
          <rect width="420" height="300" fill="#efefef" />
          <circle cx="36" cy="36" r="22" fill="#d9d9d9" />
          <g transform="translate(40 50)">
            <polygon points="0,92 128,0 256,92 256,212 0,212" fill="#cf1889" />
            <polygon points="0,92 128,92 256,92 128,34" fill="#53d8ff" />
            <polygon points="0,92 128,162 256,92 256,212 0,212" fill="none" stroke="#be167e" strokeWidth="1.5" opacity="0.28" />
          </g>
          <g transform="translate(215 120)">
            <rect x="0" y="0" width="145" height="110" rx="6" fill="#12b3eb" />
            <polygon points="0,0 72.5,54 145,0" fill="#18bff6" />
            <line x1="0" y1="110" x2="72.5" y2="54" stroke="#0e95c2" strokeWidth="2.3" opacity="0.6" />
            <line x1="145" y1="110" x2="72.5" y2="54" stroke="#0e95c2" strokeWidth="2.3" opacity="0.6" />
          </g>
        </svg>
      </div>

      <div className="ref-diagram">
        <svg viewBox="0 0 420 250" className="ref-svg" role="img">
          <rect width="420" height="250" fill="#58aebe" />
          <g transform="translate(28 20)">
            <polygon points="0,135 120,95 270,140 115,205" fill="#9f7bc0" />
            <polygon points="12,122 0,135 115,205 145,180" fill="#876698" />
            <polygon points="120,95 150,79 292,126 270,140" fill="#b88ad4" />
            <text x="124" y="42" fill="#ffffff" fontSize="20" fontWeight="700">Overlap</text>
            <text x="0" y="165" fill="#ffffff" fontSize="20" fontWeight="700">Height</text>
            <text x="149" y="192" fill="#ffffff" fontSize="20" fontWeight="700">Width</text>
            <line x1="196" y1="54" x2="196" y2="85" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="188" y1="54" x2="204" y2="54" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="188" y1="85" x2="204" y2="85" stroke="#ffffff" strokeWidth="2.5" />
          </g>
        </svg>
      </div>

      <div className="ref-chip">
        <span>Preview fill</span>
        <div className="ref-chip-color" style={{ background: fill }} />
      </div>
    </div>
  );
}

function EnvelopeWorkArea({
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
  const W = clamp(width, 90, 260);
  const H = clamp(height, 60, 180);
  const O = clamp(overlap, 4, W * 0.12);
  const R = clamp(radius, 0, 14);

  const bodyX = 220;
  const bodyY = 120;
  const bodyW = W;
  const bodyH = H;

  const leftTop = { x: bodyX, y: bodyY };
  const leftKink = { x: bodyX - H * 0.12, y: bodyY + bodyH * 0.6 };
  const leftBottom = { x: bodyX - H * 0.34, y: bodyY + bodyH + H * 0.52 };
  const leftBottomInner = { x: bodyX + O, y: bodyY + bodyH + H * 0.52 };

  const bottomRightInner = { x: bodyX + bodyW - O, y: bodyY + bodyH + H * 0.52 };
  const bottomRight = { x: bodyX + bodyW + H * 0.12, y: bodyY + bodyH + H * 0.52 };

  const rightKink = { x: bodyX + bodyW + H * 0.22, y: bodyY + bodyH * 0.62 };
  const rightTop = { x: bodyX + bodyW + H * 0.46, y: bodyY + H * 0.04 };

  const topRightInner = { x: bodyX + bodyW - O, y: bodyY };
  const topLeftInner = { x: bodyX + O, y: bodyY };

  const guide1A = { x: bodyX, y: bodyY + bodyH * 0.58 };
  const guide1B = { x: bodyX + bodyW * 0.72, y: bodyY };
  const guide2A = { x: bodyX + bodyW * 0.16, y: bodyY + bodyH + H * 0.52 };
  const guide2B = { x: bodyX + bodyW * 0.88, y: bodyY + bodyH * 0.6 };

  const viewW = bodyX + bodyW + H * 0.75 + 120;
  const viewH = bodyY + bodyH + H * 0.9 + 100;

  return (
    <div className="workarea-card">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="workarea-svg" role="img">
        <rect width={viewW} height={viewH} fill="#ffffff" />
        <rect x="20" y="20" width={viewW - 40} height={viewH - 40} fill="none" stroke="#d4d4d4" />
        <text x="44" y="46" fontSize="16" fill="#222">
          Envelope {Math.round(width)}×{Math.round(height)} (mm)
        </text>

        <path
          d={`
            M ${topLeftInner.x} ${topLeftInner.y}
            L ${topRightInner.x} ${topRightInner.y}
            Q ${bodyX + bodyW + O * 0.6} ${bodyY} ${rightTop.x} ${rightTop.y}
            L ${rightKink.x} ${rightKink.y}
            L ${bottomRight.x} ${bottomRight.y}
            Q ${bodyX + bodyW + O * 0.3} ${bottomRight.y} ${bottomRightInner.x} ${bottomRightInner.y}
            L ${leftBottomInner.x} ${leftBottomInner.y}
            Q ${bodyX - O * 0.3} ${bottomRight.y} ${leftBottom.x} ${leftBottom.y}
            L ${leftKink.x} ${leftKink.y}
            L ${leftTop.x} ${leftTop.y}
            Q ${bodyX + O * 0.3} ${bodyY} ${topLeftInner.x} ${topLeftInner.y}
          `}
          fill="none"
          stroke="#ff1493"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <path
          d={`
            M ${bodyX} ${bodyY + bodyH * 0.58}
            L ${bodyX + bodyW * 0.72} ${bodyY}
          `}
          fill="none"
          stroke="#27b0ff"
          strokeWidth="3"
        />

        <path
          d={`
            M ${bodyX + bodyW * 0.16} ${bodyY + bodyH + H * 0.52}
            L ${bodyX + bodyW * 0.88} ${bodyY + bodyH * 0.6}
          `}
          fill="none"
          stroke="#27b0ff"
          strokeWidth="3"
        />

        <path
          d={`
            M ${bodyX} ${bodyY + bodyH * 0.58}
            L ${bodyX + bodyW * 0.16} ${bodyY + bodyH + H * 0.52}
          `}
          fill="none"
          stroke="#27b0ff"
          strokeWidth="3"
        />

        <path
          d={`
            M ${bodyX + bodyW * 0.72} ${bodyY}
            L ${bodyX + bodyW * 0.88} ${bodyY + bodyH * 0.6}
          `}
          fill="none"
          stroke="#27b0ff"
          strokeWidth="3"
        />

        <path
          d={`
            M ${bodyX} ${bodyY + bodyH * 0.58}
            L ${bodyX + bodyW * 0.72} ${bodyY}
            L ${bodyX + bodyW * 0.88} ${bodyY + bodyH * 0.6}
            L ${bodyX + bodyW * 0.16} ${bodyY + bodyH + H * 0.52}
            Z
          `}
          fill={fill}
          opacity="0.08"
          stroke="none"
        />

        <rect
          x={bodyX + bodyW * 0.08}
          y={bodyY + bodyH * 0.18}
          width={bodyW * 0.62}
          height={bodyH * 0.36}
          rx={R}
          ry={R}
          fill="none"
          stroke="#27b0ff"
          strokeWidth="0"
        />
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
  const [templateId, setTemplateId] = useState<string>("envelope");
  const [scale, setScale] = useState<ScaleMode>("1:6");
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [exportMode, setExportMode] = useState<ExportMode>("print");
  const [panelColor, setPanelColor] = useState<string>("#d6adc1");

  const [a, setA] = useState<number>(150);
  const [b, setB] = useState<number>(100);
  const [c, setC] = useState<number>(0);
  const [d, setD] = useState<number>(0);
  const [e, setE] = useState<number>(0);

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
      return;
    }

    setA(80);
    setB(50);
    setC(150);
    setD(20);
    setE(15);
  }

  function updateParam(key: string, value: number) {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }

  const realValues = [a, b, c, d, e].filter((v) => v > 0);
  const miniValues = realValues.map((v) => miniValue(v, scale));

  const preview = useMemo(() => {
    if (templateId === "envelope") {
      return (
        <EnvelopeWorkArea
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

          {templateId === "envelope" && (
            <section className="panel">
              <h2>Reference</h2>
              <EnvelopeReference fill={panelColor} />
            </section>
          )}

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
            <h2>Work area</h2>
            {preview}
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
        </aside>
      </main>
    </div>
  );
}
