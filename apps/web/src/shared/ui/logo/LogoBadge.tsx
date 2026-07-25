import React from 'react';
import { BrandConfig } from '@/config/brand.config';

export interface LogoBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({ size = 'md', className, style }) => {
  const heightMap = {
    sm: '26px',
    md: '32px',
    lg: '40px',
  };

  const paddingMap = {
    sm: '0.3rem 0.55rem',
    md: '0.4rem 0.75rem',
    lg: '0.5rem 1rem',
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#ffffff',
        padding: paddingMap[size],
        borderRadius: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.22)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src={BrandConfig.logoUrl}
        alt={BrandConfig.portalName}
        style={{ height: heightMap[size], width: 'auto', display: 'block' }}
      />
    </div>
  );
};

export default LogoBadge;
