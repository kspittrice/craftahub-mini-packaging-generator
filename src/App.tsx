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
    Q ${p2.x + R * 0.2} ${p2.y - R * 0.8} ${p3.x} ${p3.y}
    L ${p4.x} ${p4.y}
    Q ${p4.x + R * 1.0} ${p4.y} ${p5.x} ${p5.y}
    L ${p6.x} ${p6.y}
    Q ${p6.x - R * 0.2} ${p6.y + R * 0.8} ${p7.x} ${p7.y}
    L ${p8.x} ${p8.y}
    Q ${p8.x - R * 1.0} ${p8.y} ${p9.x} ${p9.y}
    L ${p10.x} ${p10.y}
    Q ${p10.x - R * 0.2} ${p10.y - R * 0.8} ${p1.x} ${p1.y}
  `;

  return (
    <div className="geometry-card">
      <svg viewBox={`0 0 ${pageW} ${pageH}`} className="geometry-svg" role="img">
        <rect width={pageW} height={pageH} fill="#ffffff" />
        <rect x="28" y="28" width={pageW - 56} height={pageH - 56} fill="none" stroke="#d9d4cc" />
        <text x="62" y="72" fontSize="16" fill="#222">
          Envelope {Math.round(width)}×{Math.round(height)} (mm)
        </text>

        <path
          d={outerPath}
          fill={fill}
          fillOpacity="0.06"
          stroke="#ff1493"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <path d={line(blueA, blueB)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(blueB, blueC)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(blueC, blueD)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(blueD, blueA)} fill="none" stroke="#38aefc" strokeWidth="3" />
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
