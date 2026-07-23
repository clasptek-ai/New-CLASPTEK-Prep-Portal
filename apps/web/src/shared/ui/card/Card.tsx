import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { CardProps, SurfaceProps } from './card.types';

export const cardVariants = cva('rounded-xl box-border transition-all duration-200', {
  variants: {
    variant: {
      default: 'bg-slate-900 border border-slate-800 shadow-sm',
      elevated: 'bg-slate-950 border border-slate-800/60 shadow-md',
      outlined: 'bg-transparent border border-slate-700',
      interactive:
        'bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 hover:shadow-md',
      compact: 'bg-slate-900 border border-slate-800',
    },
    variantPadding: {
      default: 'p-6',
      compact: 'px-4 py-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    variantPadding: 'default',
  },
});

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding, className, style, children, ...props },
  ref
) {
  const variantPadding = variant === 'compact' ? 'compact' : 'default';

  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, variantPadding }), className)}
      style={padding ? { padding, ...style } : style}
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
    elevation === 'floating' ? 'shadow-lg' : elevation === 'raised' ? 'shadow-md' : 'shadow-none';

  return (
    <div
      ref={ref}
      className={cn('bg-slate-950 rounded-lg p-4', shadowClass, className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
});
