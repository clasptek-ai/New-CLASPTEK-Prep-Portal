import React from 'react';

export interface OverlayInstance {
  id: string;
  zIndex: number;
  type: 'modal' | 'drawer' | 'popover' | 'tooltip';
}

export interface OverlayContextValue {
  registerOverlay: (id: string, type: OverlayInstance['type']) => number;
  unregisterOverlay: (id: string) => void;
  activeOverlayId: string | null;
}

export interface OverlayPortalProps {
  children: React.ReactNode;
}
