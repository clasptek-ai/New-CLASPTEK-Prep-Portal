import React from 'react';

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
