import React from 'react';

export type QuestionStatus =
  'visited' | 'answered' | 'unanswered' | 'flagged' | 'current' | 'disabled';

export interface QuestionPaletteItem {
  id: string;
  number: number;
  status: QuestionStatus;
}

export interface QuestionNavigatorProps extends React.HTMLAttributes<HTMLDivElement> {
  questions: QuestionPaletteItem[];
  currentQuestionId: string;
  onSelectQuestion: (id: string) => void;
}
