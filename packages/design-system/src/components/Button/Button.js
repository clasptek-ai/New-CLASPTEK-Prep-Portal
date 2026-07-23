import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React from 'react';
import { buttonVariants, buttonSizes } from './Button.styles';
export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return _jsxs('button', {
      ref: ref,
      disabled: disabled || isLoading,
      className: `inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`,
      ...props,
      children: [
        isLoading
          ? _jsx('span', {
              className:
                'inline-block animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full',
            })
          : leftIcon
            ? _jsx('span', { className: 'mr-2', children: leftIcon })
            : null,
        children,
        rightIcon && !isLoading && _jsx('span', { className: 'ml-2', children: rightIcon }),
      ],
    });
  }
);
Button.displayName = 'Button';
