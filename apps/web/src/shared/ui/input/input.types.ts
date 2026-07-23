import React from 'react';

export type InputVariant = 'default' | 'filled' | 'outlined' | 'readOnly' | 'invalid';
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  fullWidth?: boolean;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface PasswordInputProps extends Omit<InputProps, 'type'> {}
export interface SearchInputProps extends InputProps {}
export interface NumberInputProps extends InputProps {}
export interface EmailInputProps extends InputProps {}
/* eslint-enable @typescript-eslint/no-empty-object-type */
