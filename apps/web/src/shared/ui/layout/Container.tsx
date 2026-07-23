import React from 'react';
import { ContainerProps } from './Container.types';

export function Container({
  maxWidth = 'xl',
  center = true,
  padding = '1.5rem',
  style,
  children,
  ...props
}: ContainerProps) {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm':
        return '640px';
      case 'md':
        return '768px';
      case 'lg':
        return '1024px';
      case 'xl':
        return '1440px';
      case '2xl':
        return '1536px';
      case 'full':
        return '100%';
      default:
        return '1440px';
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: getMaxWidth(),
        margin: center ? '0 auto' : undefined,
        padding,
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
