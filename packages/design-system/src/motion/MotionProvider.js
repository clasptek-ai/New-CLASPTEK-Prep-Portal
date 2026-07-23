import { jsx as _jsx } from 'react/jsx-runtime';
import React, { createContext, useContext } from 'react';
import { motionTokens } from '@clasptek/design-tokens';
const MotionContext = createContext({
  durations: motionTokens.duration,
  easings: motionTokens.easing,
  reducedMotion: false,
});
export const MotionProvider = ({ children }) => {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(media.matches);
      const listener = (e) => setReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);
  return _jsx(MotionContext.Provider, {
    value: { durations: motionTokens.duration, easings: motionTokens.easing, reducedMotion },
    children: children,
  });
};
export const useMotion = () => useContext(MotionContext);
