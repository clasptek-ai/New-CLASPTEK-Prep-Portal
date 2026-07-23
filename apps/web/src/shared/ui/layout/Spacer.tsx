import React from 'react';
import { SpacerProps } from './Spacer.types';

export function Spacer({ size = 'md', horizontal = false, style, ...props }: SpacerProps) {
  const getSpaceSize = () => {
    switch (size) {
      case 'xs':
        return '4px';
      case 'sm':
        return '8px';
      case 'md':
        return '16px';
      case 'lg':
        return '24px';
      case 'xl':
        return '32px';
      default:
        return size;
    }
  };

  const dim = getSpaceSize();

  return (
    <div
      style={{
        width: horizontal ? dim : '100%',
        height: horizontal ? '100%' : dim,
        flexShrink: 0,
        ...style,
      }}
      {...props}
    />
  );
}
