import React from 'react';

export interface AssessmentProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  currentSection: string;
  totalQuestions: number;
  answeredQuestions: number;
}
