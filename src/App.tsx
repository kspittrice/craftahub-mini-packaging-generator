import React from 'react';

function EnvelopeGeometry({ width, height, overlap, radius, scale, fill }) {
  // 1. Константы и масштаб
  const k = scale === "1:6" ? 1/6 : 1/12;
  const w = width * k;
  const h = height * k;
  const o = overlap * k;
  const r = radius * k;

  // 2. Координаты центральной панели (лицо конверта)
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -h / 2;
  const y1 = h / 2;

  // 3. Расчет точек клапанов (Flaps)
  // Верхний и нижний клапаны обычно равны половине высоты + нахлест
  const flapH = (h / 2) + o;
  const flapW = (w / 2) + o;

  // 4. Построение путей (D-строки для SVG)
  // Внешний контур (CUT) - Розовая линия
  const cutPath = `
    M ${x0} ${y0} 
    L ${x0 - flapW} 0 L ${x0} ${y1} 
    L 0 ${y1 + flapH} L ${x1} ${y1} 
    L ${x1 + flapW} 0 L ${x1} ${y0} 
    L 0 ${y0 - flapH} Z
  `;

  // Линии сгиба (SCORE) - Голубые линии
  const scoreLines = `
    M ${x0} ${y0} L ${x1} ${y0}
    M ${x1} ${y0} L ${x1} ${y1}
    M ${x1} ${y1} L ${x0} ${y1}
    M ${x0} ${y1} L ${x0} ${y0}
  `;

  // Настройка вида
  const viewBoxSize = Math.max(w, h) * 4;
  const center = viewBoxSize / 2;

  return (
    <div className="geometry-card" style={{ background: '#f5f5f5', padding: '20px' }}>
      <svg 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <g transform={`translate(${center}, ${center})`}>
          {/* Заливка центральной части */}
          <rect x={x0} y={y0} width={w} height={h} fill={fill} fillOpacity="0.2" />
          
          {/* Слой реза (Pink) */}
          <path 
            d={cutPath} 
            fill="none" 
            stroke="#FF1493" 
            strokeWidth="1" 
            strokeLinejoin="round" 
          />
          
          {/* Слой сгиба (Blue) */}
          <path 
            d={scoreLines} 
            fill="none" 
            stroke="#38AEFC" 
            strokeWidth="0.5" 
            strokeDasharray="2,2" 
          />
        </g>
      </svg>
      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px' }}>
        Preview Scale {scale} | Mini Size: {w.toFixed(1)} x {h.toFixed(1)} mm
      </div>
    </div>
  );
}
