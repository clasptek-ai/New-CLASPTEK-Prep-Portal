import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { AlertProps } from './alert.types';

export const alertVariants = cva(
  'relative flex items-start gap-3 p-3.5 rounded-xl border text-sm box-border transition-all duration-150',
  {
    variants: {
      variant: {
        info: 'bg-blue-500/15 border-blue-500 text-blue-400',
        success: 'bg-emerald-500/15 border-emerald-500 text-emerald-400',
        warning: 'bg-amber-500/15 border-amber-500 text-amber-400',
        error: 'bg-red-500/15 border-red-500 text-red-400',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export const AlertTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function AlertTitle({ className, style, children, ...props }, ref) {
    return (
      <h5
        ref={ref}
        className={cn('m-0 mb-1 text-sm font-bold text-current', className)}
        style={style}
        {...props}
      >
        {children}
      </h5>
    );
  }
);

export const AlertDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function AlertDescription({ className, style, children, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn('m-0 text-xs opacity-90 leading-relaxed', className)}
      style={style}
      {...props}
    >
      {children}
    </p>
  );
});

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = 'info', icon, onDismiss, className, style, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={cn(alertVariants({ variant }), className)}
      style={style}
      {...props}
    >
      {icon && <span className="mt-0.5 text-lg flex items-center">{icon}</span>}

      <div className="flex-1">{children}</div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="bg-transparent border-none text-current cursor-pointer text-lg p-0 opacity-75 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
});
