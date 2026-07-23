import React from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  children: React.ReactNode;
}

export interface PopoverProps {
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
