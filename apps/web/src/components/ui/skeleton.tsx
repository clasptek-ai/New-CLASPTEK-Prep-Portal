import React from 'react';

/**
 * Skeleton — animated shimmer placeholder for loading states.
 *
 * Usage:
 *   <Skeleton width="100%" height={20} radius={4} />
 *   <Skeleton circle size={48} />
 */

interface SkeletonProps {
  /** Width (px number or CSS string) */
  width?: number | string;
  /** Height (px number or CSS string) */
  height?: number | string;
  /** Border radius (px number or CSS string) */
  radius?: number | string;
  /** If true, renders a perfect circle (size × size) */
  circle?: boolean;
  /** Used when circle=true — side length */
  size?: number;
  /** Override inline styles */
  style?: React.CSSProperties;
  /** Additional class names */
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 16,
  radius = 6,
  circle = false,
  size = 40,
  style,
  className,
}: SkeletonProps) {
  const dimension: React.CSSProperties = circle
    ? { width: size, height: size, borderRadius: '50%' }
    : {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
      };

  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: 'block',
        background: 'linear-gradient(90deg, #1a2540 25%, #243050 50%, #1a2540 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.6s infinite linear',
        ...dimension,
        ...style,
      }}
    />
  );
}

/**
 * SkeletonText — renders multiple lines of skeleton text.
 */
export function SkeletonText({ lines = 3, spacing = 10 }: { lines?: number; spacing?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height={14}
          radius={4}
        />
      ))}
    </div>
  );
}

/**
 * Inject the shimmer keyframe once into <head>.
 * Rendered in _app or layout.
 */
export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes skeleton-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        [style*="skeleton-shimmer"] { animation: none; }
      }
    `}</style>
  );
}

export default Skeleton;
