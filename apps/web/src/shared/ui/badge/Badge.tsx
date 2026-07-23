import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { BadgeProps } from './badge.types';

export const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold leading-snug transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white',
        secondary: 'bg-slate-800 text-slate-300',
        success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500',
        warning: 'bg-amber-500/15 text-amber-400 border border-amber-500',
        danger: 'bg-red-500/15 text-red-400 border border-red-500',
        info: 'bg-blue-500/15 text-blue-400 border border-blue-500',
        outline: 'bg-transparent text-slate-100 border border-slate-800',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'primary', className, style, children, ...props },
  ref
) {
  return (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} style={style} {...props}>
      {children}
    </span>
  );
});
