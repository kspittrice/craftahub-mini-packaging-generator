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
    dimensionLabels: { a: "Top Diameter", b: "Bottom Diameter", c: "Height" },
    params: [
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 70 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 7 },
    ],
  },
  {
    id: "counter-display",
    name: "Counter Display",
    description: "Angled display tray.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height", d: "Front", e: "Flap Height" },
    params: [],
  },
  {
    id: "elliptical-box",
    name: "Elliptical Box",
    description: "Oval box with lid.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height", d: "Lid Height", e: "Extra Offset for Caps" },
    params: [
      { key: "clearance", label: "Clearance (%)", defaultValue: 3 },
      { key: "glueFlaps", label: "Number of Glue Flaps", defaultValue: 20 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 70 },
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 10 },
    ],
  },
  {
    id: "match-box",
    name: "Match Box",
    description: "Tray-and-sleeve style box.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height", d: "Material Thickness", e: "Clearance" },
    params: [
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 10 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 85 },
    ],
  },
  {
    id: "milk-carton",
    name: "Milk Carton",
    description: "Milk carton style package.",
    dimensionLabels: { a: "Length", b: "Width", c: "Height", d: "Roof Height", e: "Top Flap" },
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
    dimensionLabels: { a: "Length", b: "Width", c: "Height", d: "Draft Angle" },
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
    dimensionLabels: { a: "Picture Length", b: "Picture Width", c: "Height", d: "Frame Width", e: "Frame Depth" },
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
    dimensionLabels: { a: "Inner Diameter", b: "Number of Sides", c: "Height", d: "Lid Height", e: "Clearance (%)" },
    params: [
      { key: "glueFlap", label: "Glue Flap Size", defaultValue: 14 },
      { key: "glueAngle", label: "Glue Flap Angle", defaultValue: 80 },
    ],
  },
  {
    id: "round-box",
    name: "Round Box",
    description: "Round hat-box style package.",
    dimensionLabels: { a: "Diameter", b: "Height", c: "Lid Height", d: "Extra Offset for Caps" },
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

function EnvelopeReferenceCard({ fill }: { fill: string }) {
  return (
    <div className="reference-card">
      <div className="reference-image">
        <svg viewBox="0 0 440 310" className="reference-svg" role="img">
          <rect width="440" height="310" fill="#f2f2f2" />
          <circle cx="38" cy="38" r="24" fill="#d8d8d8" />
          <g transform="translate(46 52)">
            <polygon points="20,94 166,0 312,94 312,238 20,238" fill="#cf1987" />
            <polygon points="20,94 166,94 312,94 166,38" fill="#5fe0ff" />
            <path d="M20 238 L166 146 L312 238" fill="none" stroke="#c2167d" strokeWidth="2" opacity="0.28" />
          </g>
          <g transform="translate(250 156)">
            <rect x="0" y="0" width="142" height="110" rx="6" fill="#23aef0" />
            <polygon points="0,0 71,54 142,0" fill="#34bbfa" />
            <line x1="0" y1="110" x2="71" y2="54" stroke="#0e8fbe" strokeWidth="2.2" opacity="0.65" />
            <line x1="142" y1="110" x2="71" y2="54" stroke="#0e8fbe" strokeWidth="2.2" opacity="0.65" />
          </g>
        </svg>
      </div>

      <div className="reference-diagram">
        <svg viewBox="0 0 440 250" className="reference-svg" role="img">
          <rect width="440" height="250" fill="#63aebe" />
          <g transform="translate(38 26)">
            <polygon points="0,132 116,92 300,144 142,214" fill="#a585c7" />
            <polygon points="14,120 0,132 108,192 142,214 162,198 80,148" fill="#7d668d" />
            <polygon points="116,92 146,76 334,132 300,144" fill="#c395df" />
            <text x="146" y="42" fill="#ffffff" fontSize="22" fontWeight="700">Overlap</text>
            <text x="0" y="170" fill="#ffffff" fontSize="22" fontWeight="700">Height</text>
            <text x="196" y="206" fill="#ffffff" fontSize="22" fontWeight="700">Width</text>
            <line x1="216" y1="54" x2="216" y2="84" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="208" y1="54" x2="224" y2="54" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="208" y1="84" x2="224" y2="84" stroke="#ffffff" strokeWidth="2.5" />
          </g>
        </svg>
      </div>

      <div className="reference-fill">
        <span>Preview fill</span>
        <div className="reference-fill-box" style={{ background: fill }} />
      </div>
    </div>
  );
}

function EnvelopeGeometry({
  width,
  height,
  overlap,
}: {
  width: number;
  height: number;
  overlap: number;
}) {
  const W = clamp(width, 100, 260);
  const H = clamp(height, 70, 180);
  const O = clamp(overlap, 6, W * 0.12);

  const pageW = 980;
  const pageH = 720;

  const cx = 505;
  const cy = 360;

  const p1 = { x: cx - W * 0.52, y: cy - H * 0.10 };
  const p2 = { x: cx - W * 0.22, y: cy - H * 0.68 };
  const p3 = { x: cx + W * 0.18, y: cy - H * 0.68 };
  const p4 = { x: cx + W * 0.58, y: cy - H * 0.34 };
  const p5 = { x: cx + W * 0.44, y: cy + H * 0.08 };
  const p6 = { x: cx + W * 0.22, y: cy + H * 0.70 };
  const p7 = { x: cx - W * 0.20, y: cy + H * 0.70 };
  const p8 = { x: cx - W * 0.56, y: cy + H * 0.36 };
  const p9 = { x: cx - W * 0.72, y: cy + H * 0.06 };
  const p10 = { x: cx - W * 0.58, y: cy - H * 0.20 };

  const blueA = { x: cx - W * 0.42, y: cy - H * 0.02 };
  const blueB = { x: cx + W * 0.02, y: cy - H * 0.66 };
  const blueC = { x: cx + W * 0.28, y: cy - H * 0.04 };
  const blueD = { x: cx - W * 0.30, y: cy + H * 0.68 };

  const outerPath = `
    M ${p1.x} ${p1.y}
    L ${p2.x} ${p2.y}
    Q ${p2.x + O * 0.2} ${p2.y - O * 0.8} ${p3.x} ${p3.y}
    L ${p4.x} ${p4.y}
    Q ${p4.x + O * 0.9} ${p4.y - O * 0.05} ${p5.x} ${p5.y}
    L ${p6.x} ${p6.y}
    Q ${p6.x - O * 0.2} ${p6.y + O * 0.8} ${p7.x} ${p7.y}
    L ${p8.x} ${p8.y}
    Q ${p8.x - O * 0.9} ${p8.y + O * 0.05} ${p9.x} ${p9.y}
    L ${p10.x} ${p10.y}
    Q ${p10.x - O * 0.2} ${p10.y - O * 0.8} ${p1.x} ${p1.y}
  `;

  return (
    <div className="geometry-card">
      <svg viewBox={`0 0 ${pageW} ${pageH}`} className="geometry-svg" role="img">
        <rect width={pageW} height={pageH} fill="#ffffff" />
        <rect x="28" y="28" width={pageW - 56} height={pageH - 56} fill="none" stroke="#d5d5d5" />
        <text x="62" y="72" fontSize="18" fill="#222">
          Envelope {Math.round(width)}×{Math.round(height)} (mm)
        </text>

        <path
          d={outerPath}
          fill="none"
          stroke="#ff1493"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <line x1={blueA.x} y1={blueA.y} x2={blueB.x} y2={blueB.y} stroke="#38aefc" strokeWidth="3" />
        <line x1={blueB.x} y1={blueB.y} x2={blueC.x} y2={blueC.y} stroke="#38aefc" strokeWidth="3" />
        <line x1={blueC.x} y1={blueC.y} x2={blueD.x} y2={blueD.y} stroke="#38aefc" strokeWidth="3" />
        <line x1={blueD.x} y1={blueD.y} x2={blueA.x} y2={blueA.y} stroke="#38aefc" strokeWidth="3" />
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
  const [panelColor, setPanelColor] = useState<string>("#d2a8bf");

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
        <EnvelopeGeometry
          width={a}
          height={b}
          overlap={paramValues.overlap ?? 12.5}
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
  }, [templateId, a, b, paramValues.overlap, activeTemplate.name, scale, pageSize, exportMode, panelColor]);

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
              <EnvelopeReferenceCard fill={panelColor} />
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
