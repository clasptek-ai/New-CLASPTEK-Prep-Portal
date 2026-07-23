export const typography = {
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    hero: '2.5rem',
    displayLg: '2.0rem',
    headingXl: '1.5rem',
    headingMd: '1.25rem',
    titleSm: '1.0rem',
    bodyMd: '0.875rem',
    bodySm: '0.8125rem',
    caption: '0.75rem',
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
