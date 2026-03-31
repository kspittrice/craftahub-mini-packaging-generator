import { useMemo, useState } from "react";

type ScaleMode = "1:6" | "1:12";
type PageSize = "A4" | "A3";
type ExportMode = "print" | "cricut";

type Pt = { x: number; y: number };

function pt(x: number, y: number): Pt {
  return { x, y };
}

function add(a: Pt, b: Pt): Pt {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a: Pt, b: Pt): Pt {
  return { x: a.x - b.x, y: a.y - b.y };
}

function mul(v: Pt, k: number): Pt {
  return { x: v.x * k, y: v.y * k };
}

function len(v: Pt): number {
  return Math.hypot(v.x, v.y);
}

function normalize(v: Pt): Pt {
  const l = len(v) || 1;
  return { x: v.x / l, y: v.y / l };
}

function perp(v: Pt): Pt {
  return { x: -v.y, y: v.x };
}

function dot(a: Pt, b: Pt): number {
  return a.x * b.x + a.y * b.y;
}

function line(a: Pt, b: Pt) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function polyline(points: Pt[]) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
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

function EnvelopeGeometry({
  width,
  height,
  overlap,
  radius,
  scale,
  fill,
}: {
  width: number;
  height: number;
  overlap: number;
  radius: number;
  scale: ScaleMode;
  fill: string;
}) {
  // User enters real size; geometry is built immediately in miniature size.
  const k = scale === "1:6" ? 1 / 6 : 1 / 12;

  const W = clamp(width * k, 4, 260);
  const H = clamp(height * k, 4, 180);
  const O = clamp(overlap * k, 0, 30);
  const _R = clamp(radius * k, 0, 20); // reserved for next step

  // Reference screenshot proportions are based on a 150 x 100 object.
  // We keep the successful outer contour approach, but now scale it using mini-size.
  const refW = 150 / 6; // 25 mm miniature reference width
  const refH = 100 / 6; // 16.67 mm miniature reference height

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

  // Pink outer contour from the closest version
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

  // Reference blue fold shape from the closest version
  const rawLeft = map(320, 608);
  const rawTop = map(757, 321);
  const rawRight = map(948, 607);

  // Build a TRUE rotated rectangle from three reference points
  // so the blue zone always keeps 90° corners.
  const ux = normalize(sub(rawTop, rawLeft));
  const uy = normalize(perp(ux));

  const rectWidth = len(sub(rawTop, rawLeft));
  let rectHeight = Math.abs(dot(sub(rawRight, rawTop), uy));

  // Let overlap influence only position slightly, not the angles.
  const overlapShift = (O - 12.5 * k) * 3;
  const shift = mul(ux, -overlapShift);

  const tl = add(rawLeft, shift);
  const tr = add(rawTop, shift);
  const br = add(add(rawTop, shift), mul(uy, rectHeight));
  const bl = add(add(rawLeft, shift), mul(uy, rectHeight));

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
          Envelope mini template · {W.toFixed(2)} × {H.toFixed(2)} mm
        </text>

        <path
          d={`${polyline([...outer, outer[0]])} Z`}
          fill={fill}
          fillOpacity="0.05"
          stroke="none"
        />

        <path
          d={`${polyline([...outer, outer[0]])} Z`}
          fill="none"
          stroke="#ff1493"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Blue zone = always a true rectangle */}
        <path d={line(tl, tr)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(tr, br)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(br, bl)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(bl, tl)} fill="none" stroke="#38aefc" strokeWidth="3" />
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
  const miniOverlap = useMemo(() => miniValue(overlap, scale), [overlap, scale]);
  const miniRadius = useMemo(() => miniValue(radius, scale), [radius, scale]);

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
            <h2>Miniature values used for geometry</h2>
            <div className="mini-grid">
              <div className="mini-item">
                <strong>{miniWidth} mm</strong>
                <span>Width</span>
              </div>
              <div className="mini-item">
                <strong>{miniHeight} mm</strong>
                <span>Height</span>
              </div>
              <div className="mini-item">
                <strong>{miniOverlap} mm</strong>
                <span>Overlap</span>
              </div>
              <div className="mini-item">
                <strong>{miniRadius} mm</strong>
                <span>Radius</span>
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
              scale={scale}
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
