import { OverlayInstance } from './overlay.types';

class OverlayManagerImpl {
  private overlays: OverlayInstance[] = [];
  private baseZIndex = 1400;

  public register(id: string, type: OverlayInstance['type']): number {
    const existing = this.overlays.find((o) => o.id === id);
    if (existing) return existing.zIndex;

    const zIndex = this.baseZIndex + this.overlays.length * 10;
    this.overlays.push({ id, zIndex, type });

    if (this.overlays.length === 1 && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    return zIndex;
  }

  public unregister(id: string): void {
    this.overlays = this.overlays.filter((o) => o.id !== id);

    if (this.overlays.length === 0 && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  public getActiveId(): string | null {
    if (this.overlays.length === 0) return null;
    return this.overlays[this.overlays.length - 1].id;
  }
}

export const OverlayManager = new OverlayManagerImpl();
