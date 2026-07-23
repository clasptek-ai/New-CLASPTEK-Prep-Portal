import React from 'react';
import { StatusIndicatorProps } from './status.types';

export function StatusIndicator({ status, size = 10, style, ...props }: StatusIndicatorProps) {
  const getColor = () => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'offline':
        return '#64748b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      role="status"
      aria-label={`Status: ${status}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: getColor(),
        display: 'inline-block',
        ...style,
      }}
      {...props}
    />
  );
}
