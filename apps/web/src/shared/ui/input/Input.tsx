import React, { forwardRef, useState, useId } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import {
  InputProps,
  PasswordInputProps,
  SearchInputProps,
  NumberInputProps,
  EmailInputProps,
} from './input.types';

export const inputVariants = cva(
  'w-full text-slate-100 rounded-xl border outline-none transition-all duration-150 opacity-100 disabled:opacity-60 disabled:cursor-not-allowed text-sm box-border min-h-[44px]',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 border-slate-800 focus:border-blue-500',
        filled: 'bg-slate-800 border-slate-700 focus:border-blue-500',
        outlined: 'bg-transparent border-slate-700 focus:border-blue-500',
        invalid: 'bg-slate-900 border-red-500 focus:border-red-500',
        readOnly: 'bg-slate-800 border-slate-700 cursor-default',
      },
      size: {
        xs: 'px-2 py-1 text-xs min-h-[36px]',
        sm: 'px-3 py-1.5 text-xs min-h-[40px]',
        md: 'px-3.5 py-2.5 text-sm min-h-[44px]',
        lg: 'px-4 py-3 text-base min-h-[48px]',
        xl: 'px-5 py-4 text-lg min-h-[52px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = 'default',
    size = 'md',
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    onClear,
    fullWidth = true,
    disabled = false,
    readOnly = false,
    id,
    className,
    style,
    value,
    defaultValue,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const isInvalid = Boolean(error) || variant === 'invalid';
  const effectiveVariant = isInvalid ? 'invalid' : variant;

  return (
    <div className={cn(fullWidth ? 'w-full' : 'w-auto', 'mb-3')}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-100 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          readOnly={readOnly || variant === 'readOnly'}
          aria-invalid={isInvalid}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={cn(
            inputVariants({ variant: effectiveVariant, size }),
            leftIcon && 'pl-9',
            (rightIcon || onClear) && 'pr-9',
            className
          )}
          style={style}
          {...props}
        />

        {onClear && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            className={cn(
              'absolute right-3 bg-transparent border-none text-slate-400 cursor-pointer p-0 flex items-center',
              rightIcon && 'right-9'
            )}
          >
            ✕
          </button>
        )}

        {rightIcon && (
          <span className="absolute right-3 text-slate-400 flex items-center">{rightIcon}</span>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-500 font-medium">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="mt-1 text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="bg-transparent border-none text-slate-400 cursor-pointer p-0 text-xs hover:text-slate-200"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        }
        {...props}
      />
    );
  }
);

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(props, ref) {
    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<span>🔍</span>}
        placeholder="Search..."
        {...props}
      />
    );
  }
);

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(props, ref) {
    return <Input ref={ref} type="number" {...props} />;
  }
);

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  function EmailInput(props, ref) {
    return <Input ref={ref} type="email" placeholder="name@example.com" {...props} />;
  }
);
