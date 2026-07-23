export const typography = {
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    hero: '2.5rem', // 40px
    displayLg: '2.0rem', // 32px
    headingXl: '1.5rem', // 24px
    headingMd: '1.25rem', // 20px
    titleSm: '1.0rem', // 16px
    bodyMd: '0.875rem', // 14px
    bodySm: '0.8125rem', // 13px
    caption: '0.75rem', // 12px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    none: 1.0,
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

export const colors = {
  dark: {
    bgApp: '#0b0f19',
    bgSurface0: '#111827',
    bgSurface1: '#151d30',
    bgSurface2: '#1e293b',
    bgSurfaceHover: '#26334d',
    borderSubtle: 'rgba(255, 255, 255, 0.07)',
    borderDefault: '#1e293b',
    borderStrong: '#334155',
    borderFocus: '#38bdf8',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textDisabled: '#475569',
    primary500: '#3b82f6',
    primary600: '#2563eb',
    primaryGlow: 'rgba(59, 130, 246, 0.25)',
  },
  light: {
    bgApp: '#f8fafc',
    bgSurface0: '#ffffff',
    bgSurface1: '#ffffff',
    bgSurface2: '#f1f5f9',
    bgSurfaceHover: '#e2e8f0',
    borderSubtle: '#e2e8f0',
    borderDefault: '#cbd5e1',
    borderStrong: '#94a3b8',
    borderFocus: '#2563eb',
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    textDisabled: '#94a3b8',
    primary500: '#2563eb',
    primary600: '#1d4ed8',
    primaryGlow: 'rgba(37, 99, 235, 0.15)',
  },
} as const;

export const spacing = {
  space2: '2px',
  space4: '4px',
  space8: '8px',
  space12: '12px',
  space16: '16px',
  space20: '20px',
  space24: '24px',
  space32: '32px',
  space40: '40px',
  space48: '48px',
  space64: '64px',
} as const;

export const radii = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  glow: '0 0 20px rgba(59, 130, 246, 0.25)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '300ms ease-in-out',
} as const;

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;
