import React from "react";

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface Props {
  width: number;    // real mm
  height: number;   // real mm
  overlap: number;  // real mm
  scale: number;    // 6 or 12
  color: string;
}

export const Envelope: React.FC<Props> = ({
  width,
  height,
  overlap,
  scale,
  color,
}) => {
  // Geometry is built directly in miniature size
  const k = 1 / scale;

  const W = clamp(width * k, 4, 260);
  const H = clamp(height * k, 4, 180);
  const O = clamp(overlap * k, 0, 30);

  // Reference screenshot proportions from the restored working version
  // 150x100 real @ 1:6 => 25 x 16.667 miniature reference
  const refW = 150 / 6;
  const refH = 100 / 6;

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

  // Pink contour kept exactly from restored base
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

  // Reference blue points from restored base
  const rawLeft = map(320, 608);
  const rawTop = map(757, 321);
  const rawRight = map(948, 607);

  // Long side direction
  const ux = normalize(sub(rawTop, rawLeft));

  // Perpendicular direction -> guarantees 90° angles
  let uy = normalize(perp(ux));

  // Keep rectangle on the same side as the old geometry
  const testHeight = dot(sub(rawRight, rawTop), uy);
  if (testHeight < 0) {
    uy = mul(uy, -1);
  }

  const rectWidth = len(sub(rawTop, rawLeft));
  const rectHeight = Math.abs(dot(sub(rawRight, rawTop), uy));

  // Overlap may shift the rectangle slightly, but must not distort angles
  const overlapShift = (O - 12.5 * k) * 2.0;
  const shift = mul(ux, -overlapShift * 0.35);

  const tl = add(rawLeft, shift);
  const tr = add(rawTop, shift);
  const br = add(tr, mul(uy, rectHeight));
  const bl = add(tl, mul(uy, rectHeight));

  const viewW = (maxX - minX) * sx + 360;
  const viewH = (maxY - minY) * sy + 280;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto">
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
        fill={color}
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

      {/* Blue zone = true rectangle, always 90° */}
      <path d={line(tl, tr)} fill="none" stroke="#38aefc" strokeWidth="3" />
      <path d={line(tr, br)} fill="none" stroke="#38aefc" strokeWidth="3" />
      <path d={line(br, bl)} fill="none" stroke="#38aefc" strokeWidth="3" />
      <path d={line(bl, tl)} fill="none" stroke="#38aefc" strokeWidth="3" />
    </svg>
  );
};
