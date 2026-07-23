import React from 'react';
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}
export declare const Skeleton: React.FC<SkeletonProps>;
