import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { ButtonProps, IconButtonProps } from './button.types';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 box-border',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]',
        secondary: 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700',
        outline: 'bg-transparent text-slate-100 border border-slate-600 hover:bg-slate-800',
        ghost: 'bg-transparent text-slate-100 hover:bg-slate-800',
        link: 'bg-transparent text-blue-500 underline p-0 hover:text-blue-400',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600',
        warning: 'bg-amber-500 text-white hover:bg-amber-600',
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-3 text-base',
        xl: 'px-6 py-4 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled = false,
    className,
    style,
    children,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      style={style}
      {...props}
    >
      {isLoading && (
        <span
          className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, 'aria-label': ariaLabel, size = 'md', className, style, ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      size={size}
      aria-label={ariaLabel}
      className={cn(size === 'xs' ? 'p-1' : size === 'sm' ? 'p-1.5' : 'p-2', className)}
      style={style}
      {...props}
    >
      {icon}
    </Button>
  );
});
