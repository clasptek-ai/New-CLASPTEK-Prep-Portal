import React from 'react';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  position?: DrawerPosition;
  size?: string;
  children: React.ReactNode;
}
