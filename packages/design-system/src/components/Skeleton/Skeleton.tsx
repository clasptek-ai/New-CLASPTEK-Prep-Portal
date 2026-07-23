import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantClasses =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
        ? 'rounded-md h-4 my-1'
        : 'rounded-xl';

  return (
    <div
      className={`animate-pulse bg-[#e6e8ea] ${variantClasses} ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
    />
  );
};
