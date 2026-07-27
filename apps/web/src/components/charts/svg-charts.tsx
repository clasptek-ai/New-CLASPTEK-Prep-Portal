'use client';

import React from 'react';

// ─── SVG Line Chart ──────────────────────────────────────────────────
interface LineChartProps {
  data: number[];
  labels: string[];
  height?: number;
}

export function LineChart({ data, labels, height = 150 }: LineChartProps) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;
  const padding = 20;
  const chartHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1 || 1)) * (300 - padding * 2);
    const y = padding + chartHeight - ((val - min) / range) * chartHeight;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 300 ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* Grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * ratio;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={300 - padding}
              y2={y}
              stroke="#232e48"
              strokeWidth={0.5}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Path line */}
        <path
          d={pathD}
          fill="none"
          stroke="#2563eb"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r={4} fill="#14b8a6" stroke="#151d30" strokeWidth={1.5} />
            <title>{`${labels[idx]}: ${p.val}`}</title>
          </g>
        ))}
      </svg>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 10px',
          fontSize: '0.75rem',
          color: '#94a3b8',
          marginTop: '0.5rem',
        }}
      >
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Radar Chart ─────────────────────────────────────────────────
interface RadarChartProps {
  data: Record<string, number>; // code -> value (0 to 100)
}

export function RadarChart({ data }: RadarChartProps) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const total = keys.length;
  if (total === 0) return null;

  const center = 100;
  const radius = 70;

  // Radar points
  const points = values.map((val, idx) => {
    const angle = (idx * 2 * Math.PI) / total - Math.PI / 2;
    const currentRadius = (val / 100) * radius;
    const x = center + currentRadius * Math.cos(angle);
    const y = center + currentRadius * Math.sin(angle);
    return { x, y };
  });

  const _pathD =
    points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '') + ' Z';

  // Grid rings
  const ringCount = 4;
  const rings = Array.from({ length: ringCount }).map((_, rIdx) => {
    const currentRadius = ((rIdx + 1) / ringCount) * radius;
    const ringPoints = Array.from({ length: total })
      .map((_, idx) => {
        const angle = (idx * 2 * Math.PI) / total - Math.PI / 2;
        const x = center + currentRadius * Math.cos(angle);
        const y = center + currentRadius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
    return ringPoints;
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <svg
        viewBox="0 0 200 200"
        style={{ width: '100%', maxWidth: '240px', height: 'auto', overflow: 'visible' }}
      >
        {/* Grid rings */}
        {rings.map((ringPoints, i) => (
          <polygon key={i} points={ringPoints} fill="none" stroke="#232e48" strokeWidth={0.5} />
        ))}

        {/* Axis lines */}
        {Array.from({ length: total }).map((_, idx) => {
          const angle = (idx * 2 * Math.PI) / total - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#232e48"
              strokeWidth={0.75}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="rgba(37, 99, 235, 0.25)"
          stroke="#2563eb"
          strokeWidth={2}
        />

        {/* Label elements */}
        {keys.map((k, idx) => {
          const angle = (idx * 2 * Math.PI) / total - Math.PI / 2;
          const labelRadius = radius + 15;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);

          return (
            <text
              key={idx}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fill: '#94a3b8',
                fontSize: '0.55rem',
                fontWeight: 600,
                fontFamily: 'Outfit',
              }}
            >
              {k}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── SVG Calendar HeatMap ────────────────────────────────────────────
export function HeatMap({ valList }: { valList: Array<{ day: number; active: boolean }> }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '6px',
        maxWidth: '280px',
        margin: '0 auto',
      }}
    >
      {valList.map((item, index) => (
        <div
          key={index}
          style={{
            width: '100%',
            paddingBottom: '100%',
            borderRadius: '4px',
            backgroundColor: item.active ? '#10b981' : '#151d30',
            border: item.active ? '1px solid #34d399' : '1px solid #232e48',
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          title={`Day ${item.day}: ${item.active ? 'Studied' : 'No Activity'}`}
        >
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: item.active ? '#064e3b' : '#64748b',
            }}
          >
            {item.day}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── SVG Bar Chart ───────────────────────────────────────────────────
interface BarChartProps {
  data: number[];
  labels: string[];
}

export function BarChart({ data, labels }: BarChartProps) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {data.map((val, idx) => {
        const percent = (val / max) * 100;
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                width: '80px',
                fontSize: '0.8rem',
                color: '#94a3b8',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {labels[idx]}
            </span>
            <div
              style={{
                flex: 1,
                height: '12px',
                backgroundColor: '#151d30',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #232e48',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: 'linear-gradient(90deg, #2563eb, #14b8a6)',
                  borderRadius: '6px',
                  transition: 'width 0.5s ease-out',
                }}
              />
            </div>
            <span
              style={{ width: '40px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600 }}
            >
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}
