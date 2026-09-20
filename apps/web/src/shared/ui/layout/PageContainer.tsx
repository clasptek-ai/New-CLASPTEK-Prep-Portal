'use client';

import React from 'react';
import { cn } from '../../../lib/utils';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function PageContainer({
  children,
  maxWidth = '1600px',
  className,
  style,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto flex flex-col gap-6 text-[var(--text-primary)] font-sans',
        className
      )}
      style={{
        maxWidth,
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  children,
  className,
  style,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border)] w-full',
        className
      )}
      style={style}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {badge && <div className="mb-0.5">{badge}</div>}
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] m-0">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">{actions}</div>
      )}
      {children}
    </div>
  );
}

export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className, style, ...props }: PageContentProps) {
  return (
    <div className={cn('w-full flex flex-col gap-6', className)} style={style} {...props}>
      {children}
    </div>
  );
}
