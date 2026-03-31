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

function polygon(points: Pt[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
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
  const W = clamp(width, 60, 260);
  const H = clamp(height, 40, 180);
  const O = clamp(overlap, 0, H * 0.35);
  const R = clamp(radius, 0, Math.min(18, H * 0.18));

  const bodyX = 260;
  const bodyY = 160;

  const bodyTL = pt(bodyX, bodyY);
  const bodyTR = pt(bodyX + W, bodyY);
  const bodyBR = pt(bodyX + W, bodyY + H);
  const bodyBL = pt(bodyX, bodyY + H);

  const leftTip = pt(bodyX - H * 0.34, bodyY + H / 2);
  const rightTip = pt(bodyX + W + H * 0.34, bodyY + H / 2);

  const topPeak = pt(bodyX + W / 2, bodyY - H * 0.62);
  const bottomPeak = pt(bodyX + W / 2, bodyY + H + H * 0.62);

  const topLeftBase = pt(bodyX + O, bodyY);
  const topRightBase = pt(bodyX + W - O, bodyY);

  const bottomLeftBase = pt(bodyX + O, bodyY + H);
  const bottomRightBase = pt(bodyX + W - O, bodyY + H);

  const viewBoxWidth = bodyX + W + H * 0.55 + 120;
  const viewBoxHeight = bodyY + H + H * 0.75 + 120;

  return (
    <div className="geometry-card">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="geometry-svg"
        role="img"
      >
        <rect width={viewBoxWidth} height={viewBoxHeight} fill="#ffffff" />
        <rect
          x="28"
          y="28"
          width={viewBoxWidth - 56}
          height={viewBoxHeight - 56}
          fill="none"
          stroke="#d9d4cc"
        />

        <text x="52" y="62" fontSize="16" fill="#222">
          Envelope {Math.round(width)}×{Math.round(height)} (mm)
        </text>

        {/* CUT LINES */}
        <polygon
          points={polygon([topLeftBase, topPeak, topRightBase])}
          fill={fill}
          fillOpacity="0.10"
          stroke="#ff1493"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <polygon
          points={polygon([bodyTL, leftTip, bodyBL])}
          fill={fill}
          fillOpacity="0.10"
          stroke="#ff1493"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <polygon
          points={polygon([bodyTR, rightTip, bodyBR])}
          fill={fill}
          fillOpacity="0.10"
          stroke="#ff1493"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <polygon
          points={polygon([bottomLeftBase, bottomPeak, bottomRightBase])}
          fill={fill}
          fillOpacity="0.10"
          stroke="#ff1493"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <rect
          x={bodyX}
          y={bodyY}
          width={W}
          height={H}
          rx={R}
          ry={R}
          fill="none"
          stroke="#ff1493"
          strokeWidth="5"
        />

        {/* FOLD LINES */}
        <path
          d={line(bodyTL, topPeak)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
          strokeDasharray="6 5"
        />
        <path
          d={line(bodyTR, topPeak)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
          strokeDasharray="6 5"
        />

        <path
          d={line(bodyTL, leftTip)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
          strokeDasharray="6 5"
        />
        <path
          d={line(bodyBL, leftTip)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
          strokeDasharray="6 5"
        />

        <path
          d={line(bodyTR, rightTip)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
          strokeDasharray="6 5"
        />
        <path
          d={line(bodyBR, rightTip)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
          strokeDasharray="6 5"
        />

        <path
          d={line(bodyBL, bottomPeak)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
          strokeDasharray="6 5"
        />
        <path
          d={line(bodyBR, bottomPeak)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
          strokeDasharray="6 5"
        />

        {/* BODY DIAGONALS */}
        <path
          d={line(bodyTL, bodyBR)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
        />
        <path
          d={line(bodyTR, bodyBL)}
          fill="none"
          stroke="#35a9ff"
          strokeWidth="2.2"
        />
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
