export const statusTokens = {
  success: {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: '#10b981',
    text: '#34d399',
    dot: '#10b981',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)',
    border: '#f59e0b',
    text: '#fbbf24',
    dot: '#f59e0b',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: '#ef4444',
    text: '#f87171',
    dot: '#ef4444',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: '#3b82f6',
    text: '#60a5fa',
    dot: '#3b82f6',
  },
  offline: {
    bg: 'rgba(148, 163, 184, 0.15)',
    border: '#64748b',
    text: '#94a3b8',
    dot: '#64748b',
  },
} as const;
