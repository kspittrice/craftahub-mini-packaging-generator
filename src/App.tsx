import { useMemo, useState } from "react";

type ScaleMode = "1:6" | "1:12";
type PageSize = "A4" | "A3";
type ExportMode = "print" | "cricut";

function scaleDivisor(scale: ScaleMode) {
  return scale === "1:6" ? 6 : 12;
}

function miniValue(real: number, scale: ScaleMode) {
  return Number((real / scaleDivisor(scale)).toFixed(2));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Pt = { x: number; y: number };

function pt(x: number, y: number): Pt {
  return { x, y };
}

function line(a: Pt, b: Pt) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function EnvelopeGeometry({
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
  const W = clamp(width, 100, 260);
  const H = clamp(height, 70, 180);
  const O = clamp(overlap, 6, W * 0.14);
  const R = clamp(radius, 0, 18);

  const pageW = 980;
  const pageH = 720;

  // inner tilted panel, closer to screenshot proportions
  const innerTL = pt(420, 315);
  const innerTR = pt(560, 235);
  const innerBR = pt(605, 335);
  const innerBL = pt(445, 455);

  // outer contour, hand-tuned to resemble the reference screenshot
  const a = pt(355, 445);
  const b = pt(300, 335);
  const c = pt(360, 190);
  const d = pt(520, 190);
  const e = pt(585, 235);
  const f = pt(705, 235);
  const g = pt(800, 235);
  const h = pt(860, 285);
  const i = pt(812, 410);
  const j = pt(748, 490);
  const k = pt(672, 590);
  const l = pt(430, 590);
  const m = pt(355, 495);

  const outerPath = `
    M ${a.x} ${a.y}
    L ${b.x} ${b.y}
    Q ${b.x - R * 0.6} ${b.y - R * 0.4} ${c.x} ${c.y}
    Q ${c.x + R * 0.4} ${c.y - R * 0.2} ${d.x} ${d.y}
    L ${e.x} ${e.y}
    L ${g.x} ${g.y}
    Q ${g.x + R * 1.4} ${g.y} ${h.x} ${h.y}
    L ${i.x} ${i.y}
    L ${j.x} ${j.y}
    Q ${j.x - R * 0.5} ${j.y + R * 0.8} ${k.x} ${k.y}
    Q ${k.x - R * 0.6} ${k.y} ${l.x} ${l.y}
    L ${m.x} ${m.y}
    L ${a.x} ${a.y}
  `;

  return (
    <div className="geometry-card">
      <svg viewBox={`0 0 ${pageW} ${pageH}`} className="geometry-svg" role="img">
        <rect width={pageW} height={pageH} fill="#ffffff" />
        <rect x="28" y="28" width={pageW - 56} height={pageH - 56} fill="none" stroke="#d9d4cc" />
        <text x="62" y="72" fontSize="16" fill="#222">
          Envelope {Math.round(width)}×{Math.round(height)} (mm)
        </text>

        {/* subtle fill only to show editable area */}
        <path d={outerPath} fill={fill} fillOpacity="0.06" stroke="none" />

        {/* cut line */}
        <path
          d={outerPath}
          fill="none"
          stroke="#ff1493"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* fold lines / inner panel */}
        <path d={line(innerTL, innerTR)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(innerTR, innerBR)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(innerBR, innerBL)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(innerBL, innerTL)} fill="none" stroke="#38aefc" strokeWidth="3" />

        {/* diagonals to side flaps */}
        <path d={line(b, innerTL)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(m, innerBL)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(e, innerTR)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(i, innerBR)} fill="none" stroke="#38aefc" strokeWidth="3" />
      </svg>
    </div>
  );
}

export default function App() {
  const [scale, setScale] = useState<ScaleMode>("1:6");
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [exportMode, setExportMode] = useState<ExportMode>("print");

  const [width, setWidth] = useState<number>(150);
  const [height, setHeight] = useState<number>(100);
  const [overlap, setOverlap] = useState<number>(12.5);
  const [radius, setRadius] = useState<number>(7);
  const [panelColor, setPanelColor] = useState<string>("#d2a8bf");

  const miniWidth = useMemo(() => miniValue(width, scale), [width, scale]);
  const miniHeight = useMemo(() => miniValue(height, scale), [height, scale]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Mini Packaging Generator</h1>
          <p>Create printable miniature packaging templates in 1:6 and 1:12 scale.</p>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>Template</h2>
            <div className="static-template">Envelope</div>
            <p className="muted">Geometry-first test module.</p>
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
              <span>Width</span>
              <input
                className="control"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </label>

            <label className="field">
              <span>Height</span>
              <input
                className="control"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </label>

            <label className="field">
              <span>Overlap</span>
              <input
                className="control"
                type="number"
                step="0.1"
                value={overlap}
                onChange={(e) => setOverlap(Number(e.target.value))}
              />
            </label>

            <label className="field">
              <span>Rounded Corners Radius</span>
              <input
                className="control"
                type="number"
                step="0.1"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </label>
          </section>

          <section className="panel">
            <h2>Miniature size preview</h2>
            <div className="mini-grid">
              <div className="mini-item">
                <strong>{width} mm</strong>
                <span>{miniWidth} mm</span>
              </div>
              <div className="mini-item">
                <strong>{height} mm</strong>
                <span>{miniHeight} mm</span>
              </div>
            </div>
          </section>
        </aside>

        <section className="center-stage">
          <section className="panel">
            <h2>Work area</h2>
            <EnvelopeGeometry
              width={width}
              height={height}
              overlap={overlap}
              radius={radius}
              fill={panelColor}
            />
          </section>
        </section>

        <aside className="sidebar">
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
            <h2>Panel color</h2>
            <input
              className="color-picker"
              type="color"
              value={panelColor}
              onChange={(e) => setPanelColor(e.target.value)}
            />
          </section>
        </aside>
      </main>
    </div>
  );
}
