import React from 'react';
export interface Option {
  id: string;
  label: string;
  text: string;
}
export interface QuestionCardProps {
  questionNumber: number;
  stem: string;
  options: Option[];
  selectedOptionId?: string;
  onSelectOption?: (id: string) => void;
}
export declare const QuestionCard: React.FC<QuestionCardProps>;
