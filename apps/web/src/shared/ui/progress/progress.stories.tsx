import React from 'react';
import { ProgressBar } from './ProgressBar';

export default {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
};

export const Default = () => <ProgressBar value={75} showValueLabel />;
