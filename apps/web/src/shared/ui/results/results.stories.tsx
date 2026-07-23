import React from 'react';
import { ScoreCard } from './ScoreCard';

export default {
  title: 'Assessment/ScoreCard',
  component: ScoreCard,
};

export const Default = () => (
  <ScoreCard testTitle="IELTS Full Mock" overallScore={8.5} bandDescriptor="Expert User" />
);
