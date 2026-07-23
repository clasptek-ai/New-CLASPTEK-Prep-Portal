import React from 'react';
import { QuestionNavigator } from './QuestionNavigator';

export default {
  title: 'Assessment/QuestionNavigator',
  component: QuestionNavigator,
};

const questions = [
  { id: '1', number: 1, status: 'answered' as const },
  { id: '2', number: 2, status: 'flagged' as const },
  { id: '3', number: 3, status: 'unanswered' as const },
];

export const Default = () => (
  <QuestionNavigator questions={questions} currentQuestionId="1" onSelectQuestion={() => {}} />
);
