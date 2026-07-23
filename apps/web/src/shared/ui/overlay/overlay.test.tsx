import { describe, it, expect } from 'vitest';
import { OverlayManager } from './OverlayManager';

describe('OverlayManager (Wave 002D)', () => {
  it('assigns incrementing z-index and manages active overlay id', () => {
    const z1 = OverlayManager.register('modal-1', 'modal');
    const z2 = OverlayManager.register('drawer-1', 'drawer');

    expect(z2).toBeGreaterThan(z1);
    expect(OverlayManager.getActiveId()).toBe('drawer-1');

    OverlayManager.unregister('drawer-1');
    expect(OverlayManager.getActiveId()).toBe('modal-1');

    OverlayManager.unregister('modal-1');
    expect(OverlayManager.getActiveId()).toBeNull();
  });
});
