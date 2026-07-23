import React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'hero' | 'lg' | 'xl' | 'md' | 'sm';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  children: React.ReactNode;
}
