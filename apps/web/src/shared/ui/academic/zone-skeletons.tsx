import React from 'react';

const SkeletonPulse: React.FC<{ height?: string; width?: string; borderRadius?: string; style?: React.CSSProperties }> = ({
  height = '1rem',
  width = '100%',
  borderRadius = '8px',
  style,
}) => (
  <div
    style={{
      height,
      width,
      borderRadius,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      animation: 'skeletonPulse 1.5s ease-in-out infinite',
      ...style,
    }}
  />
);

export const HeroZoneSkeleton: React.FC = () => (
  <div
    style={{
      padding: '2rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <SkeletonPulse height="2rem" width="300px" />
      <SkeletonPulse height="2.5rem" width="140px" borderRadius="20px" />
    </div>
    <SkeletonPulse height="1.25rem" width="450px" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
      <SkeletonPulse height="80px" />
      <SkeletonPulse height="80px" />
      <SkeletonPulse height="80px" />
    </div>
  </div>
);

export const LearningZoneSkeleton: React.FC = () => (
  <div
    style={{
      padding: '1.75rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    }}
  >
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <SkeletonPulse height="2.5rem" width="100px" borderRadius="10px" />
      <SkeletonPulse height="2.5rem" width="100px" borderRadius="10px" />
      <SkeletonPulse height="2.5rem" width="100px" borderRadius="10px" />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'center' }}>
      <SkeletonPulse height="200px" width="200px" borderRadius="50%" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SkeletonPulse height="1.5rem" width="60%" />
        <SkeletonPulse height="1rem" width="80%" />
        <SkeletonPulse height="1rem" width="40%" />
      </div>
    </div>
  </div>
);

export const AIZoneSkeleton: React.FC = () => (
  <div
    style={{
      padding: '1.75rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(139, 92, 246, 0.05)',
      border: '1px solid rgba(139, 92, 246, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <SkeletonPulse height="1.5rem" width="220px" />
    <SkeletonPulse height="1rem" width="90%" />
    <SkeletonPulse height="4rem" width="100%" borderRadius="12px" />
  </div>
);

export const PerformanceZoneSkeleton: React.FC = () => (
  <div
    style={{
      padding: '1.75rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <SkeletonPulse height="1.5rem" width="200px" />
    <SkeletonPulse height="140px" width="100%" />
  </div>
);

export const PlanningZoneSkeleton: React.FC = () => (
  <div
    style={{
      padding: '1.75rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <SkeletonPulse height="1.5rem" width="180px" />
    <SkeletonPulse height="220px" width="100%" />
  </div>
);

export const ActivityZoneSkeleton: React.FC = () => (
  <div
    style={{
      padding: '1.75rem',
      borderRadius: '16px',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <SkeletonPulse height="1.5rem" width="160px" />
    <SkeletonPulse height="45px" width="100%" />
    <SkeletonPulse height="45px" width="100%" />
  </div>
);
