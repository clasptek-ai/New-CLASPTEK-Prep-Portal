import React from 'react';

export type TimerMode = 'countdown' | 'elapsed';

export interface AssessmentTimerProps extends React.HTMLAttributes<HTMLDivElement> {
  seconds: number;
  mode?: TimerMode;
  isPaused?: boolean;
  onTimeExpired?: () => void;
  warningThresholdSeconds?: number;
  dangerThresholdSeconds?: number;
}
