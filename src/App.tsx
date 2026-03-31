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

function mul(a: Pt, k: number): Pt {
  return { x: a.x * k, y: a.y * k };
}

function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function line(a: Pt, b: Pt) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function polygon(points: Pt[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function pathFromPoints(points: Pt[], close = true) {
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  return close ? `${d} Z` : d;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function scaleDivisor(scale: ScaleMode) {
  return scale === "1:6" ? 6 : 12;
}

function miniValue(real: number, scale: ScaleMode) {
  return Number((real / scaleDivisor(scale)).toFixed(2));
}

function rotatedRectangle(
  center: Pt,
  width: number,
  height: number,
  angleDeg: number
) {
  const a = (angleDeg * Math.PI) / 180;
  const ux = pt(Math.cos(a), Math.sin(a));
  const uy = pt(-Math.sin(a), Math.cos(a));

  const hx = width / 2;
  const hy = height / 2;

  const TL = add(center, add(mul(ux, -hx), mul(uy, -hy)));
  const TR = add(center, add(mul(ux, hx), mul(uy, -hy)));
  const BR = add(center, add(mul(ux, hx), mul(uy, hy)));
  const BL = add(center, add(mul(ux, -hx), mul(uy, hy)));

  return { TL, TR, BR, BL, ux, uy };
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
  const W = clamp(width, 80, 260);
  const H = clamp(height, 50, 180);
  const O = clamp(overlap, 0, 30);
  const R = clamp(radius, 0, 20);

  const pageW = 980;
  const pageH = 720;
  const center = pt(520, 380);

  // Fixed rotation so the inner blue panel always stays a true rectangle
  const angle = -36;

  const { TL, TR, BR, BL, ux, uy } = rotatedRectangle(center, W * 1.05, H * 1.02, angle);

  // Outward normals for each edge
  const nTop = mul(uy, -1);
  const nRight = ux;
  const nBottom = uy;
  const nLeft = mul(ux, -1);

  // Flap depths
  const topDepth = H * 0.62 + O * 0.8;
  const sideDepth = H * 0.42 + O * 0.25;
  const bottomDepth = H * 0.58 + O * 0.55;

  // Small tangential extension to resemble the reference geometry
  const skewTop = W * 0.06;
  const skewSide = H * 0.06;
  const skewBottom = W * 0.04;

  // Top flap outer points (parallel to top edge)
  const topOuterL = add(add(TL, mul(nTop, topDepth)), mul(ux, -skewTop));
  const topOuterR = add(add(TR, mul(nTop, topDepth)), mul(ux, skewTop));

  // Right flap outer points
  const rightOuterT = add(add(TR, mul(nRight, sideDepth)), mul(uy, -skewSide));
  const rightOuterB = add(add(BR, mul(nRight, sideDepth)), mul(uy, skewSide));

  // Bottom flap outer points
  const bottomOuterR = add(add(BR, mul(nBottom, bottomDepth)), mul(ux, skewBottom));
  const bottomOuterL = add(add(BL, mul(nBottom, bottomDepth)), mul(ux, -skewBottom));

  // Left flap outer points
  const leftOuterB = add(add(BL, mul(nLeft, sideDepth)), mul(uy, skewSide));
  const leftOuterT = add(add(TL, mul(nLeft, sideDepth)), mul(uy, -skewSide));

  // Contour order around the shape
  const outerPoints = [
    TL,
    topOuterL,
    topOuterR,
    TR,
    rightOuterT,
    rightOuterB,
    BR,
    bottomOuterR,
    bottomOuterL,
    BL,
    leftOuterB,
    leftOuterT,
  ];

  // Slight rounding effect by smoothing only visually with joins; radius retained as displayed param
  const outerPath = pathFromPoints(outerPoints, true);

  const viewW = pageW;
  const viewH = pageH;

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

        {/* editable zone tint */}
        <path d={outerPath} fill={fill} fillOpacity="0.05" stroke="none" />

        {/* cut line */}
        <path
          d={outerPath}
          fill="none"
          stroke="#ff1493"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* blue panel outline: always a true rectangle */}
        <path d={line(TL, TR)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(TR, BR)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(BR, BL)} fill="none" stroke="#38aefc" strokeWidth="3" />
        <path d={line(BL, TL)} fill="none" stroke="#38aefc" strokeWidth="3" />

        {/* fold lines from panel to flaps */}
        <path d={line(TL, topOuterL)} fill="none" stroke="#38aefc" strokeWidth="0" />
        <path d={line(TR, topOuterR)} fill="none" stroke="#38aefc" strokeWidth="0" />
        <path d={line(TR, rightOuterT)} fill="none" stroke="#38aefc" strokeWidth="0" />
        <path d={line(BR, rightOuterB)} fill="none" stroke="#38aefc" strokeWidth="0" />
        <path d={line(BR, bottomOuterR)} fill="none" stroke="#38aefc" strokeWidth="0" />
        <path d={line(BL, bottomOuterL)} fill="none" stroke="#38aefc" strokeWidth="0" />
        <path d={line(BL, leftOuterB)} fill="none" stroke="#38aefc" strokeWidth="0" />
        <path d={line(TL, leftOuterT)} fill="none" stroke="#38aefc" strokeWidth="0" />
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
