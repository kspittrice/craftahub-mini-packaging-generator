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

function perp(v: Pt): Pt {
  return { x: -v.y, y: v.x };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function line(a: Pt, b: Pt) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function rotatedRectangle(center: Pt, ux: Pt, uy: Pt, longSide: number, shortSide: number) {
  const hx = longSide / 2;
  const hy = shortSide / 2;

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

  // Final geometry is built directly in miniature mm
  const miniW = clamp(width * k, 2, 300);
  const miniH = clamp(height * k, 2, 300);
  const miniO = clamp(overlap * k, 0, 100);
  const _miniR = clamp(radius * k, 0, 40);

  // Reference PDF is Envelope 150x100 real mm.
  // We use its vector contour as the base silhouette.
  const refMiniW = 150 / 6; // 25
  const refMiniH = 100 / 6; // 16.666...

  const minX = 76.86790466308594;
  const minY = 70.45611572265625;
  const maxX = 772.4346923828125;
  const maxY = 601.1338500976562;

  const sx = miniW / refMiniW;
  const sy = miniH / refMiniH;

  const offsetX = 160;
  const offsetY = 120;

  function mapPoint(x: number, y: number): Pt {
    return pt((x - minX) * sx + offsetX, (y - minY) * sy + offsetY);
  }

  // Exact vector contour commands extracted from the uploaded PDF
  const cutSegments = [
    ["l", [326.3776550292969, 571.6517333984375], [346.0323791503906, 601.1338500976562]],
    ["l", [346.0323791503906, 601.1338500976562], [588.3155517578125, 601.1338500976562]],
    ["c", [588.3155517578125, 601.1338500976562], [596.3259887695312, 601.1338500976562], [603.55078125, 596.3173217773438], [606.6317138671875, 588.923095703125]],
    ["l", [606.6317138671875, 588.923095703125], [699.8175659179688, 365.2770690917969]],
    ["l", [699.8175659179688, 365.2770690917969], [680.162841796875, 335.79498291015625]],
    ["l", [680.162841796875, 335.79498291015625], [766.9888916015625, 127.4124755859375]],
    ["c", [766.9888916015625, 127.4124755859375], [772.4346923828125, 114.34246826171875], [762.8319091796875, 99.938232421875], [748.6726684570312, 99.938232421875]],
    ["l", [748.6726684570312, 99.938232421875], [522.9249877929688, 99.938232421875]],
    ["l", [522.9249877929688, 99.938232421875], [503.2702331542969, 70.45611572265625]],
    ["l", [503.2702331542969, 70.45611572265625], [260.987060546875, 70.45611572265625]],
    ["c", [260.987060546875, 70.45611572265625], [252.97662353515625, 70.45611572265625], [245.7518310546875, 75.27264404296875], [242.6708984375, 82.6668701171875]],
    ["l", [242.6708984375, 82.6668701171875], [149.4850616455078, 306.3128967285156]],
    ["l", [149.4850616455078, 306.3128967285156], [169.13980102539062, 335.79498291015625]],
    ["l", [169.13980102539062, 335.79498291015625], [82.31375122070312, 544.177490234375]],
    ["c", [82.31375122070312, 544.177490234375], [76.86790466308594, 557.24755859375], [86.4707260131836, 571.6517333984375], [100.62992095947266, 571.6517333984375]],
    ["l", [100.62992095947266, 571.6517333984375], [326.3776550292969, 571.6517333984375]],
  ] as const;

  // Build exact pink path from extracted vector commands
  let cutPath = "";
  for (let i = 0; i < cutSegments.length; i++) {
    const seg = cutSegments[i];
    if (seg[0] === "l") {
      const [, p0, p1] = seg;
      const a = mapPoint(p0[0], p0[1]);
      const b = mapPoint(p1[0], p1[1]);
      if (i === 0) {
        cutPath += `M ${a.x} ${a.y} `;
      }
      cutPath += `L ${b.x} ${b.y} `;
    } else {
      const [, p0, c1, c2, p3] = seg;
      const a = mapPoint(p0[0], p0[1]);
      const b = mapPoint(c1[0], c1[1]);
      const c = mapPoint(c2[0], c2[1]);
      const d = mapPoint(p3[0], p3[1]);
      if (i === 0) {
        cutPath += `M ${a.x} ${a.y} `;
      }
      cutPath += `C ${b.x} ${b.y}, ${c.x} ${c.y}, ${d.x} ${d.y} `;
    }
  }
  cutPath += "Z";

  // Exact blue quad from the uploaded PDF
  const refTop = pt(522.9249877929688, 99.938232421875);
  const refRight = pt(680.162841796875, 335.79498291015625);
  const refBottom = pt(326.3776550292969, 571.6517333984375);
  const refLeft = pt(169.13980102539062, 335.79498291015625);

  // Orientation from PDF
  const ux = normalize(sub(refLeft, refTop));   // long direction
  const uy = normalize(sub(refRight, refTop));  // short direction

  const refLong = len(sub(refLeft, refTop));
  const refShort = len(sub(refRight, refTop));

  const centerRef = pt(
    (refTop.x + refRight.x + refBottom.x + refLeft.x) / 4,
    (refTop.y + refRight.y + refBottom.y + refLeft.y) / 4
  );

  const center = mapPoint(centerRef.x, centerRef.y);

  const longSide = refLong * (miniW / refMiniW);
  const shortSide = refShort * (miniH / refMiniH);

  // overlap nudges the blue zone slightly without breaking 90° corners
  const overlapShift = (miniO - (12.5 / 6)) * 4.0;
  const shiftedCenter = add(center, mul(ux, -overlapShift));

  const { tl, tr, br, bl } = rotatedRectangle(
    shiftedCenter,
    ux,
    uy,
    longSide,
    shortSide
  );

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
