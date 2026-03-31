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

function line(a: Pt, b: Pt) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mapValue(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
  const t = (value - fromMin) / (fromMax - fromMin);
  return toMin + (toMax - toMin) * t;
}

function rotatedRectangle(center: Pt, ux: Pt, uy: Pt, width: number, height: number) {
  const hx = width / 2;
  const hy = height / 2;

  return {
    tl: add(center, add(mul(ux, -hx), mul(uy, -hy))),
    tr: add(center, add(mul(ux, hx), mul(uy, -hy))),
    br: add(center, add(mul(ux, hx), mul(uy, hy))),
    bl: add(center, add(mul(ux, -hx), mul(uy, hy))),
  };
}

export const Envelope: React.FC<EnvelopeProps> = ({
  width,
  height,
  overlap,
  radius,
  scale,
  color,
}) => {
  const k = 1 / scale;

  // Build directly in miniature mm
  const W = clamp(width * k, 2, 300);
  const H = clamp(height * k, 2, 300);
  const O = clamp(overlap * k, 0, 100);
  const _R = clamp(radius * k, 0, 40);

  // Reference outer contour from uploaded PDF (Envelope 150x100)
  const refMiniW = 150 / 6; // 25
  const refMiniH = 100 / 6; // 16.6667

  const minX = 76.86790466308594;
  const minY = 70.45611572265625;
  const maxX = 772.4346923828125;
  const maxY = 601.1338500976562;

  const sx = W / refMiniW;
  const sy = H / refMiniH;

  const offsetX = 160;
  const offsetY = 120;

  function mapPoint(x: number, y: number): Pt {
    return pt((x - minX) * sx + offsetX, (y - minY) * sy + offsetY);
  }

  // Exact pink contour from the uploaded PDF
  const cutPath = `
    M ${mapPoint(326.3776550292969, 571.6517333984375).x} ${mapPoint(326.3776550292969, 571.6517333984375).y}
    L ${mapPoint(346.0323791503906, 601.1338500976562).x} ${mapPoint(346.0323791503906, 601.1338500976562).y}
    L ${mapPoint(588.3155517578125, 601.1338500976562).x} ${mapPoint(588.3155517578125, 601.1338500976562).y}
    C ${mapPoint(596.3259887695312, 601.1338500976562).x} ${mapPoint(596.3259887695312, 601.1338500976562).y},
      ${mapPoint(603.55078125, 596.3173217773438).x} ${mapPoint(603.55078125, 596.3173217773438).y},
      ${mapPoint(606.6317138671875, 588.923095703125).x} ${mapPoint(606.6317138671875, 588.923095703125).y}
    L ${mapPoint(699.8175659179688, 365.2770690917969).x} ${mapPoint(699.8175659179688, 365.2770690917969).y}
    L ${mapPoint(680.162841796875, 335.79498291015625).x} ${mapPoint(680.162841796875, 335.79498291015625).y}
    L ${mapPoint(766.9888916015625, 127.4124755859375).x} ${mapPoint(766.9888916015625, 127.4124755859375).y}
    C ${mapPoint(772.4346923828125, 114.34246826171875).x} ${mapPoint(772.4346923828125, 114.34246826171875).y},
      ${mapPoint(762.8319091796875, 99.938232421875).x} ${mapPoint(762.8319091796875, 99.938232421875).y},
      ${mapPoint(748.6726684570312, 99.938232421875).x} ${mapPoint(748.6726684570312, 99.938232421875).y}
    L ${mapPoint(522.9249877929688, 99.938232421875).x} ${mapPoint(522.9249877929688, 99.938232421875).y}
    L ${mapPoint(503.2702331542969, 70.45611572265625).x} ${mapPoint(503.2702331542969, 70.45611572265625).y}
    L ${mapPoint(260.987060546875, 70.45611572265625).x} ${mapPoint(260.987060546875, 70.45611572265625).y}
    C ${mapPoint(252.97662353515625, 70.45611572265625).x} ${mapPoint(252.97662353515625, 70.45611572265625).y},
      ${mapPoint(245.7518310546875, 75.27264404296875).x} ${mapPoint(245.7518310546875, 75.27264404296875).y},
      ${mapPoint(242.6708984375, 82.6668701171875).x} ${mapPoint(242.6708984375, 82.6668701171875).y}
    L ${mapPoint(149.4850616455078, 306.3128967285156).x} ${mapPoint(149.4850616455078, 306.3128967285156).y}
    L ${mapPoint(169.13980102539062, 335.79498291015625).x} ${mapPoint(169.13980102539062, 335.79498291015625).y}
    L ${mapPoint(82.31375122070312, 544.177490234375).x} ${mapPoint(82.31375122070312, 544.177490234375).y}
    C ${mapPoint(76.86790466308594, 557.24755859375).x} ${mapPoint(76.86790466308594, 557.24755859375).y},
      ${mapPoint(86.4707260131836, 571.6517333984375).x} ${mapPoint(86.4707260131836, 571.6517333984375).y},
      ${mapPoint(100.62992095947266, 571.6517333984375).x} ${mapPoint(100.62992095947266, 571.6517333984375).y}
    L ${mapPoint(326.3776550292969, 571.6517333984375).x} ${mapPoint(326.3776550292969, 571.6517333984375).y}
    Z
  `;

  // Fixed orientation from the PDF blue panel
  const refTop = pt(522.9249877929688, 99.938232421875);
  const refLeft = pt(169.13980102539062, 335.79498291015625);

  const ux = normalize(sub(mapPoint(refLeft.x, refLeft.y), mapPoint(refTop.x, refTop.y)));
  const uy = normalize({ x: -ux.y, y: ux.x });

  // Use the exact center of the blue panel from the PDF, mapped into current contour space
  const refCenterX = (522.9249877929688 + 680.162841796875 + 326.3776550292969 + 169.13980102539062) / 4;
  const refCenterY = (99.938232421875 + 335.79498291015625 + 571.6517333984375 + 335.79498291015625) / 4;

  let center = mapPoint(refCenterX, refCenterY);

  // Slight overlap adjustment, position only
  const overlapShift = (O - 12.5 * k) * 2.5;
  center = add(center, mul(ux, -overlapShift));

  // IMPORTANT:
  // blue zone dimensions come directly from user's miniature width/height,
  // not from reference extracted lengths
  const blueWidth = W;
  const blueHeight = H;

  const { tl, tr, br, bl } = rotatedRectangle(center, ux, uy, blueWidth, blueHeight);

  const viewW = (maxX - minX) * sx + 320;
  const viewH = (maxY - minY) * sy + 240;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto">
      <rect width={viewW} height={viewH} fill="#ffffff" />

      <path d={cutPath} fill={color} fillOpacity="0.05" stroke="none" />

      <path
        d={cutPath}
        fill="none"
        stroke="#FF1493"
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <path d={line(tl, tr)} fill="none" stroke="#38AEFC" strokeWidth="0.8" strokeDasharray="2,2" />
      <path d={line(tr, br)} fill="none" stroke="#38AEFC" strokeWidth="0.8" strokeDasharray="2,2" />
      <path d={line(br, bl)} fill="none" stroke="#38AEFC" strokeWidth="0.8" strokeDasharray="2,2" />
      <path d={line(bl, tl)} fill="none" stroke="#38AEFC" strokeWidth="0.8" strokeDasharray="2,2" />
    </svg>
  );
};
