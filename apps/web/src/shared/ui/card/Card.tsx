import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { CardProps, CardPadding, SurfaceProps } from './card.types';

export const cardVariants = cva(
  'box-border transition-[border-color,box-shadow] duration-[var(--duration-fast)]',
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--surface-0)]',
          'border border-[var(--border)]',
          'rounded-[var(--radius-lg)]',
          'shadow-[var(--shadow-surface)]',
          'hover:border-[var(--border-strong)]',
        ].join(' '),
        elevated: [
          'bg-[var(--surface-1)]',
          'border border-[var(--border-strong)]',
          'rounded-[var(--radius-lg)]',
          'shadow-[var(--shadow-elevated)]',
        ].join(' '),
        outlined: [
          'bg-transparent',
          'border border-[var(--border-strong)]',
          'rounded-[var(--radius-lg)]',
        ].join(' '),
        interactive: [
          'bg-[var(--surface-0)]',
          'border border-[var(--border)]',
          'rounded-[var(--radius-lg)]',
          'shadow-[var(--shadow-surface)]',
          'cursor-pointer',
          'hover:border-[var(--brand-border)]',
          'hover:shadow-[var(--shadow-elevated)]',
        ].join(' '),
        compact: [
          'bg-[var(--surface-0)]',
          'border border-[var(--border)]',
          'rounded-[var(--radius-md)]',
        ].join(' '),
        glass: [
          'bg-[rgba(15,22,35,0.6)]',
          'backdrop-blur-md',
          'border border-[var(--border-strong)]',
          'rounded-[var(--radius-xl)]',
          'shadow-[var(--shadow-elevated)]',
        ].join(' '),
        flat: [
          'bg-[var(--surface-1)]',
          'rounded-[var(--radius-lg)]',
        ].join(' '),
      },
      padding: {
        none:    'p-0',
        compact: 'p-4',
        default: 'p-6',
        loose:   'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding: paddingOverride, className, style, children, ...props },
  ref
) {
  // Map compact variant to compact padding; everything else defaults
  const defaultPadding: CardPadding = variant === 'compact' ? 'compact' : 'default';

  return (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding: paddingOverride ?? defaultPadding }),
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
});

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { elevation = 'raised', className, style, children, ...props },
  ref
) {
  const shadowClass =
    elevation === 'floating'
      ? 'shadow-(--shadow-floating)'
      : elevation === 'raised'
        ? 'shadow-(--shadow-elevated)'
        : 'shadow-none';

  return (
    <div
      ref={ref}
      className={cn(
        'bg-(--surface-0) rounded-lg p-4',
        shadowClass,
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
});
