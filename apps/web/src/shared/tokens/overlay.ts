export const overlayTokens = {
  backdrop: {
    bg: 'rgba(11, 15, 25, 0.75)',
    blur: '4px',
  },
  zIndex: {
    backdrop: 1300,
    modal: 1400,
    drawer: 1450,
    popover: 1500,
    tooltip: 1600,
    toast: 1700,
  },
  animation: {
    duration: '200ms',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;
