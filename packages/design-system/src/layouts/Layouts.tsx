import React from 'react';

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const gapMap = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const Stack: React.FC<LayoutProps> = ({
  children,
  className = '',
  gap = 'md',
  ...props
}) => (
  <div className={`flex flex-col ${gapMap[gap]} ${className}`} {...props}>
    {children}
  </div>
);

export const Inline: React.FC<LayoutProps & { align?: 'start' | 'center' | 'end' }> = ({
  children,
  className = '',
  gap = 'md',
  align = 'center',
  ...props
}) => {
  const alignClass =
    align === 'start' ? 'items-start' : align === 'end' ? 'items-end' : 'items-center';
  return (
    <div className={`flex flex-row ${alignClass} ${gapMap[gap]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Grid: React.FC<LayoutProps & { cols?: 1 | 2 | 3 | 4 | 6 | 12 }> = ({
  children,
  className = '',
  cols = 3,
  gap = 'md',
  ...props
}) => {
  const colsClass =
    cols === 1
      ? 'grid-cols-1'
      : cols === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : cols === 3
          ? 'grid-cols-1 md:grid-cols-3'
          : cols === 4
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            : cols === 6
              ? 'grid-cols-2 md:grid-cols-6'
              : 'grid-cols-12';

  return (
    <div className={`grid ${colsClass} ${gapMap[gap]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Container: React.FC<LayoutProps> = ({ children, className = '', ...props }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`} {...props}>
    {children}
  </div>
);

export const Section: React.FC<LayoutProps> = ({ children, className = '', ...props }) => (
  <section className={`py-8 md:py-12 ${className}`} {...props}>
    {children}
  </section>
);

export const Page: React.FC<LayoutProps> = ({ children, className = '', ...props }) => (
  <div className={`min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 ${className}`} {...props}>
    {children}
  </div>
);

export const Spacer: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeMap = { sm: 'h-2 w-2', md: 'h-4 w-4', lg: 'h-8 w-8', xl: 'h-12 w-12' };
  return <div className={sizeMap[size]} aria-hidden="true" />;
};
