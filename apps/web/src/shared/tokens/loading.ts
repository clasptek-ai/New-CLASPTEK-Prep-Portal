export const loadingTokens = {
  spinner: {
    track: 'var(--border, rgba(4, 94, 173, 0.12))',
    indicator: 'var(--brand, #045EAD)',
    speed: '0.6s linear infinite',
  },
  skeleton: {
    base: 'var(--surface-1, #f1f5f9)',
    highlight: 'rgba(255, 255, 255, 0.6)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  progress: {
    track: 'var(--surface-1, #f1f5f9)',
    bar: 'var(--brand, #045EAD)',
    transition: 'width 200ms ease-out',
  },
} as const;
