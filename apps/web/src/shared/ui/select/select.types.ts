import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onChange' | 'options'> {
  options: SelectOption[];
  value?: string[];
  onChange?: (selectedValues: string[]) => void;
}
