import React from 'react';
import Link from 'next/link';
import { BrandConfig } from '@/config/brand.config';

export interface LogoBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  ariaLabel?: string;
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({
  size = 'md',
  className,
  style,
  href,
  ariaLabel,
}) => {
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

  const content = (
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
        transition: 'transform 150ms ease, box-shadow 150ms ease',
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

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel || `Navigate to ${BrandConfig.portalName} homepage`}
        className="inline-flex focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none rounded-lg transition-all hover:opacity-95"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default LogoBadge;
