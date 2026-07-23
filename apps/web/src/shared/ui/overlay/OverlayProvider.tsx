import React, { createContext, useState, useCallback, useEffect } from 'react';
import { OverlayContextValue } from './overlay.types';
import { OverlayManager } from './OverlayManager';

export const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const registerOverlay = useCallback(
    (id: string, type: 'modal' | 'drawer' | 'popover' | 'tooltip') => {
      const z = OverlayManager.register(id, type);
      setActiveId(OverlayManager.getActiveId());
      return z;
    },
    []
  );

  const unregisterOverlay = useCallback((id: string) => {
    OverlayManager.unregister(id);
    setActiveId(OverlayManager.getActiveId());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeId) {
        // Active overlay escape dispatch
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId]);

  return (
    <OverlayContext.Provider
      value={{ registerOverlay, unregisterOverlay, activeOverlayId: activeId }}
    >
      {children}
    </OverlayContext.Provider>
  );
}
