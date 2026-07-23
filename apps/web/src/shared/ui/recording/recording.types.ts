import React from 'react';

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export interface RecordingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: RecordingStatus;
  elapsedSeconds?: number;
}
