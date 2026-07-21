import React from 'react';

export interface LineSeries {
  label: string;
  color: string;
  // pontos já ordenados por x; x é um timestamp (ms) ou índice
  points: { x: number; y: number }[];
}

interface Props {
  series: LineSeries[];
  yMin?: number;
  yMax?: number;
  height?: number;
  formatX?: (x: number) => string;
}

/**
 * Gráfico de linhas SVG minimalista, multi-série. Sem dependências.
 * Escala X pelos valores min/max de x entre todas as séries; Y por yMin/yMax.
 */
const LineChart: React.FC<Props> = ({ series, yMin = 0, yMax = 10, height = 220, formatX }) => {
  const width = 640; // viewBox; escala responsivamente via CSS
  const padL = 32, padR = 12, padT = 12, padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const allX = series.flatMap((s) => s.points.map((p) => p.x));
  const hasData = allX.length > 0;
  const xMin = hasData ? Math.min(...allX) : 0;
  const xMax = hasData ? Math.max(...allX) : 1;
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;

  const sx = (x: number) => padL + ((x - xMin) / xSpan) * plotW;
  const sy = (y: number) => padT + (1 - (y - yMin) / ySpan) * plotH;

  // linhas de grade horizontais (4 divisões)
  const gridY = Array.from({ length: 5 }, (_, i) => yMin + (ySpan * i) / 4);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center text-sm text-secondary-400 border border-dashed border-secondary-200 rounded-lg" style={{ height }}>
        Sem pontuações registradas ainda.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img">
      {/* grade + rótulos Y */}
      {gridY.map((gy, i) => (
        <g key={i}>
          <line x1={padL} y1={sy(gy)} x2={width - padR} y2={sy(gy)} stroke="#E9ECEA" strokeWidth={1} />
          <text x={padL - 6} y={sy(gy) + 4} textAnchor="end" fontSize={10} fill="#A7B3AA">
            {Math.round(gy)}
          </text>
        </g>
      ))}

      {/* rótulos X: primeiro e último ponto */}
      {formatX && (
        <>
          <text x={sx(xMin)} y={height - 8} textAnchor="start" fontSize={10} fill="#A7B3AA">{formatX(xMin)}</text>
          <text x={sx(xMax)} y={height - 8} textAnchor="end" fontSize={10} fill="#A7B3AA">{formatX(xMax)}</text>
        </>
      )}

      {/* séries */}
      {series.map((s, si) => {
        if (s.points.length === 0) return null;
        const d = s.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`)
          .join(' ');
        return (
          <g key={si}>
            <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {s.points.map((p, i) => (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill={s.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

export default LineChart;
