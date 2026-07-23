import React from 'react';

export interface AudioPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  title?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}
