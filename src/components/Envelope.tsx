import React from "react";

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
  const k = 1 / scale;

  // Build geometry directly in miniature mm
  const w = Math.max(2, width * k);
  const h = Math.max(2, height * k);
  const o = Math.max(0, overlap * k);

  // Central rectangular panel
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -h / 2;
  const y1 = h / 2;

  // Symmetric flap tips
  const topTip = { x: 0, y: y0 - (h / 2.2) - o };
  const bottomTip = { x: 0, y: y1 + (h / 2.2) + o };
  const leftTip = { x: x0 - (w / 2.2) - o, y: 0 };
  const rightTip = { x: x1 + (w / 2.2) + o, y: 0 };

  // Outer cut contour
  const cutPath = `
    M ${x0} ${y0}
    L ${topTip.x} ${topTip.y}
    L ${x1} ${y0}
    L ${rightTip.x} ${rightTip.y}
    L ${x1} ${y1}
    L ${bottomTip.x} ${bottomTip.y}
    L ${x0} ${y1}
    L ${leftTip.x} ${leftTip.y}
    Z
  `;

  // Fold / score lines
  const foldPath = `
    M ${x0} ${y0} L ${x1} ${y0}
    M ${x1} ${y0} L ${x1} ${y1}
    M ${x1} ${y1} L ${x0} ${y1}
    M ${x0} ${y1} L ${x0} ${y0}

    M ${x0} ${y0} L ${topTip.x} ${topTip.y}
    M ${x1} ${y0} L ${topTip.x} ${topTip.y}

    M ${x1} ${y0} L ${rightTip.x} ${rightTip.y}
    M ${x1} ${y1} L ${rightTip.x} ${rightTip.y}

    M ${x0} ${y1} L ${bottomTip.x} ${bottomTip.y}
    M ${x1} ${y1} L ${bottomTip.x} ${bottomTip.y}

    M ${x0} ${y0} L ${leftTip.x} ${leftTip.y}
    M ${x0} ${y1} L ${leftTip.x} ${leftTip.y}
  `;

  // Dynamic viewBox
  const margin = Math.max(w, h) * 0.9;
  const vbX = leftTip.x - margin * 0.25;
  const vbY = topTip.y - margin * 0.25;
  const vbW = rightTip.x - leftTip.x + margin * 0.5;
  const vbH = bottomTip.y - topTip.y + margin * 0.5;

  return (
    <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} className="w-full h-auto">
      <path d={cutPath} fill={color} fillOpacity="0.18" />
      <path
        d={foldPath}
        fill="none"
        stroke="#38AEFC"
        strokeWidth="0.7"
        strokeDasharray="2,2"
      />
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
