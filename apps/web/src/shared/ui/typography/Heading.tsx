import React from 'react';
import { HeadingProps } from './Heading.types';

export function Heading({
  level = 2,
  size = 'xl',
  weight = 'bold',
  style,
  children,
  ...props
}: HeadingProps) {
  const getFontSize = () => {
    switch (size) {
      case 'hero':
        return '2.5rem';
      case 'lg':
        return '2.0rem';
      case 'xl':
        return '1.5rem';
      case 'md':
        return '1.25rem';
      case 'sm':
        return '1.0rem';
      default:
        return '1.5rem';
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'regular':
        return 400;
      case 'medium':
        return 500;
      case 'semibold':
        return 600;
      case 'bold':
        return 700;
      case 'extrabold':
        return 800;
      default:
        return 700;
    }
  };

  return React.createElement(
    `h${level}`,
    {
      style: {
        margin: 0,
        fontSize: getFontSize(),
        fontWeight: getFontWeight(),
        lineHeight: 1.25,
        color: 'var(--text-primary, #f8fafc)',
        letterSpacing: size === 'hero' || size === 'lg' ? '-0.02em' : '-0.01em',
        ...style,
      },
      ...props,
    },
    children
  );
}
