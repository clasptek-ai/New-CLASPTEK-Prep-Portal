import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}
