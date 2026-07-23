import React from 'react';
export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export declare const Stack: React.FC<LayoutProps>;
export declare const Inline: React.FC<
  LayoutProps & {
    align?: 'start' | 'center' | 'end';
  }
>;
export declare const Grid: React.FC<
  LayoutProps & {
    cols?: 1 | 2 | 3 | 4 | 6 | 12;
  }
>;
export declare const Container: React.FC<LayoutProps>;
export declare const Section: React.FC<LayoutProps>;
export declare const Page: React.FC<LayoutProps>;
export declare const Spacer: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>;
