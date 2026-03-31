import { useMemo, useState } from "react";

type ScaleMode = "1:6" | "1:12";
type PageSize = "A4" | "A3";
type ExportMode = "print" | "cricut";

type Pt = { x: number; y: number };

function pt(x: number, y: number): Pt {
  return { x, y };
}

function scaleDivisor(scale: ScaleMode) {
  return scale === "1:6" ? 6 : 12;
}

function miniValue(real: number, scale: ScaleMode) {
  return Number((real / scaleDivisor(scale)).toFixed(2));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function line(a: Pt, b: Pt) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function polyline(points: Pt[]) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function EnvelopeGeometry({
  width,
  height,
  overlap,
  fill,
}: {
  width: number;
  height: number;
  overlap: number;
  fill: string;
}) {
  const W = clamp(width, 80, 260);
  const H = clamp(height, 50, 180);
  const O = clamp(overlap, 0, 30);

  // Reference points taken from the user's provided 150x100 screenshot
  // and then scaled to current width/height.
  const refW = 150;
  const refH = 100;

  // Bounding box of the screenshot geometry
  const minX = 231;
  const minY = 279;
  const maxX = 1020;
  const maxY = 931;

  const sx = W / refW;
  const sy = H / refH;

  const offsetX = 180;
  const offsetY = 140;

  function map(x: number, y: number): Pt {
    return pt((x - minX) * sx + offsetX, (y - minY) * sy + offsetY);
  }

  // Outer contour, tuned from screenshot
  const outer = [
    map(231, 893),
    map(320, 608),
    map(293, 570),
    map(409, 279),
    map(728, 279),
    map(757, 321),
    map(1020, 321),
    map(948, 607),
    map(974, 645),
    map(839, 931),
    map(535, 931),
    map(509, 893),
  ];

  // Inner blue fold-shape from screenshot
  const innerLeft = map(320, 608);
  const innerTop = map(757, 321);
  const innerRight = map(948, 607);
  const innerBottom = map(509, 893);

  // Small overlap-dependent adjustment to mimic parameter effect
  const overlapShift = (O - 12.5) * 3;
  const adjustedTop = pt(innerTop.x - overlapShift, innerTop.y);
  const adjustedBottom = pt(innerBottom.x + overlapShift * 0.5, innerBottom.y);

  const viewW = (maxX - minX) * sx + 360;
  const viewH = (maxY - minY) * sy + 280;

  return (
    <div className="geometry-card">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="geometry-svg" role="img">
        <rect width={viewW} height={viewH} fill="#ffffff" />
        <rect
          x="28"
          y="28"
          width={viewW - 56}
          height={viewH - 56}
          fill="none"
          stroke="#d9d4cc"
        />

        <text x="62" y="72" fontSize="16" fill="#222">
          Envelope {Math.round(width)}×{Math.round(height)} (mm)
        </text>

        {/* soft editable zone tint */}
        <path
          d={`${polyline([...outer, outer[0]])} Z`}
          fill={fill}
          fillOpacity="0.05"
          stroke="none"
        />

        {/* outer cut line */}
        <path
          d={`${polyline([...outer, outer[0]])} Z`}
          fill="none"
          stroke="#ff1493"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* fold lines */}
        <path d={line(innerLeft, adjustedTop)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(adjustedTop, innerRight)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(innerRight, adjustedBottom)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(adjustedBottom, innerLeft)} fill="none" stroke="#38aefc" strokeWidth="3" />
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
            <p className="muted">Geometry-first module.</p>
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
