import React from 'react';
import { ProgrammeSkill } from '../../../features/dashboard/models/programme-config';

export interface RadarSkillChartProps {
  skills: ProgrammeSkill[];
  accentColor?: string;
  size?: number;
}

export const RadarSkillChart: React.FC<RadarSkillChartProps> = ({
  skills,
  accentColor = '#3b82f6',
  size = 240,
}) => {
  if (!skills || skills.length === 0) return null;

  const center = size / 2;
  const radius = center - 40;
  const numSkills = skills.length;
  const angleStep = (2 * Math.PI) / numSkills;

  // Compute normalized polygon points (scores / maxScores)
  const dataPoints = skills.map((skill, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const ratio = Math.min(1, Math.max(0, skill.score / skill.maxScore));
    const r = radius * ratio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle, ratio, skill };
  });

  // Grid concentric rings (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric grid webs */}
        {gridLevels.map((level, lvlIdx) => {
          const gridPoints = skills.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = radius * level;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          });
          return (
            <polygon
              key={`grid-${lvlIdx}`}
              points={gridPoints.join(' ')}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray={lvlIdx === 3 ? 'none' : '3 3'}
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {skills.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={accentColor}
          fillOpacity="0.2"
          stroke={accentColor}
          strokeWidth="2.5"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Data points dots */}
        {dataPoints.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="4" fill={accentColor} stroke="#0f172a" strokeWidth="2" />
        ))}

        {/* Labels around the perimeter */}
        {skills.map((skill, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 22;
          const lx = center + labelRadius * Math.cos(angle);
          const ly = center + labelRadius * Math.sin(angle);

          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (Math.cos(angle) > 0.3) textAnchor = 'start';
          if (Math.cos(angle) < -0.3) textAnchor = 'end';

          return (
            <text
              key={`label-${i}`}
              x={lx}
              y={ly + 4}
              textAnchor={textAnchor}
              fill="#cbd5e1"
              fontSize="11"
              fontWeight="600"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {skill.name} ({skill.score})
            </text>
          );
        })}
      </svg>
    </div>
  );
};
