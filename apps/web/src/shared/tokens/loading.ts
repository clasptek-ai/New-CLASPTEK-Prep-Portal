export const loadingTokens = {
  spinner: {
    track: 'rgba(255, 255, 255, 0.1)',
    indicator: '#3b82f6',
    speed: '0.6s linear infinite',
  },
  skeleton: {
    base: 'var(--bg-surface-2, #1e293b)',
    highlight: 'rgba(255, 255, 255, 0.05)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  progress: {
    track: 'var(--bg-surface-2, #1e293b)',
    bar: 'var(--primary-500, #3b82f6)',
    transition: 'width 200ms ease-out',
  },
} as const;
