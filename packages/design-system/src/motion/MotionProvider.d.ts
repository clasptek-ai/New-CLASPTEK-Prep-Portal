import React from 'react';
import { motionTokens } from '@clasptek/design-tokens';
export interface MotionContextType {
  durations: typeof motionTokens.duration;
  easings: typeof motionTokens.easing;
  reducedMotion: boolean;
}
export declare const MotionProvider: React.FC<{
  children: React.ReactNode;
}>;
export declare const useMotion: () => MotionContextType;
