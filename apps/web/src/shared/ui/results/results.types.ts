import React from 'react';

export interface ScoreCardProps extends React.HTMLAttributes<HTMLDivElement> {
  testTitle: string;
  overallScore: number | string;
  maxScore?: number | string;
  bandDescriptor?: string;
  dateCompleted?: string;
}
