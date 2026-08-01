/**
 * Automated Responsive Visual & Layout Regression Test Specifications
 * Configures Playwright visual regression assertions across 4 target breakpoints:
 * - Mobile (375px)
 * - Tablet (768px)
 * - Laptop (1024px)
 * - Desktop (1440px)
 */

export interface BreakpointConfig {
  name: string;
  width: number;
  height: number;
}

export interface RouteConfig {
  name: string;
  path: string;
}

export const BREAKPOINTS: BreakpointConfig[] = [
  { name: 'Mobile', width: 375, height: 812 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Desktop', width: 1440, height: 900 },
];

export const CORE_ROUTES: RouteConfig[] = [
  { name: 'Student Dashboard', path: '/student' },
  { name: 'Welcome Gateway', path: '/student/welcome' },
  { name: 'Assessment Player', path: '/student/assessments/player?attemptId=test-session' },
  { name: 'Admin Dashboard', path: '/admin/dashboard' },
  { name: 'Assessment Management', path: '/admin/assessments' },
];

export interface PageMock {
  goto: (url: string, opts?: any) => Promise<void>;
  evaluate: <T>(fn: () => T) => Promise<T>;
  locator: (selector: string) => {
    toBeVisible: () => Promise<boolean>;
    toBeHidden: () => Promise<boolean>;
  };
}

/**
 * Playwright E2E Runner Execution Schema
 * Run with: `npx playwright test tests/responsive-regression.spec.ts`
 */
export async function runResponsiveRegressionCheck(page: PageMock, bp: BreakpointConfig, route: RouteConfig) {
  await page.goto(route.path, { waitUntil: 'domcontentloaded' });

  // 1. Verify document width matches window inner width (Zero Horizontal Overflow)
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  if (scrollWidth > clientWidth + 1) {
    throw new Error(`Horizontal overflow detected on ${route.name} at ${bp.width}px`);
  }

  // 2. Validate touch targets on Mobile (<768px)
  if (bp.width < 768) {
    const undersizedTargets = await page.evaluate(() => {
      const interactive = Array.from(
        document.querySelectorAll('button, a, input, select, textarea')
      );
      return interactive.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      }).length;
    });
    if (undersizedTargets > 0) {
      throw new Error(`${undersizedTargets} interactive elements failed minimum 44px touch target on ${route.name}`);
    }
  }

  // 3. Mobile Distraction-Free Exam Mode Check
  if (bp.width < 768 && route.path.includes('/player')) {
    const bottomNav = page.locator('nav[aria-label="Student Mobile Bottom Navigation"]');
    const isHidden = await bottomNav.toBeHidden();
    if (!isHidden) {
      throw new Error(`Distraction-Free Exam Mode failed: Bottom Nav was visible during active test session`);
    }
  }
}
