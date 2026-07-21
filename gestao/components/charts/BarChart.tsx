import React from 'react';

export interface BarGroup {
  label: string;
  values: { color: string; value: number }[]; // barras empilhadas lado a lado por grupo
}

interface Props {
  groups: BarGroup[];
  height?: number;
  legend?: { color: string; label: string }[];
}

/** Gráfico de barras agrupadas SVG minimalista (ex.: realizadas vs faltas por mês). */
const BarChart: React.FC<Props> = ({ groups, height = 200, legend }) => {
  const width = 640;
  const padL = 28, padR = 12, padT = 12, padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxVal = Math.max(1, ...groups.flatMap((g) => g.values.map((v) => v.value)));
  const groupW = plotW / Math.max(1, groups.length);
  const barsPerGroup = groups[0]?.values.length ?? 1;
  const barW = Math.min(18, (groupW * 0.6) / barsPerGroup);

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-secondary-400 border border-dashed border-secondary-200 rounded-lg" style={{ height }}>
        Sem dados de frequência ainda.
      </div>
    );
  }

  const sy = (v: number) => padT + (1 - v / maxVal) * plotH;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img">
        {/* base */}
        <line x1={padL} y1={padT + plotH} x2={width - padR} y2={padT + plotH} stroke="#D3D9D5" strokeWidth={1} />
        {groups.map((g, gi) => {
          const gx = padL + gi * groupW + groupW / 2;
          const totalW = barsPerGroup * barW + (barsPerGroup - 1) * 3;
          const startX = gx - totalW / 2;
          return (
            <g key={gi}>
              {g.values.map((v, vi) => {
                const x = startX + vi * (barW + 3);
                const y = sy(v.value);
                const h = padT + plotH - y;
                return <rect key={vi} x={x} y={y} width={barW} height={Math.max(0, h)} rx={2} fill={v.color} />;
              })}
              <text x={gx} y={height - 8} textAnchor="middle" fontSize={10} fill="#A7B3AA">{g.label}</text>
            </g>
          );
        })}
      </svg>
      {legend && (
        <div className="flex flex-wrap gap-4 mt-2 justify-center">
          {legend.map((l, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs text-secondary-500">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} /> {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarChart;
