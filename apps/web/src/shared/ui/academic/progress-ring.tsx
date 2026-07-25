import React from 'react';

export interface ProgressRingProps {
  score: number;
  maxScore: number;
  label: string;
  targetText: string;
  strokeColor?: string;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score,
  maxScore,
  label,
  targetText,
  strokeColor = '#3b82f6',
  size = 180,
  strokeWidth = 14,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(Math.max(score / maxScore, 0), 1);
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
          }}
        />
      </svg>
      {/* Center Score Text Overlay */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          {score}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginTop: '0.1rem' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.7rem', color: strokeColor, fontWeight: 700, marginTop: '0.2rem' }}>
          {targetText}
        </span>
      </div>
    </div>
  );
};
