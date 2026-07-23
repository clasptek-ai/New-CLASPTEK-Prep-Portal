import React from 'react';
import { AssessmentProgress } from './AssessmentProgress';

export default {
  title: 'Assessment/AssessmentProgress',
  component: AssessmentProgress,
};

export const Default = () => (
  <AssessmentProgress
    currentSection="Listening Part 2"
    totalQuestions={40}
    answeredQuestions={15}
  />
);
