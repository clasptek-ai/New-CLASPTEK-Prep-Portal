export type NavigationMode = 'FREE' | 'SEQUENTIAL' | 'LOCK_ON_COMPLETE' | 'ONE_WAY';

export interface NavigationContext {
  currentIndex: number;
  targetIndex: number;
  totalSections: number;
  isCurrentSectionCompleted: boolean;
}

export interface NavigationPolicy {
  readonly mode: NavigationMode;
  canNavigate(ctx: NavigationContext): boolean;
}

export class FreeNavigationPolicy implements NavigationPolicy {
  public readonly mode = 'FREE';
  public canNavigate(_ctx: NavigationContext): boolean {
    return true;
  }
}

export class SequentialNavigationPolicy implements NavigationPolicy {
  public readonly mode = 'SEQUENTIAL';
  public canNavigate(ctx: NavigationContext): boolean {
    return ctx.targetIndex === ctx.currentIndex + 1 || ctx.targetIndex <= ctx.currentIndex;
  }
}

export class LockOnCompleteNavigationPolicy implements NavigationPolicy {
  public readonly mode = 'LOCK_ON_COMPLETE';
  public canNavigate(ctx: NavigationContext): boolean {
    if (ctx.targetIndex < ctx.currentIndex && ctx.isCurrentSectionCompleted) return false;
    return true;
  }
}

export class OneWayNavigationPolicy implements NavigationPolicy {
  public readonly mode = 'ONE_WAY';
  public canNavigate(ctx: NavigationContext): boolean {
    return ctx.targetIndex >= ctx.currentIndex;
  }
}

export class NavigationPolicyFactory {
  public static getPolicy(mode: NavigationMode): NavigationPolicy {
    switch (mode) {
      case 'FREE':
        return new FreeNavigationPolicy();
      case 'SEQUENTIAL':
        return new SequentialNavigationPolicy();
      case 'ONE_WAY':
        return new OneWayNavigationPolicy();
      case 'LOCK_ON_COMPLETE':
      default:
        return new LockOnCompleteNavigationPolicy();
    }
  }
}
