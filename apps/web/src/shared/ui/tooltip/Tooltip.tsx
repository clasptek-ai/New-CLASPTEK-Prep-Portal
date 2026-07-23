import React, { useState } from 'react';
import { TooltipProps } from './tooltip.types';

export function Tooltip({ content, position = 'top', children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%) marginTop: 0.35rem' };
      case 'left':
        return { right: '100%', top: '50%', transform: 'translateY(-50%) marginRight: 0.35rem' };
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%) marginLeft: 0.35rem' };
      default:
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%) marginBottom: 0.35rem' };
    }
  };

  return (
    <div
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #1e293b',
            borderRadius: 'var(--radius-sm, 6px)',
            padding: '0.35rem 0.625rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 1600,
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none',
            ...getPositionStyles(),
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
