import React, { createContext, useContext } from 'react';
import { motionTokens } from '@clasptek/design-tokens';

export interface MotionContextType {
  durations: typeof motionTokens.duration;
  easings: typeof motionTokens.easing;
  reducedMotion: boolean;
}

const MotionContext = createContext<MotionContextType>({
  durations: motionTokens.duration,
  easings: motionTokens.easing,
  reducedMotion: false,
});

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  return (
    <MotionContext.Provider
      value={{ durations: motionTokens.duration, easings: motionTokens.easing, reducedMotion }}
    >
      {children}
    </MotionContext.Provider>
  );
};

export const useMotion = () => useContext(MotionContext);
