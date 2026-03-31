import React from "react";

type Pt = { x: number; y: number };

function pt(x: number, y: number): Pt {
  return { x, y };
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
  // Build geometry directly in miniature size
  const k = 1 / scale;

  const W = clamp(width * k, 4, 260);
  const H = clamp(height * k, 4, 180);
  const O = clamp(overlap * k, 0, 30);

  // Reference screenshot proportions from the previously restored working version
  // 150x100 real at 1:6 => 25 x 16.667 miniature reference
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

  // Pink outer contour — exactly from your restored base
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

  // Blue fold shape — exactly from your restored base
  const innerLeft = map(320, 608);
  const innerTop = map(757, 321);
  const innerRight = map(948, 607);
  const innerBottom = map(509, 893);

  // Small overlap-dependent adjustment from the restored base
  const overlapShift = (O - 12.5 * k) * 3;
  const adjustedTop = pt(innerTop.x - overlapShift, innerTop.y);
  const adjustedBottom = pt(innerBottom.x + overlapShift * 0.5, innerBottom.y);

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

      <path d={line(innerLeft, adjustedTop)} fill="none" stroke="#38aefc" strokeWidth="3" />
      <path d={line(adjustedTop, innerRight)} fill="none" stroke="#38aefc" strokeWidth="3" />
      <path d={line(innerRight, adjustedBottom)} fill="none" stroke="#38aefc" strokeWidth="3" />
      <path d={line(adjustedBottom, innerLeft)} fill="none" stroke="#38aefc" strokeWidth="3" />
    </svg>
  );
};
