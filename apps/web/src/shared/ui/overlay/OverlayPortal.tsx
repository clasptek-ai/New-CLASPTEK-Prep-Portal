import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { OverlayPortalProps } from './overlay.types';

export function OverlayPortal({ children }: OverlayPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(children, document.body);
}
