import React from "react";

type Pt = { x: number; y: number };

interface EnvelopeProps {
  width: number;    // real mm
  height: number;   // real mm
  overlap: number;  // real mm
  radius: number;   // real mm
  scale: number;    // 6 or 12
  color: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pt(x: number, y: number): Pt {
  return { x, y };
}

function line(a: Pt, b: Pt) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

export const Envelope: React.FC<EnvelopeProps> = ({
  width,
  height,
  overlap,
  radius,
  scale,
  color,
}) => {
  // Build geometry directly in miniature mm
  const k = 1 / scale;

  const w = clamp(width * k, 2, 300);
  const h = clamp(height * k, 2, 300);
  const o = clamp(overlap * k, 0, 100);
  const r = clamp(radius * k, 0, Math.min(w, h) * 0.2);

  // Central panel
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -h / 2;
  const y1 = h / 2;

  // Envelope flap logic
  // Top flap is the main closing flap
  const topFlapDepth = h * 0.58 + o;
  const bottomFlapDepth = h * 0.42;
  const sideFlapDepth = h * 0.48;

  const topTip = pt(0, y0 - topFlapDepth);
  const bottomTip = pt(0, y1 + bottomFlapDepth);
  const leftTip = pt(x0 - sideFlapDepth, 0);
  const rightTip = pt(x1 + sideFlapDepth, 0);

  // Slight inset on the base of top/bottom flaps for a cleaner envelope look
  const topInset = Math.min(w * 0.16, o + w * 0.05);
  const bottomInset = Math.min(w * 0.12, w * 0.12);

  const topLeftBase = pt(x0 + topInset, y0);
  const topRightBase = pt(x1 - topInset, y0);
  const bottomLeftBase = pt(x0 + bottomInset, y1);
  const bottomRightBase = pt(x1 - bottomInset, y1);

  // Outer cut contour
  const cutPath = `
    M ${topLeftBase.x} ${topLeftBase.y}
    L ${topTip.x} ${topTip.y}
    L ${topRightBase.x} ${topRightBase.y}
    L ${x1} ${y0}
    L ${rightTip.x} ${rightTip.y}
    L ${x1} ${y1}
    L ${bottomRightBase.x} ${bottomRightBase.y}
    L ${bottomTip.x} ${bottomTip.y}
    L ${bottomLeftBase.x} ${bottomLeftBase.y}
    L ${x0} ${y1}
    L ${leftTip.x} ${leftTip.y}
    L ${x0} ${y0}
    Z
  `;

  // Fold lines:
  // 1. central rectangle
  // 2. diagonals from panel corners to flap tips
  const foldPath = `
    ${line(pt(x0, y0), pt(x1, y0))}
    ${line(pt(x1, y0), pt(x1, y1))}
    ${line(pt(x1, y1), pt(x0, y1))}
    ${line(pt(x0, y1), pt(x0, y0))}

    ${line(pt(x0, y0), leftTip)}
    ${line(pt(x0, y1), leftTip)}

    ${line(pt(x1, y0), rightTip)}
    ${line(pt(x1, y1), rightTip)}

    ${line(topLeftBase, topTip)}
    ${line(topRightBase, topTip)}

    ${line(bottomLeftBase, bottomTip)}
    ${line(bottomRightBase, bottomTip)}
  `;

  // Optional visible blue panel fill
  const panelFillPath = `
    M ${x0} ${y0}
    L ${x1} ${y0}
    L ${x1} ${y1}
    L ${x0} ${y1}
    Z
  `;

  // Dynamic viewBox
  const margin = Math.max(w, h) * 0.9;
  const vbX = leftTip.x - margin * 0.35;
  const vbY = topTip.y - margin * 0.35;
  const vbW = rightTip.x - leftTip.x + margin * 0.7;
  const vbH = bottomTip.y - topTip.y + margin * 0.7;

  return (
    <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} className="w-full h-auto">
      {/* editable / design zone */}
      <path d={panelFillPath} fill={color} fillOpacity="0.18" />

      {/* optional rounded-corner visual hint for panel */}
      <rect
        x={x0}
        y={y0}
        width={w}
        height={h}
        rx={r}
        ry={r}
        fill="none"
        stroke="#38AEFC"
        strokeWidth="0.7"
        strokeDasharray="2,2"
      />

      {/* fold lines */}
      <path
        d={foldPath}
        fill="none"
        stroke="#38AEFC"
        strokeWidth="0.7"
        strokeDasharray="2,2"
      />

      {/* cut line */}
      <path
        d={cutPath}
        fill="none"
        stroke="#FF1493"
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};
