import React from 'react';

export interface WordCounterProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  minTarget?: number;
  maxTarget?: number;
}
