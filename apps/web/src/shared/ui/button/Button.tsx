import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { ButtonProps, IconButtonProps } from './button.types';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold leading-none whitespace-nowrap',
    'rounded-[var(--radius-md)] border border-transparent',
    'cursor-pointer select-none',
    'transition-[background-color,border-color,color,box-shadow,transform]',
    'duration-[var(--duration-fast)]',
    'ease-[var(--ease-in-out)]',
    'focus:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--brand-light)]',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[var(--bg-app)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'active:scale-[0.98]',
    'box-border',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--brand)] text-white border-transparent',
          'hover:bg-[var(--brand-hover)] hover:shadow-[var(--shadow-brand)]',
        ].join(' '),
        secondary: [
          'bg-[var(--surface-1)] text-[var(--text-primary)]',
          'border-[var(--border-strong)]',
          'hover:bg-[var(--surface-2)] hover:border-[var(--border-focus)]',
        ].join(' '),
        outline: [
          'bg-transparent text-[var(--text-primary)]',
          'border-[var(--border-strong)]',
          'hover:bg-[var(--surface-1)] hover:border-[var(--brand-border)]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[var(--text-secondary)] border-transparent',
          'hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]',
        ].join(' '),
        link: [
          'bg-transparent text-[var(--brand-light)] border-transparent',
          'underline-offset-4 hover:underline p-0 min-h-0',
        ].join(' '),
        danger: [
          'bg-[var(--error)] text-white border-transparent',
          'hover:bg-[#dc2626]',
        ].join(' '),
        success: [
          'bg-[var(--success)] text-white border-transparent',
          'hover:bg-[#059669]',
        ].join(' '),
        warning: [
          'bg-[var(--warning)] text-white border-transparent',
          'hover:bg-[#d97706]',
        ].join(' '),
      },
      size: {
        xs:  'h-7  px-2.5 text-xs',
        sm:  'h-8  px-3   text-xs',
        md:  'h-[var(--touch-target-min)] px-4 text-sm',
        lg:  'h-12 px-5   text-base',
        xl:  'h-14 px-6   text-lg',
      },
      fullWidth: {
        true:  'w-full',
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
          className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, 'aria-label': ariaLabel, size = 'md', className, style, ...props },
  ref
) {
  const paddingMap: Record<string, string> = {
    xs: 'p-1   w-7  h-7',
    sm: 'p-1.5 w-8  h-8',
    md: 'p-2   w-[var(--touch-target-min)] h-[var(--touch-target-min)]',
    lg: 'p-2.5 w-12 h-12',
    xl: 'p-3   w-14 h-14',
  };

  return (
    <Button
      ref={ref}
      size={size}
      aria-label={ariaLabel}
      className={cn('px-0', paddingMap[size] ?? paddingMap.md, className)}
      style={style}
      {...props}
    >
      {icon}
    </Button>
  );
});
